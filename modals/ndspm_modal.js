const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { responses, saveResponse } = require('../utils/dispatchTracker');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'ndspm_modal_',

    async execute(interaction, client) {
        const parts = interaction.customId.split('_');
        const channelId = parts[2];
        const roleId = parts[3];

        const title = interaction.fields.getTextInputValue('nds_title');
        const content = interaction.fields.getTextInputValue('nds_content');
        const color = interaction.fields.getTextInputValue('nds_color') || '#FF0000';

        let imageUrl = null;
        try {
            const { get } = require('../config/database');
            const record = get('SELECT value FROM config WHERE guild_id = ? AND key = ?', [
                interaction.guild.id,
                `ndspm_image_${interaction.user.id}`
            ]);
            if (record) {
                imageUrl = record.value;
                const { run } = require('../config/database');
                run('DELETE FROM config WHERE guild_id = ? AND key = ?', [
                    interaction.guild.id,
                    `ndspm_image_${interaction.user.id}`
                ]);
            }
        } catch (e) {}

        const embed = new EmbedBuilder()
            .setTitle(`📋 ・${title}`)
            .setDescription(content)
            .setColor(color)
            .setFooter({ text: '⚠️ Confirmez la lecture sous 48h • Ajoutez vos images en répondant au message' })
            .setTimestamp();

        if (imageUrl) {
            embed.setImage(imageUrl);
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ndspm_ack')
                .setLabel('Lu et approuvé (0)')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅')
        );

        try {
            const channel = await client.channels.fetch(channelId);
            if (!channel) {
                return interaction.reply({ content: '❌ Salon introuvable.', ephemeral: true });
            }

            const msg = await channel.send({ content: `<@&${roleId}>`, embeds: [embed], components: [row] });

            const data = {
                guildId: interaction.guild.id,
                channelId: channelId,
                messageId: msg.id,
                present: [],
                retard: [],
                absent: [],
                retardJustifications: {},
                dispatchDate: `nds_${Date.now()}`,
                timestamp: Date.now()
            };
            saveResponse(msg.id, data);

            await interaction.reply({ content: `✅ NDS envoyé dans <#${channelId}>`, ephemeral: true });
            Logger.info(`[NDS] Envoyé dans #${channel.name}`);
        } catch (error) {
            Logger.error('[NDS] Erreur envoi', error);
            await interaction.reply({ content: '❌ Erreur lors de l\'envoi.', ephemeral: true });
        }
    }
};
