/**
 * Modal: config_thumbnail_modal
 * Change la thumbnail des embeds
 */

const ConfigModel = require('../models/Config');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'config_thumbnail_modal',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const thumbnail = interaction.fields.getTextInputValue('config_thumbnail');

        // Valider l'URL
        if (thumbnail && !thumbnail.startsWith('http')) {
            return interaction.reply({
                content: '❌ URL invalide. L\'url doit commencer par http:// ou https://',
                ephemeral: true
            });
        }

        ConfigModel.set(guildId, 'embed_thumbnail', thumbnail);

        Logger.info(`Thumbnail changée par ${interaction.user.tag}`);

        const embed = EmbedUtils.success(guildId, '🖼️ Thumbnail mise à jour', 'La thumbnail des embeds a été mise à jour.');

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
