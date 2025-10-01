import express from 'express';
import { param, query as queryValidator, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import notificationService from '../services/notificationService.js';

const router = express.Router();

// Todas as rotas de notificação requerem autenticação
router.use(authenticateToken);

// Validações
const notificationIdValidation = [
  param('id').isUUID().withMessage('ID da notificação deve ser um UUID válido')
];

const paginationValidation = [
  queryValidator('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  queryValidator('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limite deve ser entre 1 e 50'),
  queryValidator('unread_only').optional().isBoolean().withMessage('unread_only deve ser true ou false')
];

// Rota para obter notificações do usuário
router.get('/', paginationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Parâmetros inválidos',
        details: errors.array()
      });
    }

    const userId = req.user.id;
    const { page = 1, limit = 20, unread_only = false } = req.query;

    const result = await notificationService.getUserNotifications(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unread_only === 'true'
    });

    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({
      error: 'Falha ao buscar notificações'
    });
  }
});

// Rota para contar notificações não lidas
router.get('/unread-count', async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await notificationService.getUnreadCount(userId);
    
    res.json({ unread_count: count });
  } catch (error) {
    console.error('Erro ao contar notificações não lidas:', error);
    res.status(500).json({
      error: 'Falha ao contar notificações não lidas'
    });
  }
});

// Rota para marcar notificação como lida
router.patch('/:id/read', notificationIdValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ID inválido',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.user.id;

    const success = await notificationService.markAsRead(id, userId);
    
    if (!success) {
      return res.status(404).json({
        error: 'Notificação não encontrada'
      });
    }

    res.json({ message: 'Notificação marcada como lida' });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({
      error: 'Falha ao marcar notificação como lida'
    });
  }
});

// Rota para marcar todas as notificações como lidas
router.patch('/mark-all-read', async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await notificationService.markAllAsRead(userId);
    
    res.json({ 
      message: 'Todas as notificações foram marcadas como lidas',
      updated_count: count
    });
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    res.status(500).json({
      error: 'Falha ao marcar todas as notificações como lidas'
    });
  }
});

// Rota para testar notificação (apenas para desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  router.post('/test', async (req, res) => {
    try {
      const userId = req.user.id;
      const { type = 'test', title = 'Notificação de Teste', message = 'Esta é uma notificação de teste' } = req.body;
      
      const notification = await notificationService.createNotification(
        userId,
        type,
        title,
        message,
        { test: true, timestamp: new Date().toISOString() }
      );
      
      res.json({
        message: 'Notificação de teste criada',
        notification
      });
    } catch (error) {
      console.error('Erro ao criar notificação de teste:', error);
      res.status(500).json({
        error: 'Falha ao criar notificação de teste'
      });
    }
  });
}

export default router;