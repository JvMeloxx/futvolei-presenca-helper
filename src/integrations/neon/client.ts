import { Pool } from 'pg';

// Configuração do banco de dados Neon
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_eXoAEkInz57U@ep-aged-glade-acollrr1-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// Criar pool de conexões
export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20, // máximo de conexões no pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Função para executar queries
export const query = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

// Função para fechar o pool (útil para testes)
export const closePool = async () => {
  await pool.end();
};

// Tipos para as tabelas do banco
export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name?: string;
  avatar_url?: string;
  preferred_days?: string[];
  preferred_times?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface Class {
  id: string;
  day: string;
  time: string;
  location: string;
  instructor: string;
  max_participants: number;
  created_at: Date;
}

export interface ClassConfirmation {
  id: string;
  user_id: string;
  class_id: string;
  created_at: Date;
}

export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  preferred_days?: string[];
  preferred_times?: string[];
  created_at: Date;
  updated_at: Date;
}