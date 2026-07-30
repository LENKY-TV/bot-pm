/**
 * Select Menu: rhconfig_service_edit
 * Modifie un service
 */

const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const ServiceModel = require('../models/Service');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'rhconfig_service_edit',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const serviceName = interaction.values[0];

        const service = ServiceModel.getByName(guildId, serviceName);
        if (!service) {
            return interaction.reply({
                content: '❌ Service introuvable.',
                ephemeral: true
            });
        }

        const modal = new ModalBuilder()
            .setCustomId('rhconfig_service_edit_modal')
            .setTitle(`Modifier ${serviceName}`);

        const emojiInput = new TextInputBuilder()
            .setCustomId('service_emoji')
            .setLabel('Emoji')
            .setPlaceholder('📋')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setValue(service.emoji);

        const colorInput = new TextInputBuilder()
            .setCustomId('service_color')
            .setLabel('Couleur')
            .setPlaceholder('#1E3A5F')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setValue(service.color);

        const descInput = new TextInputBuilder()
            .setCustomId('service_description')
            .setLabel('Description')
            .setPlaceholder('Description du service')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setValue(service.description || '');

        const firstRow = new ActionRowBuilder().addComponents(emojiInput);
        const secondRow = new ActionRowBuilder().addComponents(colorInput);
        const thirdRow = new ActionRowBuilder().addComponents(descInput);
        modal.addComponents(firstRow, secondRow, thirdRow);

        await interaction.showModal(modal);
    }
};
