import bcrypt from 'bcryptjs';
import userRepository from '../repositories/userRepository.js';
import { generateToken } from '../middleware/auth.js';

class AuthService {
    async register({ email, password, fullName, avatarUrl, preferredDays, preferredTimes }) {
        const existingUser = await userRepository.findByEmail(email);

        if (existingUser) {
            throw new Error('EMAIL_IN_USE');
        }

        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const user = await userRepository.create({
            email,
            passwordHash,
            fullName,
            avatarUrl,
            preferredDays,
            preferredTimes
        });

        const token = generateToken(user.id);
        const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

        return {
            user: this._sanitizeUser(user),
            session: {
                access_token: token,
                user: this._sanitizeUser(user),
                expires_at: expiresAt
            }
        };
    }

    async login(email, password) {
        console.log(`AuthService: Attempting login for ${email}`);
        const user = await userRepository.findByEmail(email);

        if (!user) {
            console.log('AuthService: User not found');
            throw new Error('INVALID_CREDENTIALS');
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            console.log('AuthService: Invalid password');
            throw new Error('INVALID_CREDENTIALS');
        }

        const token = generateToken(user.id);
        const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

        // Ensure we sanitize and return consistent structure
        const sanitizedUser = this._sanitizeUser(user);

        return {
            user: sanitizedUser,
            session: {
                access_token: token,
                user: sanitizedUser,
                expires_at: expiresAt
            }
        };
    }

    async updateUserProfile(userId, updateData) {
        const updatedUser = await userRepository.update(userId, updateData);

        if (!updatedUser) {
            // If repository returned null (no updates), fetch current user data to return
            return this._sanitizeUser(await userRepository.findById(userId));
        }

        return this._sanitizeUser(updatedUser);
    }

    _sanitizeUser(user) {
        if (!user) return null;
        return {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            avatar_url: user.avatar_url,
            preferred_days: user.preferred_days,
            preferred_times: user.preferred_times
        };
    }
}

export default new AuthService();
