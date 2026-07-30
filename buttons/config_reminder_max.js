/**
 * Button: config_reminder_max
 * Change le nombre maximum de relances
 */

const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const ConfigModel = require('../models/Config');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'config_reminder_max',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const config = ConfigModel.getAll(guildId);

        const modal = new ModalBuilder()
            .setCustomId('config_reminder_max_modal')
            .setTitle('Modifier le max de relances');

        const maxInput = new TextInputBuilder()
            .setCustomId('config_reminder_max')
            .setLabel('Nombre maximum')
            .setPlaceholder('3')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setValue(config.reminder_max || '3');

        const firstRow = new ActionRowBuilder().addComponents(maxInput);
        modal.addComponents(firstRow);

        await interaction.showModal(modal);
    }
};
