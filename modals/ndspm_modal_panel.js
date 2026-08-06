const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { responses, saveResponse } = require('../utils/dispatchTracker');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'ndspm_modal_panel_',

    async execute(interaction, client) {
        const parts = interaction.customId.split('_');
        const channelId = parts[3];

        const title = interaction.fields.getTextInputValue('nds_title');
        const content = interaction.fields.getTextInputValue('nds_content');
        const roleId = interaction.fields.getTextInputValue('nds_role');
        const color = interaction.fields.getTextInputValue('nds_color') || '#FF0000';

        const embed = new EmbedBuilder()
            .setTitle(`📋 ・${title}`)
            .setDescription(content)
            .setColor(color)
            .setFooter({ text: '⚠️ Vous devez confirmer la lecture sous 48h' })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ndspm_ack')
                .setLabel('Lu et approuvé (0)')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅'),
            new ButtonBuilder()
                .setCustomId('ndspm_add_image')
                .setLabel('Joindre une image')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🖼️')
        );

        try {
            const channel = await client.channels.fetch(channelId);
            if (!channel) {
                return interaction.reply({ content: '❌ Salon introuvable.', ephemeral: true });
            }

            const msg = await channel.send({ content: `<@&${roleId}>`, embeds: [embed], components: [row] });

            // Sauvegarder pour tracking
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
