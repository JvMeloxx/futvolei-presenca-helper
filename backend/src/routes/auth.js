import express from 'express';
import { body, validationResult } from 'express-validator';
import authService from '../services/authService.js';
import { authenticateToken } from '../middleware/auth.js';

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

    try {
      const result = await authService.register({
        email,
        password,
        fullName: full_name,
        avatarUrl: avatar_url,
        preferredDays: preferred_days,
        preferredTimes: preferred_times
      });
      res.status(201).json(result);
    } catch (serviceError) {
      if (serviceError.message === 'EMAIL_IN_USE') {
        return res.status(409).json({ error: 'Email já está em uso' });
      }
      throw serviceError;
    }
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

    try {
      const result = await authService.login(email, password);
      res.json(result);
    } catch (serviceError) {
      if (serviceError.message === 'INVALID_CREDENTIALS') {
        return res.status(401).json({ error: 'Email ou senha incorretos' });
      }
      throw serviceError;
    }
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
    // req.user comes from middleware, but let's encourage fetching fresh data if needed,
    // or just return req.user if it's populated enough by middleware.
    // The previous implementation just returned req.user.
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

    const updatedUser = await authService.updateUserProfile(userId, {
      fullName: full_name,
      avatarUrl: avatar_url,
      preferredDays: preferred_days,
      preferredTimes: preferred_times
    });

    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      user: updatedUser
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