const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('messagepm')
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
            .setTitle('Envoyer un message');

        const messageInput = new TextInputBuilder()
            .setCustomId('message_content')
            .setLabel('Message à envoyer')
            .setPlaceholder('Tapez votre message ici... Utilisez <@ID> pour ping un utilisateur ou <@&ID> pour ping un rôle')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(4000);

        const row = new ActionRowBuilder().addComponents(messageInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }
};
