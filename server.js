require('dotenv').config();
const express       = require('express');
const mongoose      = require('mongoose');
const cors          = require('cors');
const helmet        = require('helmet');
const compression   = require('compression');
const morgan        = require('morgan');
const rateLimit     = require('express-rate-limit');
const fetch         = require('node-fetch');
const app  = express();
const PORT = process.env.PORT || 10000;

app.set('trust proxy', 1);

const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS policy: origin ${origin} not allowed`), false);
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};
app.options(/.*/, cors(corsOptions));   // <— regex instead of '/*'
app.use(cors(corsOptions));

app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use(express.json({ limit: '10mb', strict: true }));
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ DB connection error:', err);
  process.exit(1);
});

app.use('/api/subscribers',         require('./routes/SubscriberRoutes'));
app.use('/api/contacts',            require('./routes/ContactRoutes'));
app.use('/api/bookings',            require('./routes/bookingsRoutes'));
app.use('/api/volunteers',          require('./routes/volunteerRoutes'));
app.use('/api/nigerian-bank-transfer', require('./routes/nigerianBankTransferRoutes'));
app.use('/api/zelle-payment',       require('./routes/zellePaymentRoutes'));
app.use('/api/paypal',              require('./routes/paypalRoutes'));

app.get(['/health','/api/health'], (_, res) =>
  res.json({
    status: 'up',
    db:     mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
);

app.get('/', (_, res) =>
  res.json({ message: 'ClaudyGod API Service', status: 'running', version: '1.0.0' })
);

app.use((req, res) => res.status(404).json({
  status: 'error',
  message: `Route ${req.originalUrl} not found`
}));

app.use((err, req, res, next) => {
  if (err.message && err.message.startsWith('CORS policy'))
    return res.status(401).json({ status: 'error', message: err.message });

  console.error('💥  Unhandled error:', err);
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

if (process.env.KEEP_ALIVE_URL) {
  const every = Number(process.env.KEEP_ALIVE_INTERVAL_MS) || 300000;
  setInterval(() =>
    fetch(process.env.KEEP_ALIVE_URL).catch(e => console.error('Keep‑alive:', e.message)),
    every
  );
}
const server = app.listen(PORT, () => console.log(`🚀  API running on ${PORT}`));

const shutdown = sig => {
  console.log(`\n${sig} received, closing…`);
  server.close(() => {
    mongorequire('dotenv').config();
const express       = require('express');
const mongoose      = require('mongoose');
const cors          = require('cors');
const helmet        = require('helmet');
const compression   = require('compression');
const morgan        = require('morgan');
const rateLimit     = require('express-rate-limit');
const fetch         = require('node-fetch');

const app  = express();
const PORT = process.env.PORT || 10000;

app.set('trust proxy', 1);

const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS policy: origin ${origin} not allowed`), false);
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.options(/.*/, cors(corsOptions));   // <— regex instead of '/*'
app.use(cors(corsOptions));

app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use(express.json({ limit: '10mb', strict: true }));
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ DB connection error:', err);
  process.exit(1);
});

app.use('/api/subscribers',         require('./routes/SubscriberRoutes'));
app.use('/api/contacts',            require('./routes/ContactRoutes'));
app.use('/api/bookings',            require('./routes/bookingsRoutes'));
app.use('/api/volunteers',          require('./routes/volunteerRoutes'));
app.use('/api/nigerian-bank-transfer', require('./routes/nigerianBankTransferRoutes'));
app.use('/api/zelle-payment',       require('./routes/zellePaymentRoutes'));
app.use('/api/paypal',              require('./routes/paypalRoutes'));

app.get(['/health','/api/health'], (_, res) =>
  res.json({
    status: 'up',
    db:     mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
);

app.get('/', (_, res) =>
  res.json({ message: 'ClaudyGod API Service', status: 'running', version: '1.0.0' })
);

app.use((req, res) => res.status(404).json({
  status: 'error',
  message: `Route ${req.originalUrl} not found`
}));
app.use((err, req, res, next) => {
  if (err.message && err.message.startsWith('CORS policy'))
    return res.status(401).json({ status: 'error', message: err.message });

  console.error('💥  Unhandled error:', err);
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});
if (process.env.KEEP_ALIVE_URL) {
  const every = Number(process.env.KEEP_ALIVE_INTERVAL_MS) || 300000;
  setInterval(() =>
    fetch(process.env.KEEP_ALIVE_URL).catch(e => console.error('Keep‑alive:', e.message)),
    every
  );
}
const server = app.listen(PORT, () => console.log(`🚀  API running on ${PORT}`));

const shutdown = sig => {
  console.log(`\n${sig} received, closing…`);
  server.close(() => {
    mongoose.connection.close(false, () => process.exit(0));
  });
};

['SIGINT','SIGTERM','uncaughtException','unhandledRejection']
  .forEach(evt => process.on(evt, () => shutdown(evt)));
  });
};