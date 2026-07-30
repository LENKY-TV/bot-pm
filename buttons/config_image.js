/**
 * Button: config_image
 * Change l'image des embeds
 */

const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const ConfigModel = require('../models/Config');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'config_image',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const config = ConfigModel.getAll(guildId);

        const modal = new ModalBuilder()
            .setCustomId('config_image_modal')
            .setTitle('Modifier l\'image');

        const imageInput = new TextInputBuilder()
            .setCustomId('config_image')
            .setLabel('URL de l\'image')
            .setPlaceholder('https://example.com/image.png')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setValue(config.embed_image || '');

        const firstRow = new ActionRowBuilder().addComponents(imageInput);
        modal.addComponents(firstRow);

        await interaction.showModal(modal);
    }
};
