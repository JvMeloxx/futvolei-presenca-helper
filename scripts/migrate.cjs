const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ZQJLOohtWJeE@ep-steep-butterfly-a5q6p2qx.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigrations() {
  try {
    console.log('Conectando ao banco de dados Neon...');
    
    const migrationPath = path.join(__dirname, '..', 'src', 'integrations', 'neon', 'migrations.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Executando migrações...');
    await pool.query(migrationSQL);
    
    console.log('✅ Migrações executadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar migrações:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();