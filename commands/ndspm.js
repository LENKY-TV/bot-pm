const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

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
                .setDescription('ID du rôle à ping')
                .setRequired(true)
        )
        .addAttachmentOption(option =>
            option.setName('image1')
                .setDescription('Image 1')
                .setRequired(false)
        )
        .addAttachmentOption(option =>
            option.setName('image2')
                .setDescription('Image 2')
                .setRequired(false)
        )
        .addAttachmentOption(option =>
            option.setName('image3')
                .setDescription('Image 3')
                .setRequired(false)
        )
        .addAttachmentOption(option =>
            option.setName('image4')
                .setDescription('Image 4')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

        const channel = interaction.options.getChannel('salon');
        const role = interaction.options.getString('role');
        const image1 = interaction.options.getAttachment('image1');
        const image2 = interaction.options.getAttachment('image2');
        const image3 = interaction.options.getAttachment('image3');
        const image4 = interaction.options.getAttachment('image4');

        // Stocker les images en DB
        const images = [image1, image2, image3, image4].filter(Boolean);
        if (images.length > 0) {
            const { run } = require('../config/database');
            run(
                'INSERT OR REPLACE INTO config (guild_id, key, value) VALUES (?, ?, ?)',
                [interaction.guild.id, `ndspm_images_${interaction.user.id}`, JSON.stringify(images.map(i => i.url))]
            );
        }

        const modal = new ModalBuilder()
            .setCustomId(`ndspm_modal_${channel.id}_${role}`)
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
