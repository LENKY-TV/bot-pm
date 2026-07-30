/**
 * Button: ticket_rename
 * Renomme un ticket
 */

const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const TicketModel = require('../models/Ticket');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'ticket_rename',

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
            .setCustomId('ticket_rename_modal')
            .setTitle('Renommer le ticket');

        const nameInput = new TextInputBuilder()
            .setCustomId('ticket_name')
            .setLabel('Nouveau nom du ticket')
            .setPlaceholder('Entrez le nouveau nom')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(32);

        const firstRow = new ActionRowBuilder().addComponents(nameInput);
        modal.addComponents(firstRow);

        await interaction.showModal(modal);
    }
};
