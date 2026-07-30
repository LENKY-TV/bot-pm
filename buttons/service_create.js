/**
 * Button: service_create
 * Crée un nouveau service
 */

const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'service_create',

    async execute(interaction, client) {
        const modal = new ModalBuilder()
            .setCustomId('rhconfig_service_create_modal')
            .setTitle('Créer un service');

        const nameInput = new TextInputBuilder()
            .setCustomId('service_name')
            .setLabel('Nom du service')
            .setPlaceholder('Nouveau service')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const emojiInput = new TextInputBuilder()
            .setCustomId('service_emoji')
            .setLabel('Emoji')
            .setPlaceholder('📋')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const colorInput = new TextInputBuilder()
            .setCustomId('service_color')
            .setLabel('Couleur hexadécimale')
            .setPlaceholder('#1E3A5F')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const categoryInput = new TextInputBuilder()
            .setCustomId('service_category')
            .setLabel('ID de la catégorie')
            .setPlaceholder('1234567890123456789')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const roleInput = new TextInputBuilder()
            .setCustomId('service_role')
            .setLabel('ID du rôle (séparer par ; pour multi)')
            .setPlaceholder('1234567890123456789')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const descInput = new TextInputBuilder()
            .setCustomId('service_description')
            .setLabel('Description')
            .setPlaceholder('Description du service')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);

        const firstRow = new ActionRowBuilder().addComponents(nameInput);
        const secondRow = new ActionRowBuilder().addComponents(emojiInput);
        const thirdRow = new ActionRowBuilder().addComponents(colorInput);
        const fourthRow = new ActionRowBuilder().addComponents(categoryInput);
        const fifthRow = new ActionRowBuilder().addComponents(roleInput);
        const sixthRow = new ActionRowBuilder().addComponents(descInput);
        modal.addComponents(firstRow, secondRow, thirdRow, fourthRow, fifthRow, sixthRow);

        await interaction.showModal(modal);
    }
};
