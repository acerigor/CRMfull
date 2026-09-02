require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { authMiddleware } = require('./server/middleware/auth');

const app = express();
const PORT = process.env.PORT || 8123;

// --------------- Middleware ---------------
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------- Rate limiting ---------------
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// --------------- Root redirect ---------------
if (!process.env.VERCEL) {
  app.get('/', (req, res) => {
    res.redirect('/login/login.html');
  });
}

// --------------- API routes ---------------
// Public
app.use('/api/auth', require('./server/routes/auth'));

// Protected
app.use('/api/leads',         authMiddleware, require('./server/routes/leads'));
app.use('/api/messages',      authMiddleware, require('./server/routes/messages'));
app.use('/api/notes',         authMiddleware, require('./server/routes/notes'));
app.use('/api/calls',         authMiddleware, require('./server/routes/calls'));
app.use('/api/activities',    authMiddleware, require('./server/routes/activities'));
app.use('/api/users',         authMiddleware, require('./server/routes/users'));
app.use('/api/sms-records',   authMiddleware, require('./server/routes/sms'));
app.use('/api/email-records', authMiddleware, require('./server/routes/emails'));

// --------------- Static files ---------------
if (!process.env.VERCEL) {
  app.use(express.static(__dirname, { extensions: ['html'] }));
}

// --------------- Error handling ---------------
app.all('/api/{*path}', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// --------------- Start ---------------
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('CoreConnect serving: ' + __dirname);
    console.log('Open: http://localhost:' + PORT + '/');
    console.log('(Press Ctrl+C to stop.)');
  });
}

module.exports = app;
