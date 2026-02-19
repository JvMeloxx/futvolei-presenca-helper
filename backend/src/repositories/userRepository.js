import { query } from '../config/database.js';

class UserRepository {
  async findByEmail(email) {
    const result = await query(
      'SELECT id, email, password_hash, full_name, avatar_url, preferred_days, preferred_times FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  async findById(id) {
    // Note: This query was inferred from the 'query' usage in auth.js profile route
    // Original code didn't technically 'query' by ID for profile GET, it relied on req.user from middleware
    // But update profile does use ID.
    // For consistency, let's allow finding by ID.
    const result = await query(
      'SELECT id, email, full_name, avatar_url, preferred_days, preferred_times FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  async create({ email, passwordHash, fullName, avatarUrl, preferredDays, preferredTimes }) {
    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, avatar_url, preferred_days, preferred_times, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, email, full_name, avatar_url, preferred_days, preferred_times`,
      [email, passwordHash, fullName, avatarUrl || null, preferredDays || [], preferredTimes || []]
    );
    return result.rows[0];
  }

  async update(id, { fullName, avatarUrl, preferredDays, preferredTimes }) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (fullName !== undefined) {
      updates.push(`full_name = $${paramCount}`);
      values.push(fullName);
      paramCount++;
    }

    if (avatarUrl !== undefined) {
      updates.push(`avatar_url = $${paramCount}`);
      values.push(avatarUrl);
      paramCount++;
    }

    if (preferredDays !== undefined) {
      updates.push(`preferred_days = $${paramCount}`);
      values.push(preferredDays);
      paramCount++;
    }

    if (preferredTimes !== undefined) {
      updates.push(`preferred_times = $${paramCount}`);
      values.push(preferredTimes);
      paramCount++;
    }

    if (updates.length === 0) {
      return null; // Return null to indicate no updates needed
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}
       RETURNING id, email, full_name, avatar_url, preferred_days, preferred_times`,
      values
    );

    return result.rows[0];
  }
}

export default new UserRepository();
