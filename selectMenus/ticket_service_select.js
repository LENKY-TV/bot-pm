/**
 * Select Menu: ticket_service_select
 * Sélection de service pour créer un ticket
 */

const { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const TicketModel = require('../models/Ticket');
const ServiceModel = require('../models/Service');
const ConfigModel = require('../models/Config');
const LogModel = require('../models/Log');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'ticket_service_select',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const guild = interaction.guild;
        const userId = interaction.user.id;
        const serviceName = interaction.values[0];

        await interaction.deferReply({ ephemeral: true });

        // Vérifier les tickets ouverts
        const openTickets = TicketModel.getOpenByUser(userId, guildId);
        const config = require('../config/config');

        if (openTickets.length >= (config.maxTicketsPerUser || 3)) {
            return interaction.editReply({ content: '❌ Vous avez déjà le maximum de tickets ouverts.' });
        }

        const existingTicket = openTickets.find(t => t.service === serviceName);
        if (existingTicket) {
            return interaction.editReply({ content: `❌ Vous avez déjà un ticket ouvert pour le service **${serviceName}**.` });
        }

        // Récupérer le service
        const service = ServiceModel.getByName(guildId, serviceName);
        if (!service) {
            return interaction.editReply({ content: '❌ Service introuvable.' });
        }

        try {
            // Récupérer la catégorie
            let category = null;
            if (service.category_id) {
                category = guild.channels.cache.get(service.category_id);
                // Si pas en cache, essayer de la récupérer
                if (!category) {
                    try {
                        category = await guild.channels.fetch(service.category_id);
                    } catch (e) {
                        category = null;
                    }
                }
            }

            // Si pas de catégorie trouvée, créer une nouvelle
            if (!category) {
                category = await guild.channels.create({
                    name: `Tickets - ${serviceName}`,
                    type: ChannelType.GuildCategory
                });
                ServiceModel.update(guildId, serviceName, { category_id: category.id });
            }

            // Récupérer le(s) rôle(s) du service
            let serviceRoles = [];
            if (service.role_id) {
                // Supporter les multi-roles séparés par ;
                const roleIds = service.role_id.split(';').map(id => id.trim());
                for (const roleId of roleIds) {
                    if (!roleId) continue;
                    let role = guild.roles.cache.get(roleId);
                    if (!role) {
                        try {
                            role = await guild.roles.fetch(roleId);
                        } catch (e) {
                            Logger.warn(`Rôle ${roleId} introuvable pour le service ${serviceName}`);
                        }
                    }
                    if (role) serviceRoles.push(role);
                }
            }

            // Créer le salon du ticket
            const ticketNumber = TicketModel.getNextNumber(guildId);
            const channelName = `${serviceName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${interaction.user.username}`;

            // Permissions du salon - UNIQUEMENT le créateur et les admins
            const permissions = [
                {
                    id: guild.id,
                    deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                },
                {
                    id: userId,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.EmbedLinks,
                        PermissionFlagsBits.AttachFiles
                    ]
                },
                {
                    id: client.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.EmbedLinks,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.ManageMessages
                    ]
                }
            ];

            const ticketChannel = await guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: permissions
            });

            // Enregistrer le ticket
            TicketModel.create({
                ticket_number: ticketNumber,
                guild_id: guildId,
                channel_id: ticketChannel.id,
                creator_id: userId,
                service: serviceName,
                category_id: category.id,
                channel_name: channelName
            });

            LogModel.create({
                guild_id: guildId,
                ticket_id: ticketNumber,
                action: 'ticket_open',
                user_id: userId,
                details: `Service: ${serviceName}`
            });

            Logger.info(`Ticket #${ticketNumber} ouvert par ${interaction.user.tag} pour ${serviceName}`);

            // Embed du ticket
            const now = new Date();
            const embed = EmbedUtils.ticket(guildId, {
                ticketNumber,
                service: { name: serviceName, emoji: service.emoji, color: service.color },
                priority: 'Normal',
                description: `Ticket créé par ${interaction.user}`,
                fields: [
                    { name: '📋 Numéro', value: `#${ticketNumber}`, inline: true },
                    { name: '👤 Créé par', value: `${interaction.user}`, inline: true },
                    { name: '🏷️ Service', value: serviceName, inline: true },
                    { name: '📅 Date', value: now.toLocaleDateString('fr-FR'), inline: true },
                    { name: '🕐 Heure', value: now.toLocaleTimeString('fr-FR'), inline: true },
                    { name: '🆔 ID', value: userId, inline: true }
                ],
                author: {
                    name: interaction.user.tag,
                    iconURL: interaction.user.displayAvatarURL()
                },
                color: service.color
            });

            // Boutons du ticket
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ticket_claim').setLabel('Prendre en charge').setStyle(ButtonStyle.Primary).setEmoji('📋'),
                new ButtonBuilder().setCustomId('ticket_rename').setLabel('Renommer').setStyle(ButtonStyle.Secondary).setEmoji('✏️'),
                new ButtonBuilder().setCustomId('ticket_priority').setLabel('Priorité').setStyle(ButtonStyle.Primary).setEmoji('🎯'),
                new ButtonBuilder().setCustomId('ticket_add_member').setLabel('Ajouter membre').setStyle(ButtonStyle.Secondary).setEmoji('➕'),
                new ButtonBuilder().setCustomId('ticket_remove_member').setLabel('Retirer membre').setStyle(ButtonStyle.Secondary).setEmoji('➖')
            );

            const row2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ticket_notes').setLabel('Notes').setStyle(ButtonStyle.Secondary).setEmoji('📝'),
                new ButtonBuilder().setCustomId('ticket_lock').setLabel('Verrouiller').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
                new ButtonBuilder().setCustomId('ticket_unlock').setLabel('Déverrouiller').setStyle(ButtonStyle.Success).setEmoji('🔓'),
                new ButtonBuilder().setCustomId('ticket_transcript').setLabel('Transcript').setStyle(ButtonStyle.Secondary).setEmoji('📄'),
                new ButtonBuilder().setCustomId('ticket_close').setLabel('Fermer').setStyle(ButtonStyle.Danger).setEmoji('❌')
            );

            // Envoyer l'embed
            await ticketChannel.send({ embeds: [embed], components: [row, row2] });

            // Ping le(s) rôle(s)
            if (serviceRoles.length > 0) {
                const roleMentions = serviceRoles.map(r => `${r}`).join(' ');
                await ticketChannel.send({
                    content: `${roleMentions} - Nouveau ticket créé par ${interaction.user}`
                });
            }

            // Répondre à l'utilisateur
            await interaction.editReply({
                content: `✅ Ticket #${ticketNumber} créé avec succès ! ${ticketChannel}`
            });

        } catch (error) {
            Logger.error('Erreur lors de la création du ticket', error);
            await interaction.editReply({ content: '❌ Une erreur est survenue lors de la création du ticket.' });
        }
    }
};
