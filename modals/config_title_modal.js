/**
 * Modal: config_title_modal
 * Change le titre des embeds
 */

const ConfigModel = require('../models/Config');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'config_title_modal',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const title = interaction.fields.getTextInputValue('config_title');

        ConfigModel.set(guildId, 'embed_title', title);

        Logger.info(`Titre changé en "${title}" par ${interaction.user.tag}`);

        const embed = EmbedUtils.success(guildId, '📝 Titre mis à jour', `Le titre des embeds a été changé en **${title}**.`);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
