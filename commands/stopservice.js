const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const AttendanceModel = require('../models/Attendance');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stopservice')
        .setDescription('Arrêter le service de quelqu\'un')
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Membre dont vous voulez arrêter le service')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const targetUser = interaction.options.getUser('membre');

        const active = AttendanceModel.getActive(guildId).filter(a => a.user_id === targetUser.id);

        if (active.length === 0) {
            return interaction.reply({
                content: `❌ ${targetUser.username} n'est pas en service.`,
                flags: 64
            });
        }

        // Stop all active services for this user
        for (const record of active) {
            AttendanceModel.clockOut(guildId, targetUser.id, record.service_name);
        }

        const embed = new EmbedBuilder()
            .setTitle('🔴 ・Service arrêté')
            .setDescription(
                `> *Service de l'agent arrêté par un admin*\n\n` +
                `**━━━━━━━━━━━━━━━━━━━━━━━━━━━**\n\n` +
                `> 👤 **Agent** ・ <@${targetUser.id}>\n` +
                `> 🛑 **Arrêté par** ・ <@${interaction.user.id}>\n` +
                `> 📋 **Services** ・ ${active.map(a => a.service_name).join(', ')}\n\n` +
                `**━━━━━━━━━━━━━━━━━━━━━━━━━━━**`
            )
            .setColor('#FF0000')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // Update the main panel
        try {
            const panelChannel = interaction.guild.channels.cache.find(c => c.name.includes('service') || c.name.includes('pointeuse'));
            if (panelChannel) {
                const messages = await panelChannel.messages.fetch({ limit: 10 });
                const panelMsg = messages.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes('Utilisateurs en service'));
                if (panelMsg) {
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

                    const panelEmbed = new EmbedBuilder()
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

                    await panelMsg.edit({ embeds: [panelEmbed], components: [row] });
                }
            }
        } catch (e) {}
    }
};
