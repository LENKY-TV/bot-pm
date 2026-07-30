/**
 * Commande: /rio
 * Formulaire pour attribuer un RIO à un membre
 */

const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rio')
        .setDescription('Attribuer un RIO à un membre')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        const modal = new ModalBuilder()
            .setCustomId('rio_modal')
            .setTitle('Attribution RIO');

        const idInput = new TextInputBuilder()
            .setCustomId('rio_user_id')
            .setLabel('ID du membre')
            .setPlaceholder('Ex: 1489721109350715773')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const rioInput = new TextInputBuilder()
            .setCustomId('rio_number')
            .setLabel('Numéro RIO (7 chiffres)')
            .setPlaceholder('Ex: 6452182')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(7)
            .setMaxLength(7);

        const firstRow = new ActionRowBuilder().addComponents(idInput);
        const secondRow = new ActionRowBuilder().addComponents(rioInput);
        modal.addComponents(firstRow, secondRow);

        await interaction.showModal(modal);
    }
};
