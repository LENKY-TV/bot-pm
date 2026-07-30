/**
 * Modal: config_color_modal
 * Change la couleur des embeds
 */

const ConfigModel = require('../models/Config');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'config_color_modal',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const color = interaction.fields.getTextInputValue('config_color');

        // Valider la couleur
        if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
            return interaction.reply({
                content: '❌ Format de couleur invalide. Utilisez le format hexadécimal (#RRGGBB).',
                ephemeral: true
            });
        }

        ConfigModel.set(guildId, 'embed_color', color);

        Logger.info(`Couleur changée en ${color} par ${interaction.user.tag}`);

        const embed = EmbedUtils.success(guildId, '🎨 Couleur mise à jour', `La couleur des embeds a été changée en **${color}**.`);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
