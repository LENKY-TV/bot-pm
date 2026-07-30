/**
 * Button: config_color
 * Change la couleur des embeds
 */

const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const ConfigModel = require('../models/Config');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'config_color',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const config = ConfigModel.getAll(guildId);

        const modal = new ModalBuilder()
            .setCustomId('config_color_modal')
            .setTitle('Modifier la couleur');

        const colorInput = new TextInputBuilder()
            .setCustomId('config_color')
            .setLabel('Couleur hexadécimal')
            .setPlaceholder('#1E3A5F')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setValue(config.embed_color || '#1E3A5F');

        const firstRow = new ActionRowBuilder().addComponents(colorInput);
        modal.addComponents(firstRow);

        await interaction.showModal(modal);
    }
};
