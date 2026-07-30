/**
 * Modal: config_footer_modal
 * Change le footer des embeds
 */

const ConfigModel = require('../models/Config');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'config_footer_modal',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const footer = interaction.fields.getTextInputValue('config_footer');

        ConfigModel.set(guildId, 'embed_footer', footer);

        Logger.info(`Footer changé en "${footer}" par ${interaction.user.tag}`);

        const embed = EmbedUtils.success(guildId, '📝 Footer mis à jour', `Le footer des embeds a été changé en **${footer}**.`);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
