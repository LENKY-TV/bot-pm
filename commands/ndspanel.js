const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ndspanel')
        .setDescription('Déployer le panel NDS (Note de Service)')
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Salon où déployer le panel')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const channel = interaction.options.getChannel('salon');

        const embed = new EmbedBuilder()
            .setTitle('📋 ・Note de Service')
            .setDescription(
                `Cliquez sur le bouton ci-dessous pour créer une **Note de Service**.\n\n` +
                `> 📝 Remplissez le formulaire (titre, contenu, couleur)\n` +
                `> 🖼️ Vous pourrez ensuite joindre une image\n` +
                `> ✅ Les agents devront confirmer la lecture sous **48h**\n\n` +
                `**Police Municipale de Paris**`
            )
            .setColor('#FF0000')
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ndspm_create')
                .setLabel('Créer un NDS')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('📋')
        );

        await channel.send({ embeds: [embed], components: [row] });
        await interaction.editReply({ content: `✅ Panel NDS déployé dans <#${channel.id}>` });
    }
};
