/**
 * Modal: rio_modal
 * Crée le rôle RIO et l'attribue au membre
 */

const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'rio_modal',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const guild = interaction.guild;

        const memberId = interaction.fields.getTextInputValue('rio_user_id').trim();
        const rioNumber = interaction.fields.getTextInputValue('rio_number').trim();

        // Vérifier que le RIO fait 7 chiffres
        if (!/^\d{7}$/.test(rioNumber)) {
            return interaction.reply({
                content: '❌ Le RIO doit contenir exactement 7 chiffres.',
                ephemeral: true
            });
        }

        // Récupérer le membre
        let member;
        try {
            member = await guild.members.fetch(memberId);
        } catch {
            return interaction.reply({
                content: '❌ Membre introuvable avec cet ID.',
                ephemeral: true
            });
        }

        try {
            // Vérifier si un rôle RIO existe déjà pour ce numéro
            const roleName = `RIO : ${rioNumber}`;
            let role = guild.roles.cache.find(r => r.name === roleName);

            // Créer le rôle s'il n'existe pas
            if (!role) {
                role = await guild.roles.create({
                    name: roleName,
                    color: '#FFD700',
                    reason: `RIO ${rioNumber} attribué par ${interaction.user.tag}`
                });
                Logger.info(`Rôle "${roleName}" créé par ${interaction.user.tag}`);
            }

            // Attribuer le rôle au membre
            if (member.roles.cache.has(role.id)) {
                return interaction.reply({
                    content: `❌ ${member} a déjà le rôle **${roleName}**.`,
                    ephemeral: true
                });
            }

            await member.roles.add(role);

            Logger.info(`Rôle "${roleName}" attribué à ${member.user.tag} par ${interaction.user.tag}`);

            const embed = EmbedUtils.success(guildId, '✅ RIO attribué', 
                `Le rôle **${roleName}** a été attribué à ${member} avec succès.`);

            await interaction.reply({ embeds: [embed], ephemeral: true });

        } catch (error) {
            Logger.error('Erreur lors de l\'attribution du RIO', error);
            await interaction.reply({
                content: '❌ Une erreur est survenue lors de l\'attribution du RIO.',
                ephemeral: true
            });
        }
    }
};
