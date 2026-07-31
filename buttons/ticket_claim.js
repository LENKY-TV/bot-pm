/**
 * Button: ticket_claim
 * Prendre en charge un ticket
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const TicketModel = require('../models/Ticket');
const StaffModel = require('../models/Staff');
const ClaimModel = require('../models/Claim');
const LogModel = require('../models/Log');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'ticket_claim',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const channel = interaction.channel;
        const userId = interaction.user.id;

        // Vérifier que c'est un salon de ticket
        const ticket = TicketModel.getByChannel(channel.id);
        if (!ticket) {
            return interaction.reply({
                content: '❌ Ce salon n\'est pas un ticket.',
                ephemeral: true
            });
        }

        // Vérifier si le ticket est déjà pris en charge
        if (ticket.claimed_by) {
            return interaction.reply({
                content: `❌ Ce ticket est déjà pris en charge par <@${ticket.claimed_by}>.`,
                ephemeral: true
            });
        }

        await interaction.deferReply();

        // Calculer le temps de réponse
        const createdAt = new Date(ticket.created_at);
        const now = new Date();
        const responseTime = Math.round((now - createdAt) / 60000); // en minutes

        // Prendre en charge le ticket
        TicketModel.update(channel.id, {
            claimed_by: userId,
            claimed_at: now.toISOString(),
            first_response_at: now.toISOString()
        });

        // Enregistrer le claim
        ClaimModel.create({
            ticket_id: ticket.id,
            agent_id: userId
        });

        // Mettre à jour les stats de l'agent
        StaffModel.incrementHandled(userId, guildId);
        StaffModel.updateResponseTime(userId, guildId, responseTime);

        // Logger l'action
        LogModel.create({
            guild_id: guildId,
            ticket_id: ticket.id,
            action: 'ticket_claim',
            user_id: userId,
            details: `Pris en charge par ${interaction.user.tag}`
        });

        Logger.info(`Ticket #${ticket.ticket_number} pris en charge par ${interaction.user.tag}`);

        // Mettre à jour l'embed
        const embed = EmbedUtils.create(guildId, {
            title: '✅ Ticket pris en charge',
            description: `Ce ticket a été pris en charge par ${interaction.user}.`,
            fields: [
                {
                    name: '📋 Détails',
                    value: [
                        `**Agent:** ${interaction.user}`,
                        `**Temps de réponse:** ${responseTime} minute(s)`,
                        `**Service:** ${ticket.service}`
                    ].join('\n'),
                    inline: false
                }
            ],
            color: '#00FF00'
        });

        // Modifier les boutons
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_rename')
                .setLabel('Renommer')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('✏️'),
            new ButtonBuilder()
                .setCustomId('ticket_priority')
                .setLabel('Priorité')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🎯'),
            new ButtonBuilder()
                .setCustomId('ticket_notes')
                .setLabel('Notes')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📝'),
            new ButtonBuilder()
                .setCustomId('ticket_lock')
                .setLabel('Verrouiller')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔒'),
            new ButtonBuilder()
                .setCustomId('ticket_close')
                .setLabel('Fermer')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('❌')
        );

        await interaction.editReply({ embeds: [embed], components: [row] });

        // Mettre à jour l'embed principal du ticket
        try {
            const messages = await channel.messages.fetch({ limit: 5 });
            const mainMessage = messages.find(m => m.author.id === client.user.id && m.embeds.length > 0);
            
            if (mainMessage) {
                const updatedEmbed = EmbedUtils.ticket(guildId, {
                    ticketNumber: ticket.ticket_number,
                    service: { name: ticket.service, emoji: '📋', color: '#3498DB' },
                    priority: ticket.priority,
                    description: `Pris en charge par ${interaction.user}`,
                    fields: [
                        { name: 'Créé par', value: `<@${ticket.creator_id}>`, inline: true },
                        { name: 'Service', value: ticket.service, inline: true },
                        { name: 'Priorité', value: ticket.priority, inline: true },
                        { name: 'Agent', value: `${interaction.user}`, inline: true },
                        { name: 'Temps de réponse', value: `${responseTime} min`, inline: true }
                    ],
                    author: {
                        name: interaction.user.tag,
                        iconURL: interaction.user.displayAvatarURL()
                    }
                });

                await mainMessage.edit({ embeds: [updatedEmbed] });
            }
        } catch (error) {
            Logger.error('Erreur lors de la mise à jour de l\'embed principal', error);
        }
    }
};
