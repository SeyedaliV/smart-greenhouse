import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import plantRoutes from './routes/plantRoutes.js';
import sensorRoutes from './routes/sensorRoutes.js';
import deviceRoutes from './routes/deviceRoutes.js';
import zoneRoutes from './routes/zoneRoutes.js';
import seedRoutes from './routes/seedRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import automationRoutes from './routes/automationRoutes.js';
import { startSimulationEngine } from './simulation/simulationEngine.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/logs', auditLogRoutes);
app.use('/api/automation', automationRoutes);

connectDB();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('🔌 Client connected to simulation socket:', socket.id);
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

startSimulationEngine(io).catch((err) => {
  console.error('Failed to start simulation engine:', err);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} 🚀`);
});