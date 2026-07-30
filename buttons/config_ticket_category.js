/**
 * Button: config_ticket_category
 * Change la catégorie des tickets
 */

const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const ConfigModel = require('../models/Config');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'config_ticket_category',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const config = ConfigModel.getAll(guildId);

        const modal = new ModalBuilder()
            .setCustomId('config_ticket_category_modal')
            .setTitle('Modifier la catégorie des tickets');

        const categoryInput = new TextInputBuilder()
            .setCustomId('config_ticket_category')
            .setLabel('ID de la catégorie')
            .setPlaceholder('1234567890123456789')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setValue(config.ticket_category || '');

        const firstRow = new ActionRowBuilder().addComponents(categoryInput);
        modal.addComponents(firstRow);

        await interaction.showModal(modal);
    }
};
