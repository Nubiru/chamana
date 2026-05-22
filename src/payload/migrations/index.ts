import * as migration_20260309_210000_add_publicaciones_prototipos from './20260309_210000_add_publicaciones_prototipos';
import * as migration_20260520_230000_add_telas_estado_leadTimeDias from './20260520_230000_add_telas_estado_leadTimeDias';
import * as migration_20260521_030000_add_modelo_estado_variante_metros from './20260521_030000_add_modelo_estado_variante_metros';
import * as migration_20260521_040000_rename_telas_precioPorMetro_to_costoPorMetro from './20260521_040000_rename_telas_precioPorMetro_to_costoPorMetro';
import * as migration_20260522_100000_rename_publicaciones_notasCintia_to_notasRevision from './20260522_100000_rename_publicaciones_notasCintia_to_notasRevision';
import * as migration_20260522_140000_add_recados from './20260522_140000_add_recados';

export const migrations = [
  {
    up: migration_20260309_210000_add_publicaciones_prototipos.up,
    down: migration_20260309_210000_add_publicaciones_prototipos.down,
    name: '20260309_210000_add_publicaciones_prototipos',
  },
  {
    up: migration_20260520_230000_add_telas_estado_leadTimeDias.up,
    down: migration_20260520_230000_add_telas_estado_leadTimeDias.down,
    name: '20260520_230000_add_telas_estado_leadTimeDias',
  },
  {
    up: migration_20260521_030000_add_modelo_estado_variante_metros.up,
    down: migration_20260521_030000_add_modelo_estado_variante_metros.down,
    name: '20260521_030000_add_modelo_estado_variante_metros',
  },
  {
    up: migration_20260521_040000_rename_telas_precioPorMetro_to_costoPorMetro.up,
    down: migration_20260521_040000_rename_telas_precioPorMetro_to_costoPorMetro.down,
    name: '20260521_040000_rename_telas_precioPorMetro_to_costoPorMetro',
  },
  {
    up: migration_20260522_100000_rename_publicaciones_notasCintia_to_notasRevision.up,
    down: migration_20260522_100000_rename_publicaciones_notasCintia_to_notasRevision.down,
    name: '20260522_100000_rename_publicaciones_notasCintia_to_notasRevision',
  },
  {
    up: migration_20260522_140000_add_recados.up,
    down: migration_20260522_140000_add_recados.down,
    name: '20260522_140000_add_recados',
  },
];
