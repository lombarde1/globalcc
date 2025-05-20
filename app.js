// app.js - API Central de Cartões de Crédito
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Importar rotas
import creditCardRoutes from './routes/creditCard.routes.js';

// Configuração do dotenv
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Rotas
app.use('/api/credit-cards', creditCardRoutes);

// Rota de teste/status
app.get('/status', (req, res) => {
  res.json({ 
    status: 'online',
    service: 'credit-card-api',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    error: err.stack
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor de API de Cartões rodando na porta ${PORT}`);
});

export default app;