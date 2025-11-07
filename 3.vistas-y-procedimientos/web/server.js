// =====================================================
// Phase 3 Web Server - 3NF Normalized Database
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Fecha: 6 de Noviembre, 2025
// Versión: 3.0.0
// =====================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('node:path');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/views', require('./routes/views'));
app.use('/api/procedures', require('./routes/procedures'));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Phase 3 Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`📈 Reports: http://localhost:${PORT}/reportes.html`);
  console.log(`⚙️  Processes: http://localhost:${PORT}/procesos.html`);
});
