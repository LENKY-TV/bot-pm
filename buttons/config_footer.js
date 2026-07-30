/**
 * Button: config_footer
 * Change le footer des embeds
 */

const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const ConfigModel = require('../models/Config');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'config_footer',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const config = ConfigModel.getAll(guildId);

        const modal = new ModalBuilder()
            .setCustomId('config_footer_modal')
            .setTitle('Modifier le footer');

        const footerInput = new TextInputBuilder()
            .setCustomId('config_footer')
            .setLabel('Footer des embeds')
            .setPlaceholder('Police Municipale RH')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setValue(config.embed_footer || '');

        const firstRow = new ActionRowBuilder().addComponents(footerInput);
        modal.addComponents(firstRow);

        await interaction.showModal(modal);
    }
};
