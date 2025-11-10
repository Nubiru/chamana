// Database Type Definitions for CHAMANA E-commerce

export interface VentaMensual extends Record<string, unknown> {
  mes: string;
  total_pedidos: number;
  total_mes: number;
  ticket_promedio: number;
}

export interface InventarioCritico extends Record<string, unknown> {
  id: number;
  nombre: string;
  stock_disponible: number;
  stock_inicial: number;
  stock_vendido: number;
  estado_stock: 'AGOTADO' | 'CRÍTICO' | 'BAJO' | 'NORMAL';
}

export interface TopProducto extends Record<string, unknown> {
  id: number;
  nombre: string;
  unidades_vendidas: number;
  ingresos_generados: number;
}

export interface AnalisisCliente extends Record<string, unknown> {
  cliente_id: number;
  nombre_completo: string;
  email: string;
  total_pedidos: number;
  total_gastado: number;
  ticket_promedio: number;
  ultima_compra: string | null;
}

export interface RotacionInventario extends Record<string, unknown> {
  id: number;
  nombre: string;
  stock_disponible: number;
  stock_vendido: number;
  porcentaje_vendido: number;
  clasificacion_rotacion: 'Sin Ventas' | 'Baja Rotación' | 'Rotación Media' | 'Alta Rotación';
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
