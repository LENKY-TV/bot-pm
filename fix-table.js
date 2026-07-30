const { initDatabase, run } = require('./config/database');

async function fix() {
    await initDatabase();
    run('DROP TABLE IF EXISTS service_attendance');
    run(`CREATE TABLE IF NOT EXISTS service_attendance (
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
    console.log('✅ Table recréée sans contrainte UNIQUE');
    process.exit(0);
}

fix();
