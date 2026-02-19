
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting classes migration...');

        await client.query('BEGIN');

        // Check if columns exist
        const check = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'classes' AND column_name = 'title'
    `);

        if (check.rows.length === 0) {
            console.log('Adding missing columns to classes...');
            await client.query(`
            ALTER TABLE classes 
            ADD COLUMN title TEXT,
            ADD COLUMN description TEXT,
            ADD COLUMN date DATE;
        `);
            console.log('Columns added.');
        } else {
            console.log('Columns already exist.');
        }

        // Seed data
        console.log('Seeding sample classes...');
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

        const cls1 = {
            id: uuidv4(),
            title: 'Funcional Areia',
            description: 'Treino funcional focado em condicionamento.',
            date: today,
            time: '08:00',
            location: 'Quadra 1',
            max: 12,
            instr: 'Prof. André',
            day: 'Quinta' // Hardcoded for simplicity or calculate
        };

        const cls2 = {
            id: uuidv4(),
            title: 'Futevôlei Intermediário',
            description: 'Fundamentos e jogo.',
            date: tomorrow,
            time: '18:30',
            location: 'Quadra Central',
            max: 10,
            instr: 'Prof. Bruno',
            day: 'Sexta'
        };

        // Insert safely
        await client.query(`
        INSERT INTO classes (id, title, description, date, time, location, max_participants, instructor, day, created_at)
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()),
        ($10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())
    `, [
            cls1.id, cls1.title, cls1.description, cls1.date, cls1.time, cls1.location, cls1.max, cls1.instr, cls1.day,
            cls2.id, cls2.title, cls2.description, cls2.date, cls2.time, cls2.location, cls2.max, cls2.instr, cls2.day
        ]);

        console.log('Seed data inserted.');

        await client.query('COMMIT');
        console.log('Migration and seeding completed successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
