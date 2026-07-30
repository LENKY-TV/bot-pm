const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const AttendanceModel = require('../models/Attendance');

module.exports = {
    customId: 'attendance_btn_stop',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;

        const active = AttendanceModel.getActive(guildId).find(a => a.user_id === userId && !a.on_pause);

        if (!active) {
            return interaction.reply({ content: '❌ Vous n\'êtes pas en service.', ephemeral: true });
        }

        AttendanceModel.clockOut(guildId, userId, active.service_name);

        const allActive = AttendanceModel.getActive(guildId);
        let activeList = '';
        if (allActive.length === 0) {
            activeList = '*Aucun utilisateur n\'est en service... :(*';
        } else {
            allActive.forEach(a => {
                const clockIn = new Date(a.clock_in.replace(' ', 'T') + 'Z');
                const time = clockIn.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });
                const pauseStatus = a.on_pause ? ' `⏸ PAUSE`' : '';
                activeList += `> <@${a.user_id}>・\`${time}\`${pauseStatus}\n`;
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`👤 Utilisateurs en service - (${allActive.length})`)
            .setDescription(activeList)
            .setColor('#2b2d31')
            .setFooter({ text: '⚠️ Si le BOT ne répond pas, cela peut signifier qu\'il redémarre' })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('attendance_btn_start').setLabel('Démarrer son service').setStyle(ButtonStyle.Success).setEmoji('🟢'),
            new ButtonBuilder().setCustomId('attendance_btn_pause').setLabel('Prendre / Terminer sa pause').setStyle(ButtonStyle.Primary).setEmoji('⏸️'),
            new ButtonBuilder().setCustomId('attendance_btn_stop').setLabel('Terminer son service').setStyle(ButtonStyle.Danger).setEmoji('🔴')
        );

        await interaction.update({ embeds: [embed], components: [row] });
    }
};
