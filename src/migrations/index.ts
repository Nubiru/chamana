import * as migration_20260309_210000_add_publicaciones_prototipos from './20260309_210000_add_publicaciones_prototipos';

export const migrations = [
  {
    up: migration_20260309_210000_add_publicaciones_prototipos.up,
    down: migration_20260309_210000_add_publicaciones_prototipos.down,
    name: '20260309_210000_add_publicaciones_prototipos',
  },
];
