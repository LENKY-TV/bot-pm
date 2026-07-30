/**
 * Modal: config_reminder_interval_modal
 * Change l'intervalle des relances
 */

const ConfigModel = require('../models/Config');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'config_reminder_interval_modal',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const interval = interaction.fields.getTextInputValue('config_reminder_interval');

        // Valider le nombre
        const num = parseInt(interval);
        if (isNaN(num) || num < 1 || num > 168) {
            return interaction.reply({
                content: '❌ Nombre invalide. L\'intervalle doit être entre 1 et 168 heures.',
                ephemeral: true
            });
        }

        ConfigModel.set(guildId, 'reminder_interval', String(num));

        Logger.info(`Intervalle des relances changé en ${num}h par ${interaction.user.tag}`);

        const embed = EmbedUtils.success(guildId, '⏰ Intervalle mis à jour', `L\'intervalle des relances a été changé en **${num}h**.`);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
