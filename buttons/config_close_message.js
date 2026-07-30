/**
 * Button: config_close_message
 * Change le message de fermeture
 */

const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const ConfigModel = require('../models/Config');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'config_close_message',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const config = ConfigModel.getAll(guildId);

        const modal = new ModalBuilder()
            .setCustomId('config_close_message_modal')
            .setTitle('Modifier le message de fermeture');

        const messageInput = new TextInputBuilder()
            .setCustomId('config_close_message')
            .setLabel('Message de fermeture')
            .setPlaceholder('Ce ticket a été fermé...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setValue(config.close_message || '');

        const firstRow = new ActionRowBuilder().addComponents(messageInput);
        modal.addComponents(firstRow);

        await interaction.showModal(modal);
    }
};
