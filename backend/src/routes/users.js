import express from 'express';
import { param, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validações
const userIdValidation = [
  param('id').isUUID().withMessage('ID do usuário deve ser um UUID válido')
];

// Rota para obter informações de um usuário específico
router.get('/:id', userIdValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ID inválido',
        details: errors.array()
      });
    }

    const { id } = req.params;

    const result = await query(
      'SELECT id, email, full_name, avatar_url, preferred_days, preferred_times, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    const user = result.rows[0];
    res.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        preferred_days: user.preferred_days,
        preferred_times: user.preferred_times,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      error: 'Falha ao buscar usuário'
    });
  }
});

// Rota para obter estatísticas do usuário
router.get('/:id/stats', userIdValidation, authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ID inválido',
        details: errors.array()
      });
    }

    const { id } = req.params;

    // Verificar se o usuário pode acessar essas estatísticas (próprio usuário ou admin)
    if (req.user.id !== id) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    // Buscar estatísticas
    const statsQueries = await Promise.all([
      // Total de aulas confirmadas
      query(
        'SELECT COUNT(*) as total FROM class_confirmations WHERE user_id = $1 AND confirmed = true',
        [id]
      ),
      // Aulas confirmadas este mês
      query(
        `SELECT COUNT(*) as total FROM class_confirmations cc
         JOIN classes c ON cc.class_id = c.id
         WHERE cc.user_id = $1 AND cc.confirmed = true
         AND EXTRACT(MONTH FROM c.date) = EXTRACT(MONTH FROM CURRENT_DATE)
         AND EXTRACT(YEAR FROM c.date) = EXTRACT(YEAR FROM CURRENT_DATE)`,
        [id]
      ),
      // Próximas aulas confirmadas
      query(
        `SELECT COUNT(*) as total FROM class_confirmations cc
         JOIN classes c ON cc.class_id = c.id
         WHERE cc.user_id = $1 AND cc.confirmed = true
         AND c.date >= CURRENT_DATE`,
        [id]
      ),
      // Horários mais frequentes
      query(
        `SELECT c.time, COUNT(*) as frequency
         FROM class_confirmations cc
         JOIN classes c ON cc.class_id = c.id
         WHERE cc.user_id = $1 AND cc.confirmed = true
         GROUP BY c.time
         ORDER BY frequency DESC
         LIMIT 3`,
        [id]
      ),
      // Dias da semana mais frequentes
      query(
        `SELECT EXTRACT(DOW FROM c.date) as day_of_week, COUNT(*) as frequency
         FROM class_confirmations cc
         JOIN classes c ON cc.class_id = c.id
         WHERE cc.user_id = $1 AND cc.confirmed = true
         GROUP BY EXTRACT(DOW FROM c.date)
         ORDER BY frequency DESC`,
        [id]
      )
    ]);

    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

    const stats = {
      total_classes: parseInt(statsQueries[0].rows[0].total),
      classes_this_month: parseInt(statsQueries[1].rows[0].total),
      upcoming_classes: parseInt(statsQueries[2].rows[0].total),
      favorite_times: statsQueries[3].rows.map(row => ({
        time: row.time,
        frequency: parseInt(row.frequency)
      })),
      favorite_days: statsQueries[4].rows.map(row => ({
        day: dayNames[parseInt(row.day_of_week)],
        frequency: parseInt(row.frequency)
      }))
    };

    res.json({ stats });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Falha ao buscar estatísticas'
    });
  }
});

// Rota para obter histórico de aulas do usuário
router.get('/:id/history', userIdValidation, authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ID inválido',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { page = 1, limit = 10, status = 'all' } = req.query;
    const offset = (page - 1) * limit;

    // Verificar se o usuário pode acessar esse histórico
    if (req.user.id !== id) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    let whereClause = 'WHERE cc.user_id = $1';
    const queryParams = [id];
    let paramCount = 2;

    if (status === 'confirmed') {
      whereClause += ' AND cc.confirmed = true';
    } else if (status === 'cancelled') {
      whereClause += ' AND cc.confirmed = false';
    }

    queryParams.push(limit, offset);

    const result = await query(
      `SELECT 
        c.id, c.title, c.description, c.date, c.time, c.location, 
        c.instructor, cc.confirmed, cc.confirmed_at, cc.updated_at
       FROM class_confirmations cc
       JOIN classes c ON cc.class_id = c.id
       ${whereClause}
       ORDER BY c.date DESC, c.time DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      queryParams
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM class_confirmations cc
       JOIN classes c ON cc.class_id = c.id
       ${whereClause}`,
      queryParams.slice(0, -2)
    );

    const history = result.rows.map(row => ({
      class: {
        id: row.id,
        title: row.title,
        description: row.description,
        date: row.date,
        time: row.time,
        location: row.location,
        instructor: row.instructor
      },
      confirmed: row.confirmed,
      confirmed_at: row.confirmed_at,
      updated_at: row.updated_at
    }));

    res.json({
      history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({
      error: 'Falha ao buscar histórico'
    });
  }
});

export default router;