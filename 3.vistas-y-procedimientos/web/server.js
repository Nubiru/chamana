// =====================================================
// Phase 3 Web Server - 3NF Normalized Database
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Fecha: 6 de Noviembre, 2025
// Versión: 3.0.0
// =====================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('node:path');
const {
  helmetConfig,
  corsOptions,
  sanitizeInput,
  requestSizeLimit,
  apiLimiter,
  csrfProtection
} = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 3003;

// Security Middleware (order matters!)
app.use(helmetConfig); // Security headers first
app.use(cors(corsOptions)); // CORS configuration
app.use(cookieParser()); // Parse cookies (required for CSRF)
app.use(express.json(requestSizeLimit.json)); // Body parser with size limit
app.use(express.urlencoded(requestSizeLimit.urlencoded));
app.use(sanitizeInput); // XSS protection
app.use('/api', apiLimiter); // Rate limiting for all API routes
app.use('/api', csrfProtection); // CSRF protection for API routes
app.use(express.static(path.join(__dirname, 'public')));

// Swagger Documentation
const { swaggerUi, swaggerSpec } = require('./swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/views', require('./routes/views'));
app.use('/api/procedures', require('./routes/procedures'));
app.use('/api/database-tests', require('./routes/database-tests'));
app.use('/api/exports', require('./routes/exports'));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Phase 4 Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`📈 Reports: http://localhost:${PORT}/reportes.html`);
  console.log(
    `📊 Advanced Reports: http://localhost:${PORT}/reportes_avanzados.html`
  );
  console.log(`⚙️  Processes: http://localhost:${PORT}/procesos.html`);
  console.log(
    `🧪 Database Tests: http://localhost:${PORT}/database-tests.html`
  );
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
});
