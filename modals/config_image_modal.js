/**
 * Modal: config_image_modal
 * Change l'image des embeds
 */

const ConfigModel = require('../models/Config');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'config_image_modal',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const image = interaction.fields.getTextInputValue('config_image');

        // Valider l'URL
        if (image && !image.startsWith('http')) {
            return interaction.reply({
                content: '❌ URL invalide. L\'url doit commencer par http:// ou https://',
                ephemeral: true
            });
        }

        ConfigModel.set(guildId, 'embed_image', image);

        Logger.info(`Image changée par ${interaction.user.tag}`);

        const embed = EmbedUtils.success(guildId, '🖼️ Image mise à jour', 'L\'image des embeds a été mise à jour.');

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
