const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { responses } = require('../utils/dispatchTracker');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

const RECAP_CHANNEL_ID = '1489721606505889873';
const RECAP_USER_IDS = ['1528157366883844277', '1086766492873404499'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dispatchmess')
        .setDescription('Renvoyer le récap du dispatch manuellement')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        if (responses.size === 0) {
            return interaction.editReply({ content: '❌ Aucun dispatch en cours. Le dispatch de 8h a-t-il été envoyé ?' });
        }

        let sentCount = 0;
        let errors = [];

        for (const [messageId, data] of responses.entries()) {
            try {
                const guild = client.guilds.cache.get(data.guildId);
                if (!guild) {
                    errors.push('Guild introuvable');
                    continue;
                }

                const dispatchRole = guild.roles.cache.get('1489721198073090078');
                if (!dispatchRole) {
                    errors.push('Rôle dispatch introuvable');
                    continue;
                }

                const allMembers = dispatchRole.members.filter(m => !m.user.bot);
                const allMemberIds = allMembers.map(m => m.id);
                const responded = new Set([...data.present, ...data.retard, ...data.absent]);
                const noResponse = allMemberIds.filter(id => !responded.has(id));

                const formatList = (arr, emoji, justifications = null) => {
                    if (arr.length === 0) return 'Aucun';
                    return arr.map(id => {
                        const member = guild.members.cache.get(id);
                        const name = member ? `<@${id}>` : 'Inconnu';
                        if (justifications && justifications[id]) {
                            const j = justifications[id];
                            return `${emoji} ${name} ― \`${j.arrivalTime}\` ― ${j.reason}`;
                        }
                        return `${emoji} ${name}`;
                    }).join('\n');
                };

                const formatNoResponse = (arr) => {
                    if (arr.length === 0) return 'Aucun';
                    return arr.map(id => {
                        const member = guild.members.cache.get(id);
                        return `❓ ${member ? `<@${id}>` : 'Inconnu'}`;
                    }).join('\n');
                };

                const dateStr = new Date().toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

                const summaryEmbed = EmbedUtils.create(guild.id, {
                    title: `📋 Résumé Dispatch - ${dateStr}`,
                    description: `Bilan de présence du dispatch du **${dateStr}**.\n\n> *Renvoyé manuellement via /dispatchmess*`,
                    fields: [
                        { name: `🟢 Présents (${data.present.length})`, value: formatList(data.present, '🟢'), inline: true },
                        { name: `🟠 Retards (${data.retard.length})`, value: formatList(data.retard, '🟠', data.retardJustifications), inline: true },
                        { name: `🔴 Absents (${data.absent.length})`, value: formatList(data.absent, '🔴'), inline: true },
                        { name: `❓ Pas de réponse (${noResponse.length})`, value: formatNoResponse(noResponse), inline: false }
                    ],
                    color: '#FFD700',
                    footer: 'Résumé dispatch - Renvoi manuel'
                });

                // Envoyer dans le salon récap
                try {
                    const recapChannel = await client.channels.fetch(RECAP_CHANNEL_ID);
                    if (recapChannel) {
                        await recapChannel.send({ embeds: [summaryEmbed] });
                        sentCount++;
                        Logger.info(`[DispatchMess] Récap envoyé dans #${recapChannel.name}`);
                    } else {
                        errors.push(`Salon récap ${RECAP_CHANNEL_ID} introuvable`);
                    }
                } catch (e) {
                    errors.push(`Erreur salon récap: ${e.message}`);
                }

                // Envoyer en MP
                for (const userId of RECAP_USER_IDS) {
                    try {
                        const user = await client.users.fetch(userId);
                        if (user) {
                            await user.send({ embeds: [summaryEmbed] });
                            sentCount++;
                            Logger.info(`[DispatchMess] MP envoyé à ${user.tag}`);
                        }
                    } catch (e) {
                        errors.push(`Erreur MP ${userId}: ${e.message}`);
                    }
                }

            } catch (error) {
                errors.push(`Erreur générale: ${error.message}`);
            }
        }

        let reply = `✅ Récap renvoyé avec succès.`;
        if (errors.length > 0) {
            reply += `\n\n⚠️ Erreurs :\n${errors.map(e => `- ${e}`).join('\n')}`;
        }

        await interaction.editReply({ content: reply });
    }
};
