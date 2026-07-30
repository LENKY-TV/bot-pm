/**
 * Button: ticket_notes
 * Ajouter des notes privées
 */

const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const TicketModel = require('../models/Ticket');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'ticket_notes',

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

        const modal = new ModalBuilder()
            .setCustomId('ticket_notes_modal')
            .setTitle('Notes privées');

        const notesInput = new TextInputBuilder()
            .setCustomId('ticket_notes')
            .setLabel('Note privée')
            .setPlaceholder('Entrez votre note (invisible pour le créateur)')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1000);

        const firstRow = new ActionRowBuilder().addComponents(notesInput);
        modal.addComponents(firstRow);

        await interaction.showModal(modal);
    }
};
