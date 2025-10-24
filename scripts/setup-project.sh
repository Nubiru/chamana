#!/bin/bash

# =====================================================
# Script de Configuración del Proyecto
# Proyecto: Sistema de Gestión de Productos
# Fase: 0 - Comienzo
# Fecha: 15 de Octubre, 2025
# =====================================================

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con color
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=====================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=====================================================${NC}"
}

# Verificar si estamos en el directorio correcto
if [ ! -f "README.md" ]; then
    print_error "Este script debe ejecutarse desde el directorio raíz del proyecto"
    exit 1
fi

print_header "CONFIGURACIÓN DEL PROYECTO - FASE 0: COMIENZO"

# =====================================================
# VERIFICAR PRERREQUISITOS
# =====================================================
print_message "Verificando prerrequisitos..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Por favor instala Node.js 18+ desde https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js versión 18+ requerida. Versión actual: $(node --version)"
    exit 1
fi

print_message "✅ Node.js $(node --version) encontrado"

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi

print_message "✅ npm $(npm --version) encontrado"

# Verificar PostgreSQL
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL no está instalado. Por favor instala PostgreSQL 15+ desde https://www.postgresql.org/download/"
    exit 1
fi

print_message "✅ PostgreSQL encontrado"

# =====================================================
# CONFIGURAR VARIABLES DE ENTORNO
# =====================================================
print_message "Configurando variables de entorno..."

# Crear archivo .env si no existe
if [ ! -f ".env" ]; then
    cat > .env << EOF
# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=proyecto_db_basico
DB_USER=postgres
DB_PASSWORD=password

# Configuración del Servidor
PORT=3000
NODE_ENV=development

# Configuración de la Aplicación
APP_NAME=Sistema de Gestión de Productos
APP_VERSION=0.1.0
APP_PHASE=comienzo
EOF
    print_message "✅ Archivo .env creado"
else
    print_message "✅ Archivo .env ya existe"
fi

# =====================================================
# INSTALAR DEPENDENCIAS
# =====================================================
print_message "Instalando dependencias de Node.js..."

# Instalar dependencias para Fase 0
cd 0.comienzo/web
if [ ! -f "package.json" ]; then
    print_error "package.json no encontrado en 0.comienzo/web/"
    exit 1
fi

npm install
print_message "✅ Dependencias instaladas para Fase 0"

cd ../..

# =====================================================
# CONFIGURAR BASE DE DATOS
# =====================================================
print_message "Configurando base de datos..."

# Solicitar credenciales de PostgreSQL
echo -n "Ingresa el nombre de usuario de PostgreSQL (default: postgres): "
read DB_USER
DB_USER=${DB_USER:-postgres}

echo -n "Ingresa la contraseña de PostgreSQL: "
read -s DB_PASSWORD
echo

echo -n "Ingresa el host de PostgreSQL (default: localhost): "
read DB_HOST
DB_HOST=${DB_HOST:-localhost}

echo -n "Ingresa el puerto de PostgreSQL (default: 5432): "
read DB_PORT
DB_PORT=${DB_PORT:-5432}

# Probar conexión a PostgreSQL
print_message "Probando conexión a PostgreSQL..."
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT 1;" &> /dev/null; then
    print_message "✅ Conexión a PostgreSQL exitosa"
else
    print_error "No se pudo conectar a PostgreSQL. Verifica las credenciales."
    exit 1
fi

# Crear base de datos si no existe
print_message "Creando base de datos..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE proyecto_db_basico;" 2>/dev/null || print_warning "La base de datos ya existe"

# Ejecutar esquema de Fase 0
print_message "Ejecutando esquema de base de datos..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d proyecto_db_basico -f 0.comienzo/database/schema.sql

# Insertar datos de ejemplo
print_message "Insertando datos de ejemplo..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d proyecto_db_basico -f 0.comienzo/database/data.sql

print_message "✅ Base de datos configurada exitosamente"

# =====================================================
# CONFIGURAR APLICACIÓN WEB
# =====================================================
print_message "Configurando aplicación web..."

# Actualizar archivo .env con credenciales reales
cat > .env << EOF
# Configuración de Base de Datos
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=proyecto_db_basico
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Configuración del Servidor
PORT=3000
NODE_ENV=development

# Configuración de la Aplicación
APP_NAME=Sistema de Gestión de Productos
APP_VERSION=0.1.0
APP_PHASE=comienzo
EOF

print_message "✅ Configuración de aplicación actualizada"

