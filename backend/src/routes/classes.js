import express from 'express';
import { body, validationResult, param } from 'express-validator';
import { query, getClient } from '../config/database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Validações
const classIdValidation = [
  param('id').isUUID().withMessage('ID da aula deve ser um UUID válido')
];

const confirmationValidation = [
  body('confirmed').isBoolean().withMessage('Confirmação deve ser true ou false')
];

// Rota para listar todas as aulas
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, date_from, date_to } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const queryParams = [];
    let paramCount = 1;

    if (date_from) {
      whereClause += ` AND date >= $${paramCount}`;
      queryParams.push(date_from);
      paramCount++;
    }

    if (date_to) {
      whereClause += ` AND date <= $${paramCount}`;
      queryParams.push(date_to);
      paramCount++;
    }

    // Adicionar limit e offset
    queryParams.push(limit, offset);

    console.log('Executing query:', {
      text: `SELECT 
        c.id, c.title, c.description, c.date, c.time, c.location, 
        c.max_participants, c.instructor, c.created_at,
        COUNT(cc.user_id) as confirmed_count
       FROM classes c
       LEFT JOIN class_confirmations cc ON c.id = cc.class_id AND cc.confirmed = true
       ${whereClause}
       GROUP BY c.id, c.title, c.description, c.date, c.time, c.location, c.max_participants, c.instructor, c.created_at
       ORDER BY c.date ASC, c.time ASC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`, params: queryParams
    });

    const result = await query(
      `SELECT 
        c.id, c.title, c.description, c.date, c.time, c.location, 
        c.max_participants, c.instructor, c.created_at,
        COUNT(cc.user_id) as confirmed_count
       FROM classes c
       LEFT JOIN class_confirmations cc ON c.id = cc.class_id AND cc.confirmed = true
       ${whereClause}
       GROUP BY c.id, c.title, c.description, c.date, c.time, c.location, c.max_participants, c.instructor, c.created_at
       ORDER BY c.date ASC, c.time ASC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      queryParams
    );

    // Contar total de aulas
    const countResult = await query(
      `SELECT COUNT(*) as total FROM classes ${whereClause.replace(/\$\d+/g, (match, offset) => {
        const index = parseInt(match.substring(1)) - 1;
        return index < queryParams.length - 2 ? match : '';
      })}`,
      queryParams.slice(0, -2)
    );

    const classes = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      date: row.date,
      time: row.time,
      location: row.location,
      max_participants: row.max_participants,
      instructor: row.instructor,
      confirmed_count: parseInt(row.confirmed_count),
      created_at: row.created_at
    }));

    res.json({
      classes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar aulas - Detalhes:', error.message, error.stack);
    res.status(500).json({
      error: 'Falha ao buscar aulas',
      details: error.message // Sending details to client for debugging (remove in prod)
    });
  }
});

// Rota para obter detalhes de uma aula específica
router.get('/:id', classIdValidation, optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ID inválido',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.user?.id;

    // Buscar aula com contagem de confirmações
    const classResult = await query(
      `SELECT 
        c.id, c.title, c.description, c.date, c.time, c.location, 
        c.max_participants, c.instructor, c.created_at,
        COUNT(cc.user_id) as confirmed_count
       FROM classes c
       LEFT JOIN class_confirmations cc ON c.id = cc.class_id AND cc.confirmed = true
       WHERE c.id = $1
       GROUP BY c.id, c.title, c.description, c.date, c.time, c.location, c.max_participants, c.instructor, c.created_at`,
      [id]
    );

    if (classResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Aula não encontrada'
      });
    }

    const classData = classResult.rows[0];

    // Verificar se usuário confirmou presença (se autenticado)
    let userConfirmed = false;
    if (userId) {
      const confirmationResult = await query(
        'SELECT confirmed FROM class_confirmations WHERE class_id = $1 AND user_id = $2',
        [id, userId]
      );
      userConfirmed = confirmationResult.rows.length > 0 ? confirmationResult.rows[0].confirmed : false;
    }

    res.json({
      id: classData.id,
      title: classData.title,
      description: classData.description,
      date: classData.date,
      time: classData.time,
      location: classData.location,
      max_participants: classData.max_participants,
      instructor: classData.instructor,
      confirmed_count: parseInt(classData.confirmed_count),
      user_confirmed: userConfirmed,
      created_at: classData.created_at
    });
  } catch (error) {
    console.error('Erro ao buscar aula:', error);
    res.status(500).json({
      error: 'Falha ao buscar aula'
    });
  }
});

// Rota para obter participantes de uma aula
router.get('/:id/participants', classIdValidation, async (req, res) => {
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
      `SELECT 
        u.id, u.full_name, u.avatar_url, cc.confirmed_at
       FROM class_confirmations cc
       JOIN users u ON cc.user_id = u.id
       WHERE cc.class_id = $1 AND cc.confirmed = true
       ORDER BY cc.confirmed_at ASC`,
      [id]
    );

    const participants = result.rows.map(row => ({
      id: row.id,
      full_name: row.full_name,
      avatar_url: row.avatar_url,
      confirmed_at: row.confirmed_at
    }));

    res.json({ participants });
  } catch (error) {
    console.error('Erro ao buscar participantes:', error);
    res.status(500).json({
      error: 'Falha ao buscar participantes'
    });
  }
});

// Rota para confirmar/cancelar presença em uma aula
router.post('/:id/confirm', classIdValidation, confirmationValidation, authenticateToken, async (req, res) => {
  const client = await getClient();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { confirmed } = req.body;
    const userId = req.user.id;

    await client.query('BEGIN');

    // Verificar se a aula existe
    const classResult = await client.query(
      'SELECT id, max_participants FROM classes WHERE id = $1',
      [id]
    );

    if (classResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        error: 'Aula não encontrada'
      });
    }

    const classData = classResult.rows[0];

    // Se confirmando, verificar se há vagas
    if (confirmed) {
      const participantsResult = await client.query(
        'SELECT COUNT(*) as count FROM class_confirmations WHERE class_id = $1 AND confirmed = true',
        [id]
      );

      const currentParticipants = parseInt(participantsResult.rows[0].count);

      if (currentParticipants >= classData.max_participants) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          error: 'Aula lotada'
        });
      }
    }

    // Inserir ou atualizar confirmação
    const result = await client.query(
      `INSERT INTO class_confirmations (class_id, user_id, confirmed, confirmed_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (class_id, user_id)
       DO UPDATE SET confirmed = $3, confirmed_at = CASE WHEN $3 THEN NOW() ELSE confirmed_at END, updated_at = NOW()
       RETURNING confirmed`,
      [id, userId, confirmed]
    );

    await client.query('COMMIT');

    res.json({
      message: confirmed ? 'Presença confirmada' : 'Presença cancelada',
      confirmed: result.rows[0].confirmed
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao confirmar presença:', error);
    res.status(500).json({
      error: 'Falha ao confirmar presença'
    });
  } finally {
    client.release();
  }
});

// Rota para obter aulas confirmadas pelo usuário
router.get('/user/confirmed', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT 
        c.id, c.title, c.description, c.date, c.time, c.location, 
        c.max_participants, c.instructor, cc.confirmed_at
       FROM class_confirmations cc
       JOIN classes c ON cc.class_id = c.id
       WHERE cc.user_id = $1 AND cc.confirmed = true
       ORDER BY c.date ASC, c.time ASC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) as total FROM class_confirmations WHERE user_id = $1 AND confirmed = true',
      [userId]
    );

    const classes = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      date: row.date,
      time: row.time,
      location: row.location,
      max_participants: row.max_participants,
      instructor: row.instructor,
      confirmed_at: row.confirmed_at
    }));

    res.json({
      classes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar aulas confirmadas:', error);
    res.status(500).json({
      error: 'Falha ao buscar aulas confirmadas'
    });
  }
});

export default router;