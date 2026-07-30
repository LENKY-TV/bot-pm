const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { responses } = require('./dispatchTracker');
const EmbedUtils = require('./embedBuilder');
const Logger = require('./logger');

let client = null;
let dispatchAdminId = null;
let lastDate = null;

const DISPATCH_CHANNEL_ID = '1500956378334761090';
const DISPATCH_ROLE_ID = '1489721198073090078';

function startScheduler(discordClient) {
    client = discordClient;
    Logger.info('Scheduler démarré');
    setInterval(checkScheduledTasks, 30000);
}

function setDispatchAdmin(userId) {
    dispatchAdminId = userId;
}

function checkScheduledTasks() {
    if (!client) return;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const today = now.toDateString();

    if (today === lastDate) return;

    if (hours === 8 && minutes === 0) {
        lastDate = today;
        sendDispatch();
    }

    if (hours === 18 && minutes === 0) {
        lastDate = today;
        sendDispatchReminder();
    }

    if (hours === 20 && minutes === 50) {
        lastDate = today;
        sendDispatchDM();
    }
}

async function sendDispatchReminder() {
    try {
        const channel = await client.channels.fetch(DISPATCH_CHANNEL_ID);
        if (!channel) return;

        const embed = EmbedUtils.create(channel.guild.id, {
            title: '⏰ Rappel Dispatch - POLICE MUNICIPALE PARIS 75',
            description: `<@&${DISPATCH_ROLE_ID}>

**Rappel important !**

Le **dispatch** est ouvert depuis ce matin.
N'oubliez pas de confirmer votre présence !

**Police Municipale de Paris**`,
            color: '#FF8C00'
        });

        await channel.send({ content: `<@&${DISPATCH_ROLE_ID}>`, embeds: [embed] });
        Logger.info('Rappel dispatch envoyé à 18h');
    } catch (error) {
        Logger.error('Erreur envoi rappel dispatch', error);
    }
}

async function sendDispatchDM() {
    if (!dispatchAdminId) return;

    try {
        const guild = client.guilds.cache.first();
        if (!guild) return;

        const allMembers = guild.members.cache.filter(m => !m.user.bot);
        const memberList = allMembers.map(m => `• ${m.user.username}`).join('\n') || 'Aucun membre';

        const embed = new EmbedBuilder()
            .setTitle('📋 ・Liste des agents - Dispatch')
            .setDescription(
                `> *Récapitulatif avant clôture*\n\n` +
                `**━━━━━━━━━━━━━━━━━━━━━━━━━━━**\n\n` +
                `👷 **Agents concernés** ・ \`${allMembers.size}\`\n\n` +
                `${memberList}\n\n` +
                `**━━━━━━━━━━━━━━━━━━━━━━━━━━━**\n\n` +
                `> 📅 \`${new Date().toLocaleDateString('fr-FR')}\` ・ 🕐 \`${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}\``
            )
            .setColor('#1a1a2e')
            .setFooter({ text: '• Clôture des présences à 21h30' })
            .setTimestamp();

        const admin = await client.users.fetch(dispatchAdminId);
        if (admin) {
            await admin.send({ embeds: [embed] });
            Logger.info('MP dispatch envoyé à 20h50');
        }
    } catch (error) {
        Logger.error('Erreur envoi MP dispatch', error);
    }
}

async function sendDispatch() {
    try {
        const channel = await client.channels.fetch(DISPATCH_CHANNEL_ID);
        if (!channel) return;

        const now = new Date();
        const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        const embed = EmbedUtils.create(channel.guild.id, {
            title: '🚨 Dispatch - POLICE MUNICIPALE PARIS 75',
            description: `Date : **${dateStr}**
Heure dispatch : **21h00**

Bonjour à tous,
Chaque jour, un dispatch sera publié pour organiser les interventions de la soirée. Ce document est essentiel pour la coordination des équipes et l'efficacité des opérations.

⚠️ **Important !**
Présence obligatoire ! Il est impératif que chaque agent confirme sa présence ou son absence en cochant la case correspondante dans le document. Cela nous permet d'anticiper les effectifs disponibles et d'ajuster les missions en fonction.

🟢 **Présent** ― 🟠 **Retard** ― 🔴 **Absent**

En cas d'absence imprévue, veuillez informer le service de coordination au plus vite afin de permettre un ajustement des équipes.

Merci de votre collaboration et de votre vigilance pour assurer une couverture optimale des missions.

**Police Municipale de Paris**`,
            color: '#FF0000'
        });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('dispatch_present')
                .setLabel('Présent')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🟢'),
            new ButtonBuilder()
                .setCustomId('dispatch_retard')
                .setLabel('Retard')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🟠'),
            new ButtonBuilder()
                .setCustomId('dispatch_absent')
                .setLabel('Absent')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔴')
        );

        const msg = await channel.send({ content: `<@&${DISPATCH_ROLE_ID}>`, embeds: [embed], components: [row] });

        responses.set(msg.id, {
            guildId: channel.guild.id,
            channelId: channel.id,
            messageId: msg.id,
            present: [],
            retard: [],
            absent: [],
            timestamp: Date.now()
        });

        Logger.info('Dispatch envoyé à 8h');
    } catch (error) {
        Logger.error('Erreur envoi dispatch', error);
    }
}

module.exports = { startScheduler, setDispatchAdmin };
