const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'ndspm_modal_',

    async execute(interaction, client) {
        const parts = interaction.customId.split('_');
        const channelId = parts[2];
        const roleId = parts.slice(3).join('_');

        const title = interaction.fields.getTextInputValue('nds_title');
        const content = interaction.fields.getTextInputValue('nds_content');
        const color = interaction.fields.getTextInputValue('nds_color') || '#FF0000';

        const embed = new EmbedBuilder()
            .setTitle(`📋 ・${title}`)
            .setDescription(content)
            .setColor(color)
            .setFooter({ text: '⚠️ Vous devez confirmer la lecture sous 48h' })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`ndspm_ack`)
                .setLabel('Lu et approuvé')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅')
        );

        try {
            const channel = await client.channels.fetch(channelId);
            if (!channel) {
                return interaction.reply({ content: '❌ Salon introuvable.', ephemeral: true });
            }

            const msg = await channel.send({ content: `<@&${roleId}>`, embeds: [embed], components: [row] });

            // Sauvegarder le message ID pour tracking
            const { run } = require('../config/database');
            run(
                'INSERT INTO dispatch_responses (guild_id, channel_id, message_id, present, retard, absent, retard_justifications, dispatch_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    interaction.guild.id,
                    channelId,
                    msg.id,
                    JSON.stringify([]),
                    JSON.stringify([]),
                    JSON.stringify([]),
                    JSON.stringify({}),
                    `nds_${Date.now()}`
                ]
            );

            await interaction.reply({ content: `✅ NDS envoyé dans <#${channelId}>`, ephemeral: true });
            Logger.info(`[NDS] Envoyé dans #${channel.title}`);
        } catch (error) {
            Logger.error('[NDS] Erreur envoi', error);
            await interaction.reply({ content: '❌ Erreur lors de l\'envoi.', ephemeral: true });
        }
    }
};
