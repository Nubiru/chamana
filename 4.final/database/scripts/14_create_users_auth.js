/**
 * Script 14: Create Users & Authentication Tables - Phase 4
 *
 * Creates authentication system tables:
 * - usuarios: User accounts with email and password
 * - roles: User roles (admin, manager, employee, customer)
 * - usuarios_roles: Many-to-many relationship between users and roles
 *
 * Also creates initial admin user for testing.
 */

const { createPool, logError, logSuccess, executeQuery } = require('./00_db');
const bcrypt = require('bcrypt');

async function createUsersAuth() {
  const pool = createPool('fase3');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('🚀 Creando tablas de autenticación y usuarios...\n');

    // ===================================================================
    // Table 1: roles
    // ===================================================================

    console.log('📦 Creando tabla roles...');
    await executeQuery(
      client,
      `
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(50) UNIQUE NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        permisos JSONB DEFAULT '[]'::JSONB,
        activo BOOLEAN DEFAULT TRUE,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    );
    console.log('   ✅ roles');

    // ===================================================================
    // Table 2: usuarios
    // ===================================================================

    console.log('\n📦 Creando tabla usuarios...');
    await executeQuery(
      client,
      `
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100) NOT NULL,
        activo BOOLEAN DEFAULT TRUE,
        email_verificado BOOLEAN DEFAULT FALSE,
        ultimo_acceso TIMESTAMP,
        intentos_login_fallidos INTEGER DEFAULT 0,
        bloqueado_hasta TIMESTAMP,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    );
    console.log('   ✅ usuarios');

    // ===================================================================
    // Table 3: usuarios_roles (Many-to-Many)
    // ===================================================================

    console.log('\n📦 Creando tabla usuarios_roles...');
    await executeQuery(
      client,
      `
      CREATE TABLE IF NOT EXISTS usuarios_roles (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        asignado_por INTEGER REFERENCES usuarios(id),
        UNIQUE(usuario_id, role_id)
      )
    `
    );
    console.log('   ✅ usuarios_roles');

    // ===================================================================
    // Indexes for performance
    // ===================================================================

    console.log('\n📌 Creando índices...');
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)`
    );
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo)`
    );
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_usuarios_roles_usuario ON usuarios_roles(usuario_id)`
    );
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_usuarios_roles_role ON usuarios_roles(role_id)`
    );
    await executeQuery(
      client,
      `CREATE INDEX IF NOT EXISTS idx_roles_codigo ON roles(codigo)`
    );
    console.log('   ✅ Índices creados');

    // ===================================================================
    // Insert default roles
    // ===================================================================

    console.log('\n👥 Insertando roles por defecto...');

    const roles = [
      {
        codigo: 'admin',
        nombre: 'Administrador',
        descripcion: 'Acceso completo al sistema',
        permisos: [
          'read:all',
          'write:all',
          'delete:all',
          'manage:users',
          'manage:roles',
          'view:reports',
          'export:data'
        ]
      },
      {
        codigo: 'manager',
        nombre: 'Gerente',
        descripcion: 'Gestión de inventario y pedidos',
        permisos: [
          'read:inventory',
          'write:inventory',
          'read:orders',
          'write:orders',
          'view:reports',
          'export:data'
        ]
      },
      {
        codigo: 'employee',
        nombre: 'Empleado',
        descripcion: 'Operaciones básicas de ventas',
        permisos: ['read:products', 'read:orders', 'write:orders']
      },
      {
        codigo: 'customer',
        nombre: 'Cliente',
        descripcion: 'Acceso a catálogo y pedidos propios',
        permisos: ['read:products', 'read:own-orders', 'write:own-orders']
      }
    ];

    for (const role of roles) {
      await executeQuery(
        client,
        `INSERT INTO roles (codigo, nombre, descripcion, permisos)
         VALUES ($1, $2, $3, $4::JSONB)
         ON CONFLICT (codigo) DO UPDATE
         SET nombre = EXCLUDED.nombre,
             descripcion = EXCLUDED.descripcion,
             permisos = EXCLUDED.permisos`,
        [
          role.codigo,
          role.nombre,
          role.descripcion,
          JSON.stringify(role.permisos)
        ]
      );
      console.log(`   ✅ Rol: ${role.codigo}`);
    }

    // ===================================================================
    // Create default admin user
    // ===================================================================

    console.log('\n👤 Creando usuario administrador por defecto...');

    const adminEmail = 'admin@chamana.cl';
    const adminPassword = 'admin123'; // Change in production!
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Check if admin user already exists
    const existingUser = await client.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [adminEmail]
    );

    if (existingUser.rows.length === 0) {
      const adminResult = await executeQuery(
        client,
        `INSERT INTO usuarios (email, password_hash, nombre, apellido, activo, email_verificado)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [adminEmail, hashedPassword, 'Admin', 'Sistema', true, true]
      );

      const adminUserId = adminResult.rows[0].id;

      // Assign admin role
      const adminRole = await client.query(
        "SELECT id FROM roles WHERE codigo = 'admin'"
      );
      const adminRoleId = adminRole.rows[0].id;

      await executeQuery(
        client,
        `INSERT INTO usuarios_roles (usuario_id, role_id)
         VALUES ($1, $2)
         ON CONFLICT (usuario_id, role_id) DO NOTHING`,
        [adminUserId, adminRoleId]
      );

      console.log('   ✅ Usuario administrador creado');
      console.log(`   📧 Email: ${adminEmail}`);
      console.log(`   🔑 Password: ${adminPassword}`);
      console.log('   ⚠️  IMPORTANTE: Cambiar contraseña en producción!');
    } else {
      console.log('   ℹ️  Usuario administrador ya existe');
    }

    // ===================================================================
    // Create test users for each role
    // ===================================================================

    console.log('\n👥 Creando usuarios de prueba...');

    const testUsers = [
      {
        email: 'manager@chamana.cl',
        password: 'manager123',
        nombre: 'Gerente',
        apellido: 'Prueba',
        role: 'manager'
      },
      {
        email: 'empleado@chamana.cl',
        password: 'empleado123',
        nombre: 'Empleado',
        apellido: 'Prueba',
        role: 'employee'
      },
      {
        email: 'cliente@chamana.cl',
        password: 'cliente123',
        nombre: 'Cliente',
        apellido: 'Prueba',
        role: 'customer'
      }
    ];

    for (const user of testUsers) {
      const existing = await client.query(
        'SELECT id FROM usuarios WHERE email = $1',
        [user.email]
      );

      if (existing.rows.length === 0) {
        const hashedPwd = await bcrypt.hash(user.password, 10);
        const userResult = await executeQuery(
          client,
          `INSERT INTO usuarios (email, password_hash, nombre, apellido, activo, email_verificado)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`,
          [user.email, hashedPwd, user.nombre, user.apellido, true, true]
        );

        const userId = userResult.rows[0].id;
        const roleResult = await client.query(
          'SELECT id FROM roles WHERE codigo = $1',
          [user.role]
        );
        const roleId = roleResult.rows[0].id;

        await executeQuery(
          client,
          `INSERT INTO usuarios_roles (usuario_id, role_id)
           VALUES ($1, $2)
           ON CONFLICT (usuario_id, role_id) DO NOTHING`,
          [userId, roleId]
        );

        console.log(`   ✅ Usuario: ${user.email} (${user.role})`);
      } else {
        console.log(`   ℹ️  Usuario ${user.email} ya existe`);
      }
    }

    await client.query('COMMIT');

    logSuccess(
      '14_create_users_auth.js',
      'Sistema de autenticación creado exitosamente',
      {
        'Tablas creadas': 3,
        'Roles creados': 4,
        'Usuarios de prueba': 4,
        'Índices creados': 5
      }
    );

    console.log('\n📋 Resumen:');
    console.log('   • Tablas: roles, usuarios, usuarios_roles');
    console.log('   • Roles: admin, manager, employee, customer');
    console.log('   • Usuarios de prueba creados');
    console.log('\n💡 Próximo paso: Implementar middleware de autenticación\n');
  } catch (error) {
    await client.query('ROLLBACK');
    logError('14_create_users_auth.js', 'Creación de Autenticación', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute script
createUsersAuth()
  .then(() => {
    console.log('🎉 Script completado exitosamente\n');
    process.exit(0);
  })
  .catch((_error) => {
    console.error('💥 Script falló\n');
    process.exit(1);
  });
