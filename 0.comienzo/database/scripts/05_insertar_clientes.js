// =====================================================
// Script 05: Insertar Clientes Ficticios
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Propósito: Insertar 20 clientes ficticios para pruebas
// Nota: Datos ficticios con nombres mexicanos realistas
// =====================================================

const { pool } = require('./00_db');

// Clientes ficticios (20 clientes con datos realistas mexicanos)
const clientes = [
  {
    nombre: 'María',
    apellido: 'García López',
    email: 'maria.garcia@email.com',
    telefono: '555-0101'
  },
  {
    nombre: 'Ana',
    apellido: 'Martínez Rodríguez',
    email: 'ana.martinez@email.com',
    telefono: '555-0102'
  },
  {
    nombre: 'Sofía',
    apellido: 'Hernández Pérez',
    email: 'sofia.hernandez@email.com',
    telefono: '555-0103'
  },
  {
    nombre: 'Isabella',
    apellido: 'González Sánchez',
    email: 'isabella.gonzalez@email.com',
    telefono: '555-0104'
  },
  {
    nombre: 'Valentina',
    apellido: 'López Ramírez',
    email: 'valentina.lopez@email.com',
    telefono: '555-0105'
  },
  {
    nombre: 'Camila',
    apellido: 'Rodríguez Torres',
    email: 'camila.rodriguez@email.com',
    telefono: '555-0106'
  },
  {
    nombre: 'Lucía',
    apellido: 'Pérez Flores',
    email: 'lucia.perez@email.com',
    telefono: '555-0107'
  },
  {
    nombre: 'Daniela',
    apellido: 'Sánchez Rivera',
    email: 'daniela.sanchez@email.com',
    telefono: '555-0108'
  },
  {
    nombre: 'Victoria',
    apellido: 'Ramírez Cruz',
    email: 'victoria.ramirez@email.com',
    telefono: '555-0109'
  },
  {
    nombre: 'Martina',
    apellido: 'Torres Morales',
    email: 'martina.torres@email.com',
    telefono: '555-0110'
  },
  {
    nombre: 'Emma',
    apellido: 'Flores Gutiérrez',
    email: 'emma.flores@email.com',
    telefono: '555-0111'
  },
  {
    nombre: 'Mía',
    apellido: 'Rivera Díaz',
    email: 'mia.rivera@email.com',
    telefono: '555-0112'
  },
  {
    nombre: 'Renata',
    apellido: 'Cruz Mendoza',
    email: 'renata.cruz@email.com',
    telefono: '555-0113'
  },
  {
    nombre: 'Valeria',
    apellido: 'Morales Castro',
    email: 'valeria.morales@email.com',
    telefono: '555-0114'
  },
  {
    nombre: 'Natalia',
    apellido: 'Gutiérrez Ortiz',
    email: 'natalia.gutierrez@email.com',
    telefono: '555-0115'
  },
  {
    nombre: 'Elena',
    apellido: 'Díaz Vargas',
    email: 'elena.diaz@email.com',
    telefono: '555-0116'
  },
  {
    nombre: 'Paula',
    apellido: 'Mendoza Reyes',
    email: 'paula.mendoza@email.com',
    telefono: '555-0117'
  },
  {
    nombre: 'Fernanda',
    apellido: 'Castro Romero',
    email: 'fernanda.castro@email.com',
    telefono: '555-0118'
  },
  {
    nombre: 'Gabriela',
    apellido: 'Ortiz Silva',
    email: 'gabriela.ortiz@email.com',
    telefono: '555-0119'
  },
  {
    nombre: 'Carolina',
    apellido: 'Vargas Herrera',
    email: 'carolina.vargas@email.com',
    telefono: '555-0120'
  }
];

async function insertarClientes() {
  console.log('=====================================================');
  console.log('👥 CHAMANA - Inserción de Clientes Ficticios');
  console.log('=====================================================\n');

  try {
    console.log(`📌 Insertando ${clientes.length} clientes ficticios...\n`);

    let insertados = 0;

    for (const cliente of clientes) {
      try {
        const query = `
          INSERT INTO clientes (nombre, apellido, email, telefono, activo)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (email) DO NOTHING
          RETURNING id;
        `;

        const valores = [
          cliente.nombre,
          cliente.apellido,
          cliente.email,
          cliente.telefono,
          true
        ];

        const resultado = await pool.query(query, valores);

        if (resultado.rows.length > 0) {
          insertados++;
          console.log(
            `✅ Cliente insertado: ${cliente.nombre} ${cliente.apellido} (ID: ${resultado.rows[0].id})`
          );
        } else {
          console.log(`⚠️  Cliente "${cliente.email}" ya existía (omitido)`);
        }
      } catch (error) {
        console.error(
          `❌ Error insertando cliente ${cliente.nombre}:`,
          error.message
        );
      }
    }

    console.log(`\n✅ ${insertados} clientes insertados correctamente`);

    // Mostrar muestra de clientes
    console.log('\n📋 Muestra de clientes registrados:');
    const muestra = await pool.query(`
      SELECT id, nombre, apellido, email, telefono 
      FROM clientes 
      ORDER BY id 
      LIMIT 5;
    `);

    muestra.rows.forEach((c) => {
      console.log(
        `   ${c.id}. ${c.nombre} ${c.apellido} | ${c.email} | ${c.telefono}`
      );
    });

    // Total
    const total = await pool.query('SELECT COUNT(*) as total FROM clientes;');
    console.log(`\n   ... y ${total.rows[0].total - 5} más`);
    console.log(`   TOTAL: ${total.rows[0].total} clientes`);

    console.log('\n=====================================================');
    console.log('✨ Clientes ficticios insertados exitosamente!');
    console.log(`   ${total.rows[0].total} clientes disponibles para pruebas`);
    console.log('=====================================================');
    console.log('✨ Siguiente paso: Ejecutar "node 06_listar_todo.js"');
    console.log('=====================================================');
  } catch (error) {
    console.error('❌ Error al insertar clientes:', error.message);
    console.error('\n💡 Sugerencias:');
    console.error('   - Verifica que la tabla "clientes" exista');
    console.error('   - Ejecuta "node 02_crear_tablas.js" primero');
  } finally {
    await pool.end();
  }
}

// Ejecutar función
insertarClientes();
