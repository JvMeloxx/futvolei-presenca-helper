# Backend API - Futevôlei Presença Helper

Este é o backend da aplicação de controle de presença para aulas de futevôlei, desenvolvido com Node.js, Express e PostgreSQL (Neon).

## 🚀 Funcionalidades Implementadas

### ✅ Autenticação
- Registro de usuários com validação
- Login com JWT
- Middleware de autenticação
- Gerenciamento de perfil
- Verificação de sessão

### ✅ Gerenciamento de Aulas
- Listagem de aulas com paginação
- Detalhes de aulas específicas
- Confirmação/cancelamento de presença
- Controle de capacidade
- Histórico de participações

### ✅ Sistema de Notificações
- Criação de notificações
- Listagem com paginação
- Marcar como lida
- Contagem de não lidas
- Suporte a diferentes tipos

### ✅ Gerenciamento de Usuários
- Informações do usuário
- Estatísticas pessoais
- Histórico de aulas
- Preferências

## 🛠️ Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados (Neon)
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **express-validator** - Validação de dados
- **helmet** - Segurança
- **cors** - Cross-Origin Resource Sharing
- **morgan** - Logging de requisições
- **express-rate-limit** - Rate limiting

## 📦 Instalação e Configuração

### 1. Instalar Dependências
```bash
cd backend
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Servidor
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080

# Banco de dados Neon PostgreSQL
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# JWT
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Configurar Banco de Dados

#### Executar Migrações
1. Execute a migração inicial:
```sql
-- Execute o arquivo migrations/001_initial_schema.sql no seu banco Neon
```

2. Execute a migração de notificações:
```sql
-- Execute o arquivo migrations/002_notifications.sql no seu banco Neon
```

### 4. Executar o Servidor

#### Desenvolvimento
```bash
npm run dev
```

#### Produção
```bash
npm start
```

O servidor estará disponível em `http://localhost:3001`

## 📚 Documentação da API

### Autenticação

#### POST `/api/auth/signup`
Registra um novo usuário.

**Body:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123",
  "full_name": "Nome Completo",
  "phone": "+5511999999999"
}
```

#### POST `/api/auth/signin`
Faz login do usuário.

**Body:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

### Aulas

#### GET `/api/classes`
Lista todas as aulas.

**Query Parameters:**
- `page` (opcional): Página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)
- `date_from` (opcional): Data inicial (YYYY-MM-DD)
- `date_to` (opcional): Data final (YYYY-MM-DD)

#### GET `/api/classes/:id`
Detalhes de uma aula específica.

#### POST `/api/classes/:id/confirm`
Confirma presença em uma aula.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "confirmed": true
}
```

### Notificações

#### GET `/api/notifications`
Lista notificações do usuário.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (opcional): Página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)

#### GET `/api/notifications/unread-count`
Contagem de notificações não lidas.

#### PUT `/api/notifications/:id/read`
Marca notificação como lida.

## 🔒 Segurança

- **Helmet**: Configuração de headers de segurança
- **CORS**: Configurado para aceitar apenas o frontend
- **Rate Limiting**: Limite de requisições por IP
- **JWT**: Tokens seguros para autenticação
- **Validação**: Validação rigorosa de entrada
- **Hash de Senhas**: bcryptjs com salt rounds

## 🧪 Testes

```bash
npm test
```

## 📝 Logs

O servidor utiliza Morgan para logging de requisições HTTP. Em desenvolvimento, os logs são exibidos no console.

## 🚀 Deploy

### Variáveis de Ambiente para Produção
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=sua_url_do_neon_postgresql
JWT_SECRET=jwt_secret_muito_seguro_para_producao
FRONTEND_URL=https://seu-frontend.com
```

### Comandos de Deploy
```bash
# Build (se necessário)
npm run build

# Start em produção
npm start
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique se todas as variáveis de ambiente estão configuradas
2. Confirme se o banco de dados está acessível
3. Verifique os logs do servidor
4. Abra uma issue no repositório

## 🔄 Próximos Passos

- [ ] Implementar WebSockets para notificações em tempo real
- [ ] Adicionar sistema de cache com Redis
- [ ] Implementar upload de avatars
- [ ] Adicionar testes automatizados
- [ ] Implementar sistema de backup
- [ ] Adicionar métricas e monitoramento