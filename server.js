require('dotenv').config();
const express       = require('express');
const mongoose      = require('mongoose');
const cors          = require('cors');
const helmet        = require('helmet');
const compression   = require('compression');
const morgan        = require('morgan');
const rateLimit     = require('express-rate-limit');
const fetch         = require('node-fetch');

const app   = express();
const PORT  = process.env.PORT || 10000;

// Build allowed origins array from env or default to localhost:3000
const ALLOWED_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

const corsOptions = {
  origin: (origin, cb) => {
    // allow requests with no origin (e.g. curl, mobile apps) or whitelisted domains
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      return cb(null, true);
    }
    return cb(new Error('CORS: Origin not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

// Apply CORS (including automatic preflight handling)
app.use(cors(corsOptions));

// Other middlewares
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, 
  max:      1000
}));
app.use(express.json({ 
  limit: '10mb',
  strict: true
}));
app.use(express.urlencoded({ extended: true }));

// Basic error‐handler for any thrown errors in routes
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Connect to MongoDB
mongoose.connect(process.env.DB_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ DB connection error:', err);
    process.exit(1);
  });

// Route imports
const routes = {
  subscriber:   require('./routes/SubscriberRoutes'),
  contact:      require('./routes/ContactRoutes'),
  bookings:     require('./routes/bookingsRoutes'),
  volunteer:    require('./routes/volunteerRoutes'),
  nigerianBank: require('./routes/nigerianBankTransferRoutes'),
  zellePayment: require('./routes/zellePaymentRoutes'),
  paypal:       require('./routes/paypalRoutes'),
};

// Mount routes under /api
app.use('/api/subscribers', routes.subscriber);
app.use('/api/contacts',    routes.contact);
app.use('/api/bookings',    routes.bookings);
app.use('/api/volunteers',  routes.volunteer);
app.use('/api/nigerian-bank-transfer', routes.nigerianBank);
app.use('/api/zelle-payment',         routes.zellePayment);
app.use('/api/paypal',                routes.paypal);

// Health endpoints
app.get('/health', (_, res) =>
  res.json({
    status: 'up',
    db:     mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
);
app.get('/api/health', (_, res) =>
  res.json({
    status: 'up',
    db:     mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
);

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({
    status:  'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Optional keep‐alive ping
if (process.env.KEEP_ALIVE_URL) {
  const intervalMs = Number(process.env.KEEP_ALIVE_INTERVAL_MS) || 5 * 60 * 1000;
  console.log(`🔄 Pinging ${process.env.KEEP_ALIVE_URL} every ${intervalMs/1000}s`);
  setInterval(() => {
    fetch(process.env.KEEP_ALIVE_URL)
      .then(r => r.text())
      .then(txt => console.log(`Keep‑alive response: ${txt}`))
      .catch(err => console.error('Keep‑alive error:', err.message));
  }, intervalMs);
}

// Root endpoint
app.get('/', (req, res) =>
  res.json({
    message: 'ClaudyGod API Service',
    status:  'running',
    version: '1.0.0'
  })
);

// Start server
const server = app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);

// Graceful shutdown logic
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received: closing HTTP server`);
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB disconnected');
      process.exit(0);
    });
  });
};

['SIGINT', 'SIGTERM'].forEach(sig =>
  process.on(sig, () => gracefulShutdown(sig))
);

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
  gracefulShutdown('unhandledRejection');
});
