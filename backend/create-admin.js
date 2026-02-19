
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
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

async function createAdmin() {
    const client = await pool.connect();
    try {
        const email = 'teste@teste.com';
        const password = 'teste123';
        const fullName = 'Admin User';

        console.log(`Creating user: ${email}...`);

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Check if user exists
        const check = await client.query('SELECT id FROM users WHERE email = $1', [email]);

        if (check.rows.length > 0) {
            console.log('User already exists. Updating password...');
            await client.query('UPDATE users SET password_hash = $1 WHERE email = $2', [passwordHash, email]);
            console.log('Password updated.');
        } else {
            // Insert new user
            const id = uuidv4();
            await client.query(`
            INSERT INTO users (id, email, password_hash, full_name, created_at)
            VALUES ($1, $2, $3, $4, NOW())
        `, [id, email, passwordHash, fullName]);
            console.log('User created successfully.');
        }

    } catch (err) {
        console.error('Failed to create user:', err);
    } finally {
        client.release();
        pool.end();
    }
}

createAdmin();
