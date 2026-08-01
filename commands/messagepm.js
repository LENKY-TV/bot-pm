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
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Message à envoyer')
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('ping1')
                .setDescription('Ping un utilisateur (optionnel)')
                .setRequired(false)
        )
        .addUserOption(option =>
            option.setName('ping2')
                .setDescription('Ping un utilisateur (optionnel)')
                .setRequired(false)
        )
        .addUserOption(option =>
            option.setName('ping3')
                .setDescription('Ping un utilisateur (optionnel)')
                .setRequired(false)
        )
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Ping un rôle (optionnel)')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        const channel = interaction.options.getChannel('salon');
        const message = interaction.options.getString('message');
        const ping1 = interaction.options.getUser('ping1');
        const ping2 = interaction.options.getUser('ping2');
        const ping3 = interaction.options.getUser('ping3');
        const role = interaction.options.getRole('role');

        let finalMessage = message;

        if (ping1) finalMessage = `<@${ping1.id}> ${finalMessage}`;
        if (ping2) finalMessage = `<@${ping2.id}> ${finalMessage}`;
        if (ping3) finalMessage = `<@${ping3.id}> ${finalMessage}`;
        if (role) finalMessage = `<@&${role.id}> ${finalMessage}`;

        try {
            await channel.send(finalMessage);

            await interaction.reply({
                content: `✅ Message envoyé dans ${channel} !`,
                flags: 64
            });
        } catch (error) {
            await interaction.reply({
                content: '❌ Erreur lors de l\'envoi du message.',
                flags: 64
            });
        }
    }
};
