const { EmbedBuilder } = require('discord.js');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'ndspm_add_image',

    async execute(interaction, client) {
        const userId = interaction.user.id;
        const messageId = interaction.message.id;

        // Vérifier que c'est l'auteur du NDS ou un admin
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: '❌ Seul un administrateur peut joindre une image.', ephemeral: true });
        }

        await interaction.reply({
            content: '🖼️ **Envoyez votre image en réponse à ce message.**\nTapez `cancel` pour annuler.',
            ephemeral: true
        });

        // Attendre la réponse avec l'image
        const filter = (m) => m.author.id === userId && m.channel.id === interaction.channel.id;
        const collector = interaction.channel.createMessages({ filter, max: 1, time: 60000 });

        collector.on('collect', async (message) => {
            if (message.content.toLowerCase() === 'cancel') {
                return message.reply('❌ Ajout d\'image annulé.');
            }

            const attachment = message.attachments.first();
            if (!attachment) {
                return message.reply('❌ Aucune image trouvée. Veuillez envoyer un fichier image.');
            }

            // Vérifier que c'est une image
            const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
            if (!validTypes.includes(attachment.contentType)) {
                return message.reply('❌ Le fichier doit être une image (PNG, JPG, GIF, WEBP).');
            }

            try {
                // Récupérer l'embed original
                const originalMsg = await interaction.channel.messages.fetch(messageId);
                if (!originalMsg || !originalMsg.embeds[0]) {
                    return message.reply('❌ Message original introuvable.');
                }

                const originalEmbed = EmbedBuilder.from(originalMsg.embeds[0]);
                originalEmbed.setImage(attachment.url);

                // Retirer le bouton image
                const row = originalMsg.components[0];
                if (row) {
                    const newComponents = row.components.filter(c => c.customId !== 'ndspm_add_image');
                    if (newComponents.length > 0) {
                        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
                        const newRow = new ActionRowBuilder().addComponents(...newComponents);
                        await originalMsg.edit({ embeds: [originalEmbed], components: [newRow] });
                    } else {
                        await originalMsg.edit({ embeds: [originalEmbed], components: [] });
                    }
                }

                await message.reply('✅ Image ajoutée au NDS.');
                Logger.info(`[NDS] Image ajoutée au NDS ${messageId}`);
            } catch (error) {
                Logger.error('[NDS] Erreur ajout image', error);
                message.reply('❌ Erreur lors de l\'ajout de l\'image.');
            }
        });

        collector.on('end', (collected) => {
            if (collected.size === 0) {
                interaction.followUp({ content: '⏰ Temps écoulé. Aucune image ajoutée.', ephemeral: true });
            }
        });
    }
};
