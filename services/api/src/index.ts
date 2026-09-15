import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import { connectMongoDB } from './db/mongodb';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import taskRoutes from './routes/tasks';
import contestRoutes from './routes/contests';
import examRoutes from './routes/exams';
import dashboardRoutes from './routes/dashboard';
import quizRoutes from './routes/quizzes';
import notificationRoutes from './routes/notifications';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 1. Core API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/contests', contestRoutes);
app.use('/api/v1/exams', examRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1/notifications', notificationRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Pragya Backend API',
    database: 'MongoDB Atlas',
    timestamp: new Date().toISOString()
  });
});

const server = http.createServer(app);

// 2. WebSockets Server for Real-Time Proctoring & Telemetry
const wss = new WebSocketServer({ server, path: '/ws/proctoring' });

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Connected to Pragya Real-time Proctoring Engine' }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: 'TELEMETRY_UPDATE', payload: data }));
        }
      });
    } catch (e) {
      console.error('Invalid WS payload', e);
    }
  });
});

// 3. Start HTTP Server immediately
server.listen(PORT, () => {
  console.log(`🚀 Pragya API Backend server listening immediately on http://localhost:${PORT}`);
  console.log(`⚡ Real-Time WebSockets listening on ws://localhost:${PORT}/ws/proctoring`);

  connectMongoDB().then(connected => {
    if (connected) console.log('🍃 MongoDB Atlas DB connection established & ready.');
  });
});

export default app;
