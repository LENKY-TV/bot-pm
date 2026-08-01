const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');

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
            option.setName('titre')
                .setDescription('Titre du message')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Contenu du message')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('couleur')
                .setDescription('Couleur hex (ex: #FF0000)')
                .setRequired(false)
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
        const titre = interaction.options.getString('titre');
        const message = interaction.options.getString('message');
        const couleur = interaction.options.getString('couleur') || '#1a1a2e';
        const ping1 = interaction.options.getUser('ping1');
        const ping2 = interaction.options.getUser('ping2');
        const ping3 = interaction.options.getUser('ping3');
        const role = interaction.options.getRole('role');

        let pings = '';
        if (role) pings += `<@&${role.id}> `;
        if (ping1) pings += `<@${ping1.id}> `;
        if (ping2) pings += `<@${ping2.id}> `;
        if (ping3) pings += `<@${ping3.id}> `;

        const embed = new EmbedBuilder()
            .setTitle(titre)
            .setDescription(message)
            .setColor(couleur)
            .setFooter({ text: `${interaction.guild.name} RH` })
            .setTimestamp();

        try {
            await channel.send({
                content: pings || null,
                embeds: [embed]
            });

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
