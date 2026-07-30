/**
 * Modal: config_log_channel_modal
 * Change le salon des logs
 */

const ConfigModel = require('../models/Config');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'config_log_channel_modal',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const channelId = interaction.fields.getTextInputValue('config_log_channel');

        // Vérifier que le salon existe
        const channel = interaction.guild.channels.cache.get(channelId);
        if (!channel) {
            return interaction.reply({
                content: '❌ Salon introuvable.',
                ephemeral: true
            });
        }

        ConfigModel.set(guildId, 'log_channel', channelId);

        Logger.info(`Salon des logs changé en ${channel.name} par ${interaction.user.tag}`);

        const embed = EmbedUtils.success(guildId, '📋 Salon des logs mis à jour', `Le salon des logs a été changé en ${channel}.`);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
