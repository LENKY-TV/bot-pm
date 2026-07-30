/**
 * Button: config_welcome_message
 * Change le message de bienvenue
 */

const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const ConfigModel = require('../models/Config');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'config_welcome_message',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const config = ConfigModel.getAll(guildId);

        const modal = new ModalBuilder()
            .setCustomId('config_welcome_message_modal')
            .setTitle('Modifier le message de bienvenue');

        const messageInput = new TextInputBuilder()
            .setCustomId('config_welcome_message')
            .setLabel('Message de bienvenue')
            .setPlaceholder('Bienvenue dans votre ticket {service}...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setValue(config.welcome_message || '');

        const firstRow = new ActionRowBuilder().addComponents(messageInput);
        modal.addComponents(firstRow);

        await interaction.showModal(modal);
    }
};
