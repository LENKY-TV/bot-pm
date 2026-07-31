/**
 * Modal: ticket_remove_member_modal
 * Retire un membre du ticket
 */

const TicketModel = require('../models/Ticket');
const LogModel = require('../models/Log');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'ticket_remove_member_modal',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const channel = interaction.channel;
        const memberId = interaction.fields.getTextInputValue('member_id');

        // Vérifier que c'est un salon de ticket
        const ticket = TicketModel.getByChannel(channel.id);
        if (!ticket) {
            return interaction.reply({
                content: '❌ Ce salon n\'est pas un ticket.',
                ephemeral: true
            });
        }

        // Récupérer le membre
        let member;
        try {
            member = await interaction.guild.members.fetch(memberId);
        } catch {
            return interaction.reply({
                content: '❌ Membre introuvable.',
                ephemeral: true
            });
        }

        // Ne pas retirer le créateur
        if (member.id === ticket.creator_id) {
            return interaction.reply({
                content: '❌ Vous ne pouvez pas retirer le créateur du ticket.',
                ephemeral: true
            });
        }

        try {
            await channel.permissionOverwrites.edit(member, {
                ViewChannel: false,
                SendMessages: false
            });

            // Logger l'action
            LogModel.create({
                guild_id: guildId,
                ticket_id: ticket.id,
                action: 'ticket_member_remove',
                user_id: interaction.user.id,
                details: `Membre ${member.user.tag} retiré`
            });

            Logger.info(`Membre ${member.user.tag} retiré du ticket #${ticket.ticket_number} par ${interaction.user.tag}`);

            const embed = EmbedUtils.success(guildId, 'Membre retiré', `${member} a été retiré du ticket.`);

            await interaction.reply({ embeds: [embed], ephemeral: true });

            // Message dans le salon
            await channel.send({
                content: `${member} a été retiré du ticket par ${interaction.user}.`
            });
        } catch (error) {
            Logger.error('Erreur lors du retrait du membre', error);
            await interaction.reply({
                content: '❌ Une erreur est survenue.',
                ephemeral: true
            });
        }
    }
};
