/**
 * Langue: Français
 * Toutes les chaînes de caractères du bot
 */

module.exports = {
    // Général
    BOT_NAME: 'Police Municipale RH',
    BOT_DESCRIPTION: 'Système de ticket premium pour la Police Municipale',
    BOT_FOOTER: 'Police Municipale RH',

    // Commandes
    CMD_HELP_TITLE: '📚 Aide - Police Municipale RH',
    CMD_HELP_DESCRIPTION: 'Liste de toutes les commandes disponibles.',
    CMD_STATS_TITLE: '📊 Statistiques - Police Municipale RH',
    CMD_DASHBOARD_TITLE: '📊 Tableau de Bord RH',
    CMD_CONFIG_TITLE: '⚙️ Configuration RH',
    CMD_DEPLOY_TITLE: '🎫 Déploiement du panneau',
    CMD_SERVICE_TITLE: '🏷️ Gestion des Services',
    CMD_SEARCH_TITLE: '🔍 Recherche de tickets',
    CMD_PANEL_TITLE: '🎫 Panneau de ticket',

    // Tickets
    TICKET_OPEN: 'Ouverture du ticket',
    TICKET_CLOSE: 'Fermeture du ticket',
    TICKET_CLAIM: 'Ticket pris en charge',
    TICKET_RENAME: 'Ticket renommé',
    TICKET_PRIORITY: 'Priorité mise à jour',
    TICKET_LOCK: 'Ticket verrouillé',
    TICKET_UNLOCK: 'Ticket déverrouillé',
    TICKET_REOPEN: 'Ticket rouvert',
    TICKET_MEMBER_ADD: 'Membre ajouté',
    TICKET_MEMBER_REMOVE: 'Membre retiré',
    TICKET_NOTE_ADD: 'Note privée ajoutée',
    TICKET_TRANSCRIPT: 'Transcript généré',

    // Messages
    MSG_WELCOME: 'Bienvenue dans votre ticket {service}. Un agent vous répondra尽快.',
    MSG_CLOSE: 'Ce ticket a été fermé. Merci pour votre patience.',
    MSG_CLAIM: '{agent} a pris en charge ce ticket.',
    MSG_RENAME: 'Le ticket a été renommé en **{name}**.',
    MSG_PRIORITY: 'La priorité a été changée en **{priority}**.',
    MSG_LOCK: 'Ce ticket a été verrouillé.',
    MSG_UNLOCK: 'Ce ticket a été déverrouillé.',
    MSG_REOPEN: 'Ce ticket a été rouvert.',
    MSG_MEMBER_ADD: '{member} a été ajouté au ticket.',
    MSG_MEMBER_REMOVE: '{member} a été retiré du ticket.',
    MSG_NOTE_ADD: 'Une note privée a été ajoutée.',
    MSG_TRANSCRIPT: 'La transcription a été générée.',

    // Erreurs
    ERR_NOT_TICKET: 'Ce salon n\'est pas un ticket.',
    ERR_ALREADY_CLAIMED: 'Ce ticket est déjà pris en charge.',
    ERR_MAX_TICKETS: 'Vous avez déjà le maximum de tickets ouverts.',
    ERR_TICKET_CLOSED: 'Ce ticket est déjà fermé.',
    ERR_TICKET_OPEN: 'Ce ticket est déjà ouvert.',
    ERR_SERVICE_NOT_FOUND: 'Service introuvable.',
    ERR_CHANNEL_NOT_FOUND: 'Salon introuvable.',
    ERR_MEMBER_NOT_FOUND: 'Membre introuvable.',
    ERR_PERMISSION: 'Vous n\'avez pas les permissions nécessaires.',
    ERR_BOT_PERMISSION: 'Je n\'ai pas les permissions nécessaires.',
    ERR_CHANNEL_EXISTS: 'Un salon avec ce nom existe déjà.',

    // Succès
    SUCCESS_TICKET_CREATED: 'Ticket créé avec succès !',
    SUCCESS_TICKET_CLAIMED: 'Ticket pris en charge avec succès !',
    SUCCESS_TICKET_CLOSED: 'Ticket fermé avec succès !',
    SUCCESS_TICKET_RENAMED: 'Ticket renommé avec succès !',
    SUCCESS_TICKET_PRIORITY: 'Priorité mise à jour avec succès !',
    SUCCESS_TICKET_LOCKED: 'Ticket verrouillé avec succès !',
    SUCCESS_TICKET_UNLOCKED: 'Ticket déverrouillé avec succès !',
    SUCCESS_TICKET_REOPENED: 'Ticket rouvert avec succès !',
    SUCCESS_MEMBER_ADDED: 'Membre ajouté avec succès !',
    SUCCESS_MEMBER_REMOVED: 'Membre retiré avec succès !',
    SUCCESS_NOTE_ADDED: 'Note ajoutée avec succès !',
    SUCCESS_TRANSCRIPT: 'Transcript généré avec succès !',
    SUCCESS_CONFIG_UPDATED: 'Configuration mise à jour avec succès !',
    SUCCESS_DEPLOY: 'Panneau déployé avec succès !',

    // Évaluation
    RATING_TITLE: '⭐ Évaluation',
    RATING_DESCRIPTION: 'Donnez une note de 1 à 10 pour évaluer la qualité du service.',
    RATING_THANKS: 'Merci pour votre évaluation !',
    RATING_ALREADY: 'Vous avez déjà évalué ce ticket.',

    // Statistiques
    STATS_GENERAL: '📈 Général',
    STATS_PERIOD: '📅 Période',
    STATS_TIME: '⏱️ Temps',
    STATS_TOP_STAFF: '🏆 Top Staff',
    STATS_BY_SERVICE: '🏷️ Par Service',
    STATS_TICKETS_OPEN: 'Tickets ouverts',
    STATS_TICKETS_CLOSED: 'Tickets fermés',
    STATS_TICKETS_TOTAL: 'Total',
    STATS_MESSAGES: 'Messages',
    STATS_CLAIMS: 'Claims',
    STATS_TODAY: 'Aujourd\'hui',
    STATS_WEEK: 'Cette semaine',
    STATS_MONTH: 'Ce mois',
    STATS_RESPONSE_TIME: 'Réponse moy.',
    STATS_RESOLUTION_TIME: 'Résolution moy.',

    // Services
    SERVICE_DIRECTOR: 'Directeur',
    SERVICE_DIRECTOR_ADJ: 'Directeur Adjoint',
    SERVICE_CHIEF_POLICE: 'Chef de Police',
    SERVICE_CHIEF_1: 'Chef de Service Première Classe',
    SERVICE_CHIEF_2: 'Chef de Service Seconde Classe',
    SERVICE_BMU: 'BMU',
    SERVICE_GSI: 'GSI',
    SERVICE_VTT: 'Brigade VTT',
    SERVICE_SUGGESTIONS: 'Suggestions Police Municipale',
    SERVICE_REPORT: 'Rapport',
    SERVICE_COMPLAINT: 'Plainte',
    SERVICE_RESIGNATION: 'Démission',

    // Actions
    ACTION_CLAIM: 'Prendre en charge',
    ACTION_RENAME: 'Renommer',
    ACTION_PRIORITY: 'Priorité',
    ACTION_ADD_MEMBER: 'Ajouter membre',
    ACTION_REMOVE_MEMBER: 'Retirer membre',
    ACTION_NOTES: 'Notes',
    ACTION_LOCK: 'Verrouiller',
    ACTION_UNLOCK: 'Déverrouiller',
    ACTION_TRANSCRIPT: 'Transcript',
    ACTION_CLOSE: 'Fermer',
    ACTION_DELETE: 'Supprimer',
    ACTION_REOPEN: 'Rouvrir',
    ACTION_RATE: 'Évaluer'
};
