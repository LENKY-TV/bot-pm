/**
 * Modal: ticket_notes_modal
 * Ajoute des notes privées
 */

const { run } = require('../config/database');
const TicketModel = require('../models/Ticket');
const LogModel = require('../models/Log');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'ticket_notes_modal',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const channel = interaction.channel;
        const notes = interaction.fields.getTextInputValue('ticket_notes');

        const ticket = TicketModel.getByChannel(channel.id);
        if (!ticket) {
            return interaction.reply({
                content: '❌ Ce salon n\'est pas un ticket.',
                ephemeral: true
            });
        }

        try {
            run('INSERT INTO notes (ticket_id, author_id, content) VALUES (?, ?, ?)', [ticket.id, interaction.user.id, notes]);

            LogModel.create({
                guild_id: guildId,
                ticket_id: ticket.id,
                action: 'ticket_note_add',
                user_id: interaction.user.id,
                details: 'Note privée ajoutée'
            });

            Logger.info(`Note ajoutée au ticket #${ticket.ticket_number} par ${interaction.user.tag}`);

            const embed = EmbedUtils.success(guildId, '📝 Note ajoutée', 'Votre note privée a été enregistrée.');

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            Logger.error('Erreur lors de l\'ajout de la note', error);
            await interaction.reply({
                content: '❌ Une erreur est survenue.',
                ephemeral: true
            });
        }
    }
};
