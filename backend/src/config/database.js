import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // máximo de conexões no pool
  idleTimeoutMillis: 30000, // tempo limite para conexões inativas
  connectionTimeoutMillis: 2000, // tempo limite para estabelecer conexão
});

// Função para executar queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executada:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Erro na query:', { text, error: error.message });
    throw error;
  }
};

// Função para obter um cliente do pool (para transações)
export const getClient = async () => {
  return await pool.connect();
};

// Função para fechar o pool
export const closePool = async () => {
  await pool.end();
  console.log('Pool de conexões fechado');
};

// Teste de conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao banco de dados PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro na conexão com o banco:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Fechando conexões com o banco...');
  await closePool();
  process.exit(0);
});

export default pool;