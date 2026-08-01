const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const AbsenceModel = require('../models/Absence');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('absence')
        .setDescription('Système de gestion des absences')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        const embed = new EmbedBuilder()
            .setTitle('📌 ・Informations • Absences')
            .setDescription(
                `Bienvenue dans le système de gestion des absences.\n\n` +
                `Pour déclarer une nouvelle absence, cliquez sur le bouton ci-dessous.\n\n` +
                `**━━━━━━━━━━━━━━━━━━━━━━━━━━━**`
            )
            .setColor('#1a1a2e')
            .setFooter({ text: `${interaction.guild.name} • ${new Date().toLocaleDateString('fr-FR')}` })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('absence_declare')
                .setLabel('Déclarer une absence')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📝')
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};
