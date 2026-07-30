/**
 * Button: config_title
 * Change le titre des embeds
 */

const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const ConfigModel = require('../models/Config');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'config_title',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const config = ConfigModel.getAll(guildId);

        const modal = new ModalBuilder()
            .setCustomId('config_title_modal')
            .setTitle('Modifier le titre');

        const titleInput = new TextInputBuilder()
            .setCustomId('config_title')
            .setLabel('Titre des embeds')
            .setPlaceholder('Police Municipale - Service RH')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setValue(config.embed_title || '');

        const firstRow = new ActionRowBuilder().addComponents(titleInput);
        modal.addComponents(firstRow);

        await interaction.showModal(modal);
    }
};
