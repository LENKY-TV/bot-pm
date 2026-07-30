/**
 * Button: service_reset
 * Réinitialise les services
 */

const ServiceModel = require('../models/Service');
const { run } = require('../config/database');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'service_reset',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;

        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({
                content: '❌ Vous n\'avez pas les permissions nécessaires.',
                ephemeral: true
            });
        }

        try {
            run('DELETE FROM services WHERE guild_id = ?', [guildId]);
            ServiceModel.initDefaults(guildId);

            Logger.info(`Services réinitialisés par ${interaction.user.tag}`);

            const embed = EmbedUtils.success(guildId, '🔄 Services réinitialisés', 
                'Les services ont été réinitialisés aux valeurs par défaut.');

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            Logger.error('Erreur lors de la réinitialisation des services', error);
            await interaction.reply({
                content: '❌ Une erreur est survenue.',
                ephemeral: true
            });
        }
    }
};