# =====================================================
# CREAR SCRIPTS DE UTILIDAD
# =====================================================
print_message "Creando scripts de utilidad..."

# Script para iniciar la aplicación
cat > start.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando Sistema de Gestión de Productos - Fase 0"
cd 0.comienzo/web
npm start
EOF
chmod +x start.sh

# Script para detener la aplicación
cat > stop.sh << 'EOF'
#!/bin/bash
echo "🛑 Deteniendo aplicación..."
pkill -f "node.*app.js" || echo "No hay procesos de la aplicación ejecutándose"
EOF
chmod +x stop.sh

# Script para backup de base de datos
cat > backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
echo "📦 Creando backup de base de datos: $BACKUP_FILE"
pg_dump -h localhost -U postgres -d proyecto_db_basico > "backups/$BACKUP_FILE"
echo "✅ Backup creado: backups/$BACKUP_FILE"
EOF
chmod +x backup-db.sh

# Crear directorio de backups
mkdir -p backups

print_message "✅ Scripts de utilidad creados"

# =====================================================
# VERIFICAR INSTALACIÓN
# =====================================================
print_message "Verificando instalación..."

# Verificar estructura de archivos
if [ -d "0.comienzo" ] && [ -d "0.comienzo/database" ] && [ -d "0.comienzo/web" ]; then
    print_message "✅ Estructura de archivos correcta"
else
    print_error "Estructura de archivos incorrecta"
    exit 1
fi

# Verificar archivos de base de datos
if [ -f "0.comienzo/database/schema.sql" ] && [ -f "0.comienzo/database/data.sql" ]; then
    print_message "✅ Archivos de base de datos encontrados"
else
    print_error "Archivos de base de datos no encontrados"
    exit 1
fi

# Verificar aplicación web
if [ -f "0.comienzo/web/app.js" ] && [ -f "0.comienzo/web/package.json" ]; then
    print_message "✅ Aplicación web encontrada"
else
    print_error "Aplicación web no encontrada"
    exit 1
fi

# =====================================================
# MOSTRAR INFORMACIÓN DE INICIO
# =====================================================
print_header "INSTALACIÓN COMPLETADA EXITOSAMENTE"

echo -e "${GREEN}🎉 El proyecto ha sido configurado correctamente${NC}"
echo
echo -e "${BLUE}📋 Información del Proyecto:${NC}"
echo "   • Proyecto: Sistema de Gestión de Productos"
echo "   • Fase: 0 - Comienzo"
echo "   • Base de Datos: PostgreSQL"
echo "   • Backend: Node.js + Express.js"
echo "   • Frontend: HTML5 + CSS3 + JavaScript"
echo
echo -e "${BLUE}🚀 Comandos Disponibles:${NC}"
echo "   • ./start.sh          - Iniciar la aplicación"
echo "   • ./stop.sh           - Detener la aplicación"
echo "   • ./backup-db.sh      - Crear backup de la base de datos"
echo
echo -e "${BLUE}🌐 Acceso a la Aplicación:${NC}"
echo "   • URL: http://localhost:3000"
echo "   • Productos: http://localhost:3000/productos"
echo "   • Usuarios: http://localhost:3000/usuarios"
echo "   • API: http://localhost:3000/api/productos"
echo
echo -e "${BLUE}📚 Documentación:${NC}"
echo "   • README.md                    - Documentación principal"
echo "   • PROGRESSION_TRACKING.md     - Seguimiento de progreso"
echo "   • MIGRATION_GUIDE.md          - Guía de migraciones"
echo "   • 0.comienzo/documentation/   - Documentación de Fase 0"
echo
echo -e "${BLUE}🔧 Configuración:${NC}"
echo "   • Base de Datos: $DB_HOST:$DB_PORT/proyecto_db_basico"
echo "   • Usuario: $DB_USER"
echo "   • Puerto de la Aplicación: 3000"
echo
echo -e "${YELLOW}⚠️  Notas Importantes:${NC}"
echo "   • Asegúrate de que PostgreSQL esté ejecutándose"
echo "   • El archivo .env contiene las credenciales de la base de datos"
echo "   • Los backups se guardan en el directorio ./backups/"
echo "   • Para desarrollo, usa 'npm run dev' en lugar de 'npm start'"
echo
echo -e "${GREEN}✅ ¡Listo para comenzar el desarrollo!${NC}"

print_header "FIN DE LA CONFIGURACIÓN"
