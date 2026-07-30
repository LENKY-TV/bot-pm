/**
 * Modal: config_welcome_message_modal
 * Change le message de bienvenue
 */

const ConfigModel = require('../models/Config');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'config_welcome_message_modal',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const message = interaction.fields.getTextInputValue('config_welcome_message');

        ConfigModel.set(guildId, 'welcome_message', message);

        Logger.info(`Message de bienvenue changé par ${interaction.user.tag}`);

        const embed = EmbedUtils.success(guildId, '💬 Message mis à jour', 'Le message de bienvenue a été mis à jour.');

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
