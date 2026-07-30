/**
 * Button: rhconfig_export
 * Exporte la configuration
 */

const ConfigModel = require('../models/Config');
const ServiceModel = require('../models/Service');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

module.exports = {
    customId: 'rhconfig_export',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;

        try {
            const config = ConfigModel.getAll(guildId);
            const services = ServiceModel.getAll(guildId);

            const exportData = {
                config,
                services,
                exportedAt: new Date().toISOString(),
                guildId
            };

            const exportPath = path.join(__dirname, '..', 'cache', `config-${guildId}.json`);
            fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));

            Logger.info(`Configuration exportée par ${interaction.user.tag}`);

            const embed = EmbedUtils.success(guildId, '📤 Configuration exportée', 
                'La configuration a été exportée avec succès.');

            await interaction.reply({
                embeds: [embed],
                files: [{ attachment: exportPath, name: `config-${guildId}.json` }],
                ephemeral: true
            });

            // Supprimer le fichier après envoi
            setTimeout(() => {
                try {
                    fs.unlinkSync(exportPath);
                } catch (e) {}
            }, 5000);
        } catch (error) {
            Logger.error('Erreur lors de l\'export', error);
            await interaction.reply({
                content: '❌ Une erreur est survenue lors de l\'export.',
                ephemeral: true
            });
        }
    }
};
