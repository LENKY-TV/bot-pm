const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const AbsenceModel = require('../models/Absence');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'absence_modal',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;
        const startDate = interaction.fields.getTextInputValue('absence_start');
        const endDate = interaction.fields.getTextInputValue('absence_end');
        const reason = interaction.fields.getTextInputValue('absence_reason');

        const result = AbsenceModel.create({
            guild_id: guildId,
            user_id: userId,
            start_date: startDate,
            end_date: endDate,
            reason: reason
        });

        const embed = new EmbedBuilder()
            .setTitle('📋 ・Demande d\'absence envoyée')
            .setDescription(
                `> *Votre demande a été transmise aux administrateurs*\n\n` +
                `**━━━━━━━━━━━━━━━━━━━━━━━━━━━**\n\n` +
                `> 📅 **Début** ・ \`${startDate}\`\n` +
                `> 📅 **Fin** ・ \`${endDate}\`\n` +
                `> 📝 **Motif** ・ ${reason}\n` +
                `> 👤 **Agent** ・ <@${userId}>\n\n` +
                `**━━━━━━━━━━━━━━━━━━━━━━━━━━━**\n\n` +
                `> *En attente de validation par un administrateur*`
            )
            .setColor('#FFA500')
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

        // Notify admins
        try {
            const adminRole = interaction.guild.roles.cache.find(r => r.permissions.has('Administrator'));
            const adminChannel = interaction.guild.channels.cache.find(c => c.name.includes('admin') || c.name.includes('staff') || c.name.includes('log'));
            
            const notifEmbed = new EmbedBuilder()
                .setTitle('📩 ・Nouvelle demande d\'absence')
                .setDescription(
                    `> *Demande de <@${userId}>*\n\n` +
                    `**━━━━━━━━━━━━━━━━━━━━━━━━━━━**\n\n` +
                    `> 📅 **Début** ・ \`${startDate}\`\n` +
                    `> 📅 **Fin** ・ \`${endDate}\`\n` +
                    `> 📝 **Motif** ・ ${reason}\n\n` +
                    `**━━━━━━━━━━━━━━━━━━━━━━━━━━━**`
                )
                .setColor('#FFA500')
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`absence_approve_${result.lastInsertRowid}`)
                    .setLabel('Accepter')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅'),
                new ButtonBuilder()
                    .setCustomId(`absence_reject_${result.lastInsertRowid}`)
                    .setLabel('Refuser')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('❌')
            );

            const logChannel = interaction.guild.channels.cache.find(c => c.name.includes('log') || c.name.includes('absence'));
            if (logChannel) {
                const msg = await logChannel.send({ 
                    content: adminRole ? `<@&${adminRole.id}>` : null,
                    embeds: [notifEmbed], 
                    components: [row] 
                });
                AbsenceModel.create({ ...AbsenceModel.getById(result.lastInsertRowid), message_id: msg.id });
            }
        } catch (error) {
            Logger.error('Erreur notification absence', error);
        }

        Logger.info(`Demande d'absence de ${interaction.user.tag}: ${startDate} au ${endDate}`);
    }
};
