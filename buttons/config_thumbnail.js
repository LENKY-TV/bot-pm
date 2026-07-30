/**
 * Button: config_thumbnail
 * Change la thumbnail des embeds
 */

const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const ConfigModel = require('../models/Config');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'config_thumbnail',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const config = ConfigModel.getAll(guildId);

        const modal = new ModalBuilder()
            .setCustomId('config_thumbnail_modal')
            .setTitle('Modifier la thumbnail');

        const thumbnailInput = new TextInputBuilder()
            .setCustomId('config_thumbnail')
            .setLabel('URL de la thumbnail')
            .setPlaceholder('https://example.com/thumbnail.png')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setValue(config.embed_thumbnail || '');

        const firstRow = new ActionRowBuilder().addComponents(thumbnailInput);
        modal.addComponents(firstRow);

        await interaction.showModal(modal);
    }
};
