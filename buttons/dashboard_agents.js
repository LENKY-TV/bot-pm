/**
 * Button: dashboard_agents
 * Affiche les agents du dashboard
 */

const StaffModel = require('../models/Staff');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'dashboard_agents',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;

        await interaction.deferReply({ ephemeral: true });

        const topStaff = StaffModel.getTop(guildId, 10);
        const onlineAgents = StaffModel.getOnline(guildId);

        const embed = EmbedUtils.create(guildId, {
            title: '👥 Agents - Dashboard',
            fields: [
                {
                    name: '🟢 En ligne',
                    value: onlineAgents.length > 0 
                        ? onlineAgents.map(a => {
                            const member = interaction.guild.members.cache.get(a.user_id);
                            return member ? member.user.username : 'Inconnu';
                        }).join(', ')
                        : 'Aucun agent en ligne',
                    inline: false
                },
                {
                    name: '🏆 Top Agents',
                    value: topStaff.length > 0
                        ? topStaff.map((s, i) => {
                            const member = interaction.guild.members.cache.get(s.user_id);
                            const name = member ? member.user.username : 'Inconnu';
                            const rating = s.rating_count > 0 
                                ? (s.rating_sum / s.rating_count).toFixed(1)
                                : 'N/A';
                            return `\`${i + 1}.\` ${name} - **${s.tickets_handled}** tickets (⭐ ${rating})`;
                        }).join('\n')
                        : 'Aucun agent',
                    inline: false
                }
            ]
        });

        await interaction.editReply({ embeds: [embed] });
    }
};
