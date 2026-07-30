/**
 * Modal: config_transcript_channel_modal
 * Change le salon des transcripts
 */

const ConfigModel = require('../models/Config');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'config_transcript_channel_modal',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const channelId = interaction.fields.getTextInputValue('config_transcript_channel');

        // Vérifier que le salon existe
        const channel = interaction.guild.channels.cache.get(channelId);
        if (!channel) {
            return interaction.reply({
                content: '❌ Salon introuvable.',
                ephemeral: true
            });
        }

        ConfigModel.set(guildId, 'transcript_channel', channelId);

        Logger.info(`Salon des transcripts changé en ${channel.name} par ${interaction.user.tag}`);

        const embed = EmbedUtils.success(guildId, '📋 Salon des transcripts mis à jour', `Le salon des transcripts a été changé en ${channel}.`);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
