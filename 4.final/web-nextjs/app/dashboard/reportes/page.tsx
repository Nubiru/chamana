'use client';

import { EmptyState } from '@/components/empty-state';
import { TableSkeleton } from '@/components/loading-skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/toast';
import type {
  AnalisisCliente,
  InventarioCritico,
  RotacionInventario,
  TopProducto,
  VentaMensual,
} from '@/types/database';
import { useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';

export default function ReportesPage() {
  const { addToast } = useToast();
  const [ventasMensuales, setVentasMensuales] = useState<VentaMensual[]>([]);
  const [inventarioCritico, setInventarioCritico] = useState<InventarioCritico[]>([]);
  const [topProductos, setTopProductos] = useState<TopProducto[]>([]);
  const [analisisClientes, setAnalisisClientes] = useState<AnalisisCliente[]>([]);
  const [rotacionInventario, setRotacionInventario] = useState<RotacionInventario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [ventas, inventario, top, clientes, rotacion] = await Promise.all([
          fetch('/api/views/ventas-mensuales').then((r) => r.json()),
          fetch('/api/views/inventario-critico').then((r) => r.json()),
          fetch('/api/views/top-productos').then((r) => r.json()),
          fetch('/api/views/analisis-clientes').then((r) => r.json()),
          fetch('/api/views/rotacion-inventario').then((r) => r.json()),
        ]);

        setVentasMensuales(ventas.data || []);
        setInventarioCritico(inventario.data || []);
        setTopProductos(top.data || []);
        setAnalisisClientes(clientes.data || []);
        setRotacionInventario(rotacion.data || []);
      } catch (error) {
        console.error('Error fetching reports:', error);
        addToast({
          title: 'Error al cargar reportes',
          description: error instanceof Error ? error.message : 'Ocurrió un error desconocido',
          variant: 'error',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [addToast]);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Análisis de ventas, inventario y clientes
        </p>
      </div>

      <Tabs defaultValue="ventas" className="space-y-4">
        <TabsList className="w-full overflow-x-auto flex md:inline-flex">
          <TabsTrigger value="ventas" className="text-xs md:text-sm whitespace-nowrap">
            Ventas Mensuales
          </TabsTrigger>
          <TabsTrigger value="inventario" className="text-xs md:text-sm whitespace-nowrap">
            Inventario
          </TabsTrigger>
          <TabsTrigger value="productos" className="text-xs md:text-sm whitespace-nowrap">
            Top Productos
          </TabsTrigger>
          <TabsTrigger value="clientes" className="text-xs md:text-sm whitespace-nowrap">
            Clientes
          </TabsTrigger>
          <TabsTrigger value="rotacion" className="text-xs md:text-sm whitespace-nowrap">
            Rotación
          </TabsTrigger>
        </TabsList>

        {/* Ventas Mensuales */}
        <TabsContent value="ventas">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Ventas Mensuales</CardTitle>
              <CSVLink
                data={ventasMensuales}
                filename="ventas_mensuales.csv"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Exportar CSV
              </CSVLink>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton rows={5} />
              ) : ventasMensuales.length === 0 ? (
                <EmptyState
                  title="No hay datos de ventas"
                  description="No se encontraron registros de ventas mensuales."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Mes</th>
                        <th className="text-right p-2">Total Pedidos</th>
                        <th className="text-right p-2">Total Ventas (S/.)</th>
                        <th className="text-right p-2">Ticket Promedio (S/.)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventasMensuales.map((venta, index) => (
                        <tr key={venta.mes || `venta-${index}`} className="border-b hover:bg-muted/50">
                          <td className="p-2">{venta.mes}</td>
                          <td className="text-right p-2">{venta.total_pedidos}</td>
                          <td className="text-right p-2">
                            {Number(venta.total_mes).toLocaleString('es-PE', {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="text-right p-2">
                            {Number(venta.ticket_promedio).toLocaleString('es-PE', {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventario Crítico */}
        <TabsContent value="inventario">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Inventario Crítico</CardTitle>
              <CSVLink
                data={inventarioCritico}
                filename="inventario_critico.csv"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Exportar CSV
              </CSVLink>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton rows={5} />
              ) : inventarioCritico.length === 0 ? (
                <EmptyState
                  title="No hay inventario crítico"
                  description="No se encontraron productos con stock crítico."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Producto</th>
                        <th className="text-right p-2">Stock Disponible</th>
                        <th className="text-right p-2">Stock Inicial</th>
                        <th className="text-right p-2">Stock Vendido</th>
                        <th className="text-left p-2">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventarioCritico.map((item, index) => (
                        <tr key={item.id || `inventario-${index}`} className="border-b hover:bg-muted/50">
                          <td className="p-2">{item.nombre}</td>
                          <td className="text-right p-2">{item.stock_disponible}</td>
                          <td className="text-right p-2">{item.stock_inicial}</td>
                          <td className="text-right p-2">{item.stock_vendido}</td>
                          <td className="p-2">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                item.estado_stock === 'AGOTADO'
                                  ? 'bg-red-100 text-red-800'
                                  : item.estado_stock === 'CRÍTICO'
                                    ? 'bg-orange-100 text-orange-800'
                                    : item.estado_stock === 'BAJO'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {item.estado_stock}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Productos */}
        <TabsContent value="productos">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top Productos</CardTitle>
              <CSVLink
                data={topProductos}
                filename="top_productos.csv"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Exportar CSV
              </CSVLink>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton rows={5} />
              ) : topProductos.length === 0 ? (
                <EmptyState
                  title="No hay productos vendidos"
                  description="No se encontraron productos con ventas registradas."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Producto</th>
                        <th className="text-right p-2">Unidades Vendidas</th>
                        <th className="text-right p-2">Ingresos Generados (S/.)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProductos.map((producto, index) => (
                        <tr key={producto.id || `producto-${index}`} className="border-b hover:bg-muted/50">
                          <td className="p-2">{producto.nombre}</td>
                          <td className="text-right p-2">{producto.unidades_vendidas}</td>
                          <td className="text-right p-2">
                            {Number(producto.ingresos_generados).toLocaleString('es-PE', {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Análisis Clientes */}
        <TabsContent value="clientes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Análisis de Clientes</CardTitle>
              <CSVLink
                data={analisisClientes}
                filename="analisis_clientes.csv"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Exportar CSV
              </CSVLink>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton rows={5} />
              ) : analisisClientes.length === 0 ? (
                <EmptyState
                  title="No hay datos de clientes"
                  description="No se encontraron clientes con pedidos registrados."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Cliente</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-right p-2">Total Pedidos</th>
                        <th className="text-right p-2">Total Gastado (S/.)</th>
                        <th className="text-right p-2">Ticket Promedio (S/.)</th>
                        <th className="text-left p-2">Última Compra</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analisisClientes.map((cliente, index) => (
                        <tr key={cliente.cliente_id || `cliente-${index}`} className="border-b hover:bg-muted/50">
                          <td className="p-2">{cliente.nombre_completo}</td>
                          <td className="p-2">{cliente.email}</td>
                          <td className="text-right p-2">{cliente.total_pedidos}</td>
                          <td className="text-right p-2">
                            {Number(cliente.total_gastado).toLocaleString('es-PE', {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="text-right p-2">
                            {Number(cliente.ticket_promedio).toLocaleString('es-PE', {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="p-2">
                            {cliente.ultima_compra
                              ? new Date(cliente.ultima_compra).toLocaleDateString('es-PE')
                              : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rotación Inventario */}
        <TabsContent value="rotacion">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Rotación de Inventario</CardTitle>
              <CSVLink
                data={rotacionInventario}
                filename="rotacion_inventario.csv"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Exportar CSV
              </CSVLink>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton rows={5} />
              ) : rotacionInventario.length === 0 ? (
                <EmptyState
                  title="No hay datos de rotación"
                  description="No se encontraron datos de rotación de inventario."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Producto</th>
                        <th className="text-right p-2">Stock Disponible</th>
                        <th className="text-right p-2">Stock Vendido</th>
                        <th className="text-right p-2">% Vendido</th>
                        <th className="text-left p-2">Clasificación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rotacionInventario.map((item, index) => (
                        <tr key={item.id || `rotacion-${index}`} className="border-b hover:bg-muted/50">
                          <td className="p-2">{item.nombre}</td>
                          <td className="text-right p-2">{item.stock_disponible}</td>
                          <td className="text-right p-2">{item.stock_vendido}</td>
                          <td className="text-right p-2">
                            {Number(item.porcentaje_vendido).toFixed(2)}%
                          </td>
                          <td className="p-2">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                item.clasificacion_rotacion === 'Alta Rotación'
                                  ? 'bg-green-100 text-green-800'
                                  : item.clasificacion_rotacion === 'Rotación Media'
                                    ? 'bg-blue-100 text-blue-800'
                                    : item.clasificacion_rotacion === 'Baja Rotación'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {item.clasificacion_rotacion}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
