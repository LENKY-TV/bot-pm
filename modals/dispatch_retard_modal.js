const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { responses } = require('../utils/dispatchTracker');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'dispatch_retard_modal',

    async execute(interaction, client) {
        const userId = interaction.user.id;

        let foundMessageId = null;
        for (const [id, data] of responses.entries()) {
            if (data.channelId === interaction.channel.id) {
                foundMessageId = id;
                break;
            }
        }

        if (!foundMessageId) {
            return interaction.reply({ content: '❌ Dispatch introuvable.', ephemeral: true });
        }

        const data = responses.get(foundMessageId);
        const reason = interaction.fields.getTextInputValue('retard_reason');
        const arrivalTime = interaction.fields.getTextInputValue('retard_time');

        data.present = data.present.filter(id => id !== userId);
        data.retard = data.retard.filter(id => id !== userId);
        data.absent = data.absent.filter(id => id !== userId);

        if (!data.retard.includes(userId)) {
            data.retard.push(userId);
        }

        if (!data.retardJustifications) data.retardJustifications = {};
        data.retardJustifications[userId] = { reason, arrivalTime };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('dispatch_present')
                .setLabel(`Présent (${data.present.length})`)
                .setStyle(ButtonStyle.Success)
                .setEmoji('🟢'),
            new ButtonBuilder()
                .setCustomId('dispatch_retard')
                .setLabel(`Retard (${data.retard.length})`)
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🟠'),
            new ButtonBuilder()
                .setCustomId('dispatch_absent')
                .setLabel(`Absent (${data.absent.length})`)
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔴')
        );

        try {
            const channel = await client.channels.fetch(data.channelId);
            if (channel) {
                const msg = await channel.messages.fetch(foundMessageId);
                if (msg) await msg.edit({ components: [row] });
            }
        } catch (e) {}

        const embed = new EmbedBuilder()
            .setTitle('🟠 ・Retard enregistré')
            .setDescription(
                `> *Justification transmise*\n\n` +
                `**━━━━━━━━━━━━━━━━━━━━━━━━━━━**\n\n` +
                `> 📝 **Raison** ・ ${reason}\n` +
                `> 🕐 **Arrivée prévue** ・ ${arrivalTime}\n` +
                `> 👤 **Agent** ・ <@${userId}>\n\n` +
                `**━━━━━━━━━━━━━━━━━━━━━━━━━━━**`
            )
            .setColor('#FF8C00')
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

        Logger.info(`${interaction.user.tag} marqué en retard: ${reason} (arrivée ${arrivalTime})`);
    }
};
