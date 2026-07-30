/**
 * Button: config_reminder_interval
 * Change l'intervalle des relances
 */

const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const ConfigModel = require('../models/Config');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'config_reminder_interval',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const config = ConfigModel.getAll(guildId);

        const modal = new ModalBuilder()
            .setCustomId('config_reminder_interval_modal')
            .setTitle('Modifier l\'intervalle des relances');

        const intervalInput = new TextInputBuilder()
            .setCustomId('config_reminder_interval')
            .setLabel('Intervalle en heures')
            .setPlaceholder('24')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setValue(config.reminder_interval || '24');

        const firstRow = new ActionRowBuilder().addComponents(intervalInput);
        modal.addComponents(firstRow);

        await interaction.showModal(modal);
    }
};
