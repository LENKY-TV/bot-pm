const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sendpm')
        .setDescription('Envoyer un message personnalisé')
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Salon où envoyer le message')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

        const channel = interaction.options.getChannel('salon');

        const modal = new ModalBuilder()
            .setCustomId(`messagepm_modal_${channel.id}`)
            .setTitle('✉️・Message Personnalisé');

        const titleInput = new TextInputBuilder()
            .setCustomId('message_title')
            .setLabel('Titre du message')
            .setPlaceholder('Ex: Annonce importante')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const messageInput = new TextInputBuilder()
            .setCustomId('message_content')
            .setLabel('Contenu du message')
            .setPlaceholder('Tapez votre message ici...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(4000);

        const colorInput = new TextInputBuilder()
            .setCustomId('message_color')
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
