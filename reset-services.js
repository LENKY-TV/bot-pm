const { initDatabase, run } = require('./config/database');
const ServiceModel = require('./models/Service');
const config = require('./config/config');

async function resetServices() {
    await initDatabase();
    
    const guildId = config.guildId;
    if (!guildId) {
        console.log('❌ GUILD_ID non configuré dans .env');
        process.exit(1);
    }

    console.log(`🔄 Suppression des services pour le serveur ${guildId}...`);
    ServiceModel.deleteAll(guildId);
    
    console.log('🔄 Réinitialisation des services par défaut...');
    ServiceModel.initDefaults(guildId);
    
    const services = ServiceModel.getAll(guildId);
    console.log(`✅ ${services.length} services restaurés :`);
    services.forEach(s => console.log(`   ${s.emoji} ${s.name}`));
    
    process.exit(0);
}

resetServices();
