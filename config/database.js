/**
 * Configuration de la base de données SQLite (sql.js)
 */

const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'database', 'bot.db');

const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

let db = null;

async function initDatabase() {
    const SQL = await initSqlJs();

    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    db.run('PRAGMA foreign_keys = ON;');
    createTables();
    saveDatabase();
    console.log('[DB] Base de données initialisée avec succès');
}

function saveDatabase() {
    if (!db) return;
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
}

/**
 * Remplace les ? dans la requête par les valeurs (échappement manuel)
 */
function buildQuery(sql, params) {
    if (!params || params.length === 0) return sql;
    let idx = 0;
    return sql.replace(/\?/g, () => {
        const val = params[idx++];
        if (val === undefined || val === null) return 'NULL';
        if (typeof val === 'number') return val.toString();
        if (typeof val === 'boolean') return val ? '1' : '0';
        return "'" + String(val).replace(/'/g, "''") + "'";
    });
}

function run(sql, params = []) {
    const safeSql = buildQuery(sql, params);
    db.run(safeSql);
    saveDatabase();
    return { changes: db.getRowsModified() };
}

function get(sql, params = []) {
    const safeSql = buildQuery(sql, params);
    const results = db.exec(safeSql);
    if (results.length > 0 && results[0].values.length > 0) {
        const columns = results[0].columns;
        const row = results[0].values[0];
        const obj = {};
        columns.forEach((col, i) => { obj[col] = row[i]; });
        return obj;
    }
    return null;
}

function all(sql, params = []) {
    const safeSql = buildQuery(sql, params);
    const results = db.exec(safeSql);
    if (results.length > 0) {
        const columns = results[0].columns;
        return results[0].values.map(row => {
            const obj = {};
            columns.forEach((col, i) => { obj[col] = row[i]; });
            return obj;
        });
    }
    return [];
}

function createTables() {
    db.run(`CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_number INTEGER NOT NULL,
        guild_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        creator_id TEXT NOT NULL,
        claimed_by TEXT DEFAULT NULL,
        service TEXT NOT NULL,
        priority TEXT DEFAULT 'Normal',
        status TEXT DEFAULT 'open',
        created_at TEXT DEFAULT (datetime('now')),
        claimed_at TEXT DEFAULT NULL,
        closed_at TEXT DEFAULT NULL,
        first_response_at TEXT DEFAULT NULL,
        message_count INTEGER DEFAULT 0,
        agent_count INTEGER DEFAULT 0,
        notes TEXT DEFAULT NULL,
        category_id TEXT DEFAULT NULL,
        channel_name TEXT DEFAULT NULL,
        last_activity TEXT DEFAULT (datetime('now')),
        reminder_count INTEGER DEFAULT 0,
        rating INTEGER DEFAULT NULL,
        rating_comment TEXT DEFAULT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        role TEXT DEFAULT 'staff',
        tickets_handled INTEGER DEFAULT 0,
        avg_response_time REAL DEFAULT 0,
        avg_resolution_time REAL DEFAULT 0,
        total_messages INTEGER DEFAULT 0,
        rating_sum INTEGER DEFAULT 0,
        rating_count INTEGER DEFAULT 0,
        last_active TEXT DEFAULT (datetime('now')),
        is_online INTEGER DEFAULT 0,
        UNIQUE(user_id, guild_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        date TEXT NOT NULL,
        tickets_opened INTEGER DEFAULT 0,
        tickets_closed INTEGER DEFAULT 0,
        avg_response_time REAL DEFAULT 0,
        avg_resolution_time REAL DEFAULT 0,
        total_messages INTEGER DEFAULT 0,
        claims INTEGER DEFAULT 0,
        UNIQUE(guild_id, date)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        ticket_id INTEGER,
        action TEXT NOT NULL,
        user_id TEXT NOT NULL,
        details TEXT DEFAULT NULL,
        created_at TEXT DEFAULT (datetime('now'))
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT DEFAULT NULL,
        UNIQUE(guild_id, key)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER NOT NULL,
        author_id TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS claims (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER NOT NULL,
        agent_id TEXT NOT NULL,
        claimed_at TEXT DEFAULT (datetime('now')),
        released_at TEXT DEFAULT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT DEFAULT NULL,
        created_at TEXT DEFAULT (datetime('now'))
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        name TEXT NOT NULL,
        emoji TEXT DEFAULT '📋',
        color TEXT DEFAULT '#1E3A5F',
        description TEXT DEFAULT '',
        category_id TEXT DEFAULT NULL,
        role_id TEXT DEFAULT NULL,
        channel_id TEXT DEFAULT NULL,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        UNIQUE(guild_id, name)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        username TEXT DEFAULT NULL,
        display_name TEXT DEFAULT NULL,
        avatar_url TEXT DEFAULT NULL,
        total_tickets INTEGER DEFAULT 0,
        open_tickets INTEGER DEFAULT 0,
        first_ticket TEXT DEFAULT (datetime('now')),
        last_ticket TEXT DEFAULT (datetime('now')),
        UNIQUE(user_id, guild_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS dashboard (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        channel_id TEXT DEFAULT NULL,
        message_id TEXT DEFAULT NULL,
        last_update TEXT DEFAULT (datetime('now')),
        UNIQUE(guild_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER NOT NULL,
        guild_id TEXT NOT NULL,
        reminder_type TEXT DEFAULT 'inactivity',
        sent_at TEXT DEFAULT (datetime('now')),
        next_reminder TEXT DEFAULT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS service_attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        service_name TEXT NOT NULL,
        clock_in TEXT DEFAULT (datetime('now')),
        clock_out TEXT DEFAULT NULL,
        duration INTEGER DEFAULT NULL,
        status TEXT DEFAULT 'active',
        on_pause INTEGER DEFAULT 0,
        pause_start TEXT DEFAULT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS absences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        message_id TEXT DEFAULT NULL,
        reviewed_by TEXT DEFAULT NULL,
        created_at TEXT DEFAULT (datetime('now'))
    )`);
}

module.exports = { initDatabase, run, get, all, saveDatabase };
