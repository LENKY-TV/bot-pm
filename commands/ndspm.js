const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, AttachmentBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ndspm')
        .setDescription('Envoyer un NDS (Note de Service) avec accusé de réception')
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Salon où envoyer le message')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        )
        .addStringOption(option =>
            option.setName('role')
                .setDescription('Rôle à ping')
                .setRequired(true)
        )
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('Image à joindre au NDS (optionnel)')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

        const channel = interaction.options.getChannel('salon');
        const role = interaction.options.getString('role');
        const image = interaction.options.getAttachment('image');

        const modal = new ModalBuilder()
            .setCustomId(`ndspm_modal_${channel.id}_${role}${image ? '_' + image.url : ''}`)
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

        const colorInput = new TextInputBuilder()
            .setCustomId('nds_color')
            .setLabel('Couleur (optionnel)')
            .setPlaceholder('#FF0000 ou laissez vide pour défaut')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const firstRow = new ActionRowBuilder().addComponents(titleInput);
        const secondRow = new ActionRowBuilder().addComponents(messageInput);
        const thirdRow = new ActionRowBuilder().addComponents(colorInput);
        modal.addComponents(firstRow, secondRow, thirdRow);

        await interaction.showModal(modal);
    }
};
