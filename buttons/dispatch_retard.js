const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'dispatch_retard',

    async execute(interaction, client) {
        const modal = new ModalBuilder()
            .setCustomId('dispatch_retard_modal')
            .setTitle('Justification du retard');

        const reasonInput = new TextInputBuilder()
            .setCustomId('retard_reason')
            .setLabel('Raison du retard')
            .setPlaceholder('Ex: Transport en commun, raison personnelle...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const timeInput = new TextInputBuilder()
            .setCustomId('retard_time')
            .setLabel('Heure d\'arrivée prévue')
            .setPlaceholder('Ex: 21h30')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const firstRow = new ActionRowBuilder().addComponents(reasonInput);
        const secondRow = new ActionRowBuilder().addComponents(timeInput);
        modal.addComponents(firstRow, secondRow);

        await interaction.showModal(modal);
    }
};
