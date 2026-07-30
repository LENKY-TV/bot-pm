/**
 * Button: rhconfig_reset
 * Réinitialise la configuration
 */

const ConfigModel = require('../models/Config');
const ServiceModel = require('../models/Service');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'rhconfig_reset',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;

        // Vérifier les permissions
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({
                content: '❌ Vous n\'avez pas les permissions nécessaires.',
                ephemeral: true
            });
        }

        try {
            // Réinitialiser la config
            ConfigModel.initDefaults(guildId);
            ServiceModel.initDefaults(guildId);

            Logger.info(`Configuration réinitialisée par ${interaction.user.tag}`);

            const embed = EmbedUtils.success(guildId, '🔄 Configuration réinitialisée', 
                'La configuration a été réinitialisée aux valeurs par défaut.');

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            Logger.error('Erreur lors de la réinitialisation', error);
            await interaction.reply({
                content: '❌ Une erreur est survenue.',
                ephemeral: true
            });
        }
    }
};
