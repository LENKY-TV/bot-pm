/**
 * Button: config_rating_toggle
 * Active/désactive les évaluations
 */

const ConfigModel = require('../models/Config');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'config_rating_toggle',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;

        const config = ConfigModel.getAll(guildId);
        const current = config.rating_enabled === '1';
        const newValue = current ? '0' : '1';

        ConfigModel.set(guildId, 'rating_enabled', newValue);

        Logger.info(`Évaluations ${newValue === '1' ? 'activées' : 'désactivées'} par ${interaction.user.tag}`);

        const embed = EmbedUtils.success(guildId, '⭐ Évaluations', 
            `Les évaluations ont été ${newValue === '1' ? 'activées' : 'désactivées'}.`);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
