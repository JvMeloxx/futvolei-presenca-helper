import { query } from '../config/database.js';

// Tipos de notificação
export const NOTIFICATION_TYPES = {
  CLASS_REMINDER: 'class_reminder',
  CLASS_CONFIRMED: 'class_confirmed',
  CLASS_CANCELLED: 'class_cancelled',
  CLASS_UPDATED: 'class_updated',
  NEW_CLASS_AVAILABLE: 'new_class_available',
  CLASS_FULL: 'class_full',
  SPOT_AVAILABLE: 'spot_available'
};

// Classe para gerenciar notificações
class NotificationService {
  constructor() {
    this.subscribers = new Map(); // Para WebSocket connections futuras
  }

  // Criar uma notificação no banco
  async createNotification(userId, type, title, message, data = {}) {
    try {
      const result = await query(
        `INSERT INTO notifications (user_id, type, title, message, data, created_at, read)
         VALUES ($1, $2, $3, $4, $5, NOW(), false)
         RETURNING id, user_id, type, title, message, data, created_at, read`,
        [userId, type, title, message, JSON.stringify(data)]
      );

      const notification = result.rows[0];
      
      // Enviar notificação em tempo real (se usuário estiver conectado)
      this.sendRealTimeNotification(userId, notification);
      
      return notification;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  }

  // Buscar notificações do usuário
  async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
    try {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE user_id = $1';
      const queryParams = [userId];
      
      if (unreadOnly) {
        whereClause += ' AND read = false';
      }
      
      queryParams.push(limit, offset);
      
      const result = await query(
        `SELECT id, user_id, type, title, message, data, created_at, read
         FROM notifications
         ${whereClause}
         ORDER BY created_at DESC
         LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`,
        queryParams
      );

      const countResult = await query(
        `SELECT COUNT(*) as total FROM notifications ${whereClause}`,
        queryParams.slice(0, -2)
      );

      return {
        notifications: result.rows.map(row => ({
          ...row,
          data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].total),
          pages: Math.ceil(countResult.rows[0].total / limit)
        }
      };
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      throw error;
    }
  }

  // Marcar notificação como lida
  async markAsRead(notificationId, userId) {
    try {
      const result = await query(
        'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2 RETURNING id',
        [notificationId, userId]
      );
      
      return result.rows.length > 0;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      throw error;
    }
  }

  // Marcar todas as notificações como lidas
  async markAllAsRead(userId) {
    try {
      const result = await query(
        'UPDATE notifications SET read = true WHERE user_id = $1 AND read = false',
        [userId]
      );
      
      return result.rowCount;
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      throw error;
    }
  }

  // Contar notificações não lidas
  async getUnreadCount(userId) {
    try {
      const result = await query(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = false',
        [userId]
      );
      
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Erro ao contar notificações não lidas:', error);
      throw error;
    }
  }

  // Enviar notificação em tempo real (WebSocket)
  sendRealTimeNotification(userId, notification) {
    // Implementação futura para WebSocket
    console.log(`📱 Notificação em tempo real para usuário ${userId}:`, notification.title);
  }

  // Notificações específicas para aulas
  async notifyClassReminder(classId) {
    try {
      // Buscar usuários confirmados para a aula
      const result = await query(
        `SELECT cc.user_id, c.title, c.date, c.time, c.location
         FROM class_confirmations cc
         JOIN classes c ON cc.class_id = c.id
         WHERE cc.class_id = $1 AND cc.confirmed = true`,
        [classId]
      );

      const notifications = [];
      
      for (const row of result.rows) {
        const notification = await this.createNotification(
          row.user_id,
          NOTIFICATION_TYPES.CLASS_REMINDER,
          'Lembrete de Aula',
          `Sua aula "${row.title}" é hoje às ${row.time} em ${row.location}`,
          { classId, date: row.date, time: row.time }
        );
        notifications.push(notification);
      }
      
      return notifications;
    } catch (error) {
      console.error('Erro ao enviar lembretes de aula:', error);
      throw error;
    }
  }

  async notifyClassConfirmation(userId, classId, confirmed) {
    try {
      const classResult = await query(
        'SELECT title, date, time FROM classes WHERE id = $1',
        [classId]
      );
      
      if (classResult.rows.length === 0) return null;
      
      const classData = classResult.rows[0];
      const action = confirmed ? 'confirmada' : 'cancelada';
      
      return await this.createNotification(
        userId,
        confirmed ? NOTIFICATION_TYPES.CLASS_CONFIRMED : NOTIFICATION_TYPES.CLASS_CANCELLED,
        `Presença ${action}`,
        `Sua presença na aula "${classData.title}" foi ${action}`,
        { classId, confirmed, date: classData.date, time: classData.time }
      );
    } catch (error) {
      console.error('Erro ao notificar confirmação de aula:', error);
      throw error;
    }
  }

  async notifyNewClass(classId) {
    try {
      const classResult = await query(
        'SELECT title, date, time, location FROM classes WHERE id = $1',
        [classId]
      );
      
      if (classResult.rows.length === 0) return [];
      
      const classData = classResult.rows[0];
      
      // Buscar usuários que podem estar interessados (todos os usuários ativos)
      const usersResult = await query(
        'SELECT id FROM users WHERE created_at >= NOW() - INTERVAL \'30 days\''
      );
      
      const notifications = [];
      
      for (const user of usersResult.rows) {
        const notification = await this.createNotification(
          user.id,
          NOTIFICATION_TYPES.NEW_CLASS_AVAILABLE,
          'Nova Aula Disponível',
          `Nova aula "${classData.title}" disponível para ${classData.date} às ${classData.time}`,
          { classId, date: classData.date, time: classData.time }
        );
        notifications.push(notification);
      }
      
      return notifications;
    } catch (error) {
      console.error('Erro ao notificar nova aula:', error);
      throw error;
    }
  }

  // Limpar notificações antigas (executar periodicamente)
  async cleanupOldNotifications(daysOld = 30) {
    try {
      const result = await query(
        'DELETE FROM notifications WHERE created_at < NOW() - INTERVAL $1',
        [`${daysOld} days`]
      );
      
      console.log(`🧹 Limpeza: ${result.rowCount} notificações antigas removidas`);
      return result.rowCount;
    } catch (error) {
      console.error('Erro ao limpar notificações antigas:', error);
      throw error;
    }
  }
}

// Instância singleton
const notificationService = new NotificationService();

export default notificationService;