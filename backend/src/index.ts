import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import lcRouter from './routes/lc';

const app = express();

// CORS configuration to support Authorization header and preflight
const allowedOrigins = process.env.CORS_ORIGINS ? 
  process.env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean) : 
  ['https://www.lccopilot.com', 'https://lccopilot.vercel.app', 'http://localhost:5173'];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, postman, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) return callback(null, true);
    
    console.log(`CORS blocked origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
    return callback(new Error(`CORS policy violation: ${origin} not allowed`), false);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Normalize double slashes in path (e.g., //api/validate-lc)
app.use((req, _res, next) => {
  if (req.url.includes('//')) {
    req.url = req.url.replace(/\/{2,}/g, '/');
  }
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', lcRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/cors-test', (req, res) => {
  res.json({ 
    origin: req.get('Origin') || 'no-origin',
    allowedOrigins,
    nodeEnv: process.env.NODE_ENV,
    corsOrigins: process.env.CORS_ORIGINS || 'not-set'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend running on port ${PORT}`);
});


