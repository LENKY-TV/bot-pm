/**
 * Modal: config_close_message_modal
 * Change le message de fermeture
 */

const ConfigModel = require('../models/Config');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'config_close_message_modal',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const message = interaction.fields.getTextInputValue('config_close_message');

        ConfigModel.set(guildId, 'close_message', message);

        Logger.info(`Message de fermeture changé par ${interaction.user.tag}`);

        const embed = EmbedUtils.success(guildId, '💬 Message mis à jour', 'Le message de fermeture a été mis à jour.');

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
