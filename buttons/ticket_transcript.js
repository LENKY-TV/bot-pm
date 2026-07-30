/**
 * Button: ticket_transcript
 * Génère une transcription du ticket
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const TicketModel = require('../models/Ticket');
const LogModel = require('../models/log');
const TranscriptUtils = require('../utils/transcript');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'ticket_transcript',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const channel = interaction.channel;

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

            if (!transcript) {
                return interaction.editReply({
                    content: '❌ Erreur lors de la génération du transcript.'
                });
            }

            // Logger l'action
            LogModel.create({
                guild_id: guildId,
                ticket_id: ticket.id,
                action: 'ticket_transcript',
                user_id: interaction.user.id,
                details: 'Transcript généré'
            });

            Logger.info(`Transcript généré pour le ticket #${ticket.ticket_number} par ${interaction.user.tag}`);

            const embed = EmbedUtils.success(guildId, '📄 Transcript généré', 'La transcription a été générée avec succès.');

            await interaction.editReply({
                embeds: [embed],
                files: [{ attachment: transcript, name: `ticket-${ticket.ticket_number}.html` }]
            });
        } catch (error) {
            Logger.error('Erreur lors de la génération du transcript', error);
            await interaction.editReply({
                content: '❌ Une erreur est survenue lors de la génération du transcript.'
            });
        }
    }
};
