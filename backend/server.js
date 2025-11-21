require('dotenv').config();
const express = require('express');
const cors = require('cors');
const incidentsRouter = require('./routes/incidents');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000'
}));
app.use(express.json());

// Routes
app.use('/api', incidentsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`CrashLensAI backend running on http://localhost:${PORT}`);
});
