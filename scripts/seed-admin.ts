import { getPayload } from 'payload';
import config from '../payload.config';

async function seed() {
  const payload = await getPayload({ config });

  await payload.create({
    collection: 'users',
    data: {
      email: 'chamanasomostodas@gmail.com',
      password: 'CHANGE-THIS-IMMEDIATELY',
      nombre: 'Cintia',
      role: 'admin',
    },
  });

  console.log('Admin creada: chamanasomostodas@gmail.com');
  console.log('IMPORTANTE: Cambiar contraseña inmediatamente en chamana.app/admin');
  process.exit(0);
}

seed();
