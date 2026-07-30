/**
 * Button: rhconfig_info
 * Affiche les informations de configuration
 */

const ConfigModel = require('../models/Config');
const ServiceModel = require('../models/Service');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'rhconfig_info',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;

        const config = ConfigModel.getAll(guildId);
        const services = ServiceModel.getAll(guildId);

        const embed = EmbedUtils.create(guildId, {
            title: 'ℹ️ Informations de configuration',
            fields: [
                {
                    name: '📊 Statistiques',
                    value: [
                        `**Services:** ${services.length}`,
                        `**Paramètres:** ${Object.keys(config).length}`,
                        `**Version:** 1.0.0`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '🔗 Liens',
                    value: [
                        `[Support](https://discord.gg/votre-serveur)`,
                        `[Documentation](https://docs.example.com)`
                    ].join('\n'),
                    inline: true
                }
            ]
        });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
