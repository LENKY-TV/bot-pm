const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'ndspm_create',

    async execute(interaction, client) {
        const modal = new ModalBuilder()
            .setCustomId(`ndspm_modal_panel_${interaction.channel.id}`)
            .setTitle('📋・Note de Service');

        const titleInput = new TextInputBuilder()
            .setCustomId('nds_title')
            .setLabel('Titre du NDS')
            .setPlaceholder('Ex: Note de Service - Formation')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const messageInput = new TextInputBuilder()
            .setCustomId('nds_content')
            .setLabel('Contenu du NDS')
            .setPlaceholder('Rédigez votre note de service ici...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(4000);

        const roleInput = new TextInputBuilder()
            .setCustomId('nds_role')
            .setLabel('ID du rôle à ping')
            .setPlaceholder('Ex: 1489721198073090078')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const colorInput = new TextInputBuilder()
            .setCustomId('nds_color')
            .setLabel('Couleur (optionnel)')
            .setPlaceholder('#FF0000 ou laissez vide pour défaut')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const firstRow = new ActionRowBuilder().addComponents(titleInput);
        const secondRow = new ActionRowBuilder().addComponents(messageInput);
        const thirdRow = new ActionRowBuilder().addComponents(roleInput);
        const fourthRow = new ActionRowBuilder().addComponents(colorInput);
        modal.addComponents(firstRow, secondRow, thirdRow, fourthRow);

        await interaction.showModal(modal);
    }
};
