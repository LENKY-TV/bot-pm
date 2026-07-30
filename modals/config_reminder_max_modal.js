/**
 * Modal: config_reminder_max_modal
 * Change le nombre maximum de relances
 */

const ConfigModel = require('../models/Config');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'config_reminder_max_modal',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const max = interaction.fields.getTextInputValue('config_reminder_max');

        // Valider le nombre
        const num = parseInt(max);
        if (isNaN(num) || num < 1 || num > 10) {
            return interaction.reply({
                content: '❌ Nombre invalide. Le maximum doit être entre 1 et 10.',
                ephemeral: true
            });
        }

        ConfigModel.set(guildId, 'reminder_max', String(num));

        Logger.info(`Maximum des relances changé en ${num} par ${interaction.user.tag}`);

        const embed = EmbedUtils.success(guildId, '🔢 Maximum mis à jour', `Le nombre maximum de relances a été changé en **${num}**.`);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
