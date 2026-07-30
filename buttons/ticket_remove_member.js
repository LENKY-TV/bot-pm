/**
 * Button: ticket_remove_member
 * Retire un membre du ticket
 */

const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const TicketModel = require('../models/Ticket');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'ticket_remove_member',

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
            .setCustomId('ticket_remove_member_modal')
            .setTitle('Retirer un membre');

        const memberInput = new TextInputBuilder()
            .setCustomId('member_id')
            .setLabel('ID du membre')
            .setPlaceholder('Entrez l\'ID Discord du membre')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const firstRow = new ActionRowBuilder().addComponents(memberInput);
        modal.addComponents(firstRow);

        await interaction.showModal(modal);
    }
};
