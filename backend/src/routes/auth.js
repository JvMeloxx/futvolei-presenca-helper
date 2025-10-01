import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { authenticateToken, generateToken } from '../middleware/auth.js';

const router = express.Router();

// Validações
const signUpValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('full_name').trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('preferred_days').optional().isArray().withMessage('Dias preferidos devem ser um array'),
  body('preferred_times').optional().isArray().withMessage('Horários preferidos devem ser um array')
];

const signInValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
];

// Rota de registro
router.post('/signup', signUpValidation, async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { email, password, full_name, avatar_url, preferred_days, preferred_times } = req.body;

    // Verificar se usuário já existe
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'Email já está em uso'
      });
    }

    // Hash da senha
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Inserir usuário
    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, avatar_url, preferred_days, preferred_times, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, email, full_name, avatar_url, preferred_days, preferred_times`,
      [email, passwordHash, full_name, avatar_url || null, preferred_days || [], preferred_times || []]
    );

    const user = result.rows[0];

    // Gerar token
    const token = generateToken(user.id);
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 dias

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        preferred_days: user.preferred_days,
        preferred_times: user.preferred_times
      },
      session: {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          preferred_days: user.preferred_days,
          preferred_times: user.preferred_times
        },
        expires_at: expiresAt
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      error: 'Falha ao criar conta'
    });
  }
});

// Rota de login
router.post('/signin', signInValidation, async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Buscar usuário
    const result = await query(
      'SELECT id, email, password_hash, full_name, avatar_url, preferred_days, preferred_times FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Email ou senha incorretos'
      });
    }

    const user = result.rows[0];

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Email ou senha incorretos'
      });
    }

    // Gerar token
    const token = generateToken(user.id);
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 dias

    const authUser = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      preferred_days: user.preferred_days,
      preferred_times: user.preferred_times
    };

    res.json({
      user: authUser,
      session: {
        access_token: token,
        user: authUser,
        expires_at: expiresAt
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Falha ao fazer login'
    });
  }
});

// Rota para obter perfil do usuário
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({
      error: 'Falha ao obter perfil'
    });
  }
});

// Rota para atualizar perfil
router.put('/profile', authenticateToken, [
  body('full_name').optional().trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('preferred_days').optional().isArray().withMessage('Dias preferidos devem ser um array'),
  body('preferred_times').optional().isArray().withMessage('Horários preferidos devem ser um array')
], async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { full_name, avatar_url, preferred_days, preferred_times } = req.body;
    const userId = req.user.id;

    // Construir query de atualização dinamicamente
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (full_name !== undefined) {
      updates.push(`full_name = $${paramCount}`);
      values.push(full_name);
      paramCount++;
    }

    if (avatar_url !== undefined) {
      updates.push(`avatar_url = $${paramCount}`);
      values.push(avatar_url);
      paramCount++;
    }

    if (preferred_days !== undefined) {
      updates.push(`preferred_days = $${paramCount}`);
      values.push(preferred_days);
      paramCount++;
    }

    if (preferred_times !== undefined) {
      updates.push(`preferred_times = $${paramCount}`);
      values.push(preferred_times);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.json({ user: req.user });
    }

    updates.push(`updated_at = NOW()`);
    values.push(userId);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}
       RETURNING id, email, full_name, avatar_url, preferred_days, preferred_times`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    res.json({
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      error: 'Falha ao atualizar perfil'
    });
  }
});

// Rota para verificar sessão
router.get('/session', authenticateToken, async (req, res) => {
  try {
    const token = req.headers['authorization'].split(' ')[1];
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 dias

    res.json({
      session: {
        access_token: token,
        user: req.user,
        expires_at: expiresAt
      }
    });
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    res.status(500).json({
      error: 'Falha ao verificar sessão'
    });
  }
});

export default router;