/**
 * Button: config_log_channel
 * Change le salon des logs
 */

const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const ConfigModel = require('../models/Config');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'config_log_channel',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const config = ConfigModel.getAll(guildId);

        const modal = new ModalBuilder()
            .setCustomId('config_log_channel_modal')
            .setTitle('Modifier le salon des logs');

        const channelInput = new TextInputBuilder()
            .setCustomId('config_log_channel')
            .setLabel('ID du salon')
            .setPlaceholder('1234567890123456789')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setValue(config.log_channel || '');

        const firstRow = new ActionRowBuilder().addComponents(channelInput);
        modal.addComponents(firstRow);

        await interaction.showModal(modal);
    }
};
