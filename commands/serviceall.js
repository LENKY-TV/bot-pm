const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const AttendanceModel = require('../models/Attendance');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serviceall')
        .setDescription('Afficher les temps de service de la semaine')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const stats = AttendanceModel.getWeeklyStats(guildId);

        if (stats.length === 0) {
            return interaction.reply({ content: '❌ Aucun service enregistré cette semaine.', ephemeral: true });
        }

        let description = '';
        let rank = 1;

        for (const stat of stats) {
            const hours = Math.floor(stat.total_minutes / 60);
            const mins = stat.total_minutes % 60;
            const medals = ['🥇', '🥈', '🥉'];
            const medal = rank <= 3 ? medals[rank - 1] : `\`${rank}\``;

            description += `${medal} <@${stat.user_id}> ― \`${hours}h ${mins}min\` ・ \`${stat.total_sessions}\` session(s)\n`;
            rank++;
        }

        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        const dateRange = `${weekStart.toLocaleDateString('fr-FR')} au ${now.toLocaleDateString('fr-FR')}`;

        const embed = new EmbedBuilder()
            .setTitle('📊 ・Statistiques Hebdomadaires')
            .setDescription(description)
            .setColor('#1a1a2e')
            .setFooter({ text: `📅 ${dateRange}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
