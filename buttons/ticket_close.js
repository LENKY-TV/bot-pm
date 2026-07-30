/**
 * Button: ticket_close
 * Ferme un ticket
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const TicketModel = require('../models/Ticket');
const LogModel = require('../models/log');
const EmbedUtils = require('../utils/embedBuilder');
const TranscriptUtils = require('../utils/transcript');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'ticket_close',

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

        await interaction.deferReply();

        try {
            // Générer la transcription
            const transcript = await TranscriptUtils.generate(channel, ticket);

            // Calculer les statistiques
            const createdAt = new Date(ticket.created_at);
            const closedAt = new Date();
            const totalTime = Math.round((closedAt - createdAt) / 60000); // minutes

            // Fermer le ticket
            TicketModel.update(channel.id, {
                status: 'closed',
                closed_at: closedAt.toISOString()
            });

            // Logger l'action
            LogModel.create({
                guild_id: guildId,
                ticket_id: ticket.id,
                action: 'ticket_close',
                user_id: userId,
                details: `Fermé par ${interaction.user.tag}`
            });

            Logger.info(`Ticket #${ticket.ticket_number} fermé par ${interaction.user.tag}`);

            // Envoyer le transcript au créateur
            try {
                const creator = await client.users.fetch(ticket.creator_id);
                if (creator) {
                    const dmEmbed = EmbedUtils.create(guildId, {
                        title: `📋 Ticket #${ticket.ticket_number} fermé`,
                        description: 'Votre ticket a été fermé. Voici la transcription.',
                        fields: [
                            { name: 'Service', value: ticket.service, inline: true },
                            { name: 'Durée', value: `${totalTime} minutes`, inline: true },
                            { name: 'Messages', value: `${ticket.message_count}`, inline: true }
                        ],
                        color: '#FF0000'
                    });

                    if (transcript) {
                        await creator.send({ 
                            embeds: [dmEmbed],
                            files: [{ attachment: transcript, name: `ticket-${ticket.ticket_number}.html` }]
                        });
                    } else {
                        await creator.send({ embeds: [dmEmbed] });
                    }
                }
            } catch (error) {
                Logger.error('Erreur lors de l\'envoi du transcript en MP', error);
            }

            // Envoyer le transcript dans le salon de logs
            const config = require('../config/config');
            const logChannel = interaction.guild.channels.cache.find(c => c.name === config.ticketTranscriptChannel);
            
            if (logChannel && transcript) {
                const logEmbed = EmbedUtils.create(guildId, {
                    title: `📋 Transcript - Ticket #${ticket.ticket_number}`,
                    fields: [
                        { name: 'Créé par', value: `<@${ticket.creator_id}>`, inline: true },
                        { name: 'Service', value: ticket.service, inline: true },
                        { name: 'Durée', value: `${totalTime} minutes`, inline: true }
                    ]
                });

                await logChannel.send({
                    embeds: [logEmbed],
                    files: [{ attachment: transcript, name: `ticket-${ticket.ticket_number}.html` }]
                });
            }

            // Demander une évaluation
            const ratingEmbed = EmbedUtils.create(guildId, {
                title: '⭐ Évaluation',
                description: 'Donnez une note de 1 à 10 pour évaluer la qualité du service.',
                color: '#FFD700'
            });

            const ratingRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`ticket_rate_1`)
                    .setLabel('1')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId(`ticket_rate_2`)
                    .setLabel('2')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId(`ticket_rate_3`)
                    .setLabel('3')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId(`ticket_rate_4`)
                    .setLabel('4')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`ticket_rate_5`)
                    .setLabel('5')
                    .setStyle(ButtonStyle.Secondary)
            );

            const ratingRow2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`ticket_rate_6`)
                    .setLabel('6')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`ticket_rate_7`)
                    .setLabel('7')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`ticket_rate_8`)
                    .setLabel('8')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`ticket_rate_9`)
                    .setLabel('9')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`ticket_rate_10`)
                    .setLabel('10')
                    .setStyle(ButtonStyle.Success)
            );

            await interaction.editReply({ embeds: [ratingEmbed], components: [ratingRow, ratingRow2] });

            // Supprimer le salon après 60 secondes
            setTimeout(async () => {
                try {
                    await channel.delete();
                } catch (error) {
                    Logger.error('Erreur lors de la suppression du salon', error);
                }
            }, 60000);

        } catch (error) {
            Logger.error('Erreur lors de la fermeture du ticket', error);
            await interaction.editReply({
                content: '❌ Une erreur est survenue lors de la fermeture.',
                ephemeral: true
            });
        }
    }
};
