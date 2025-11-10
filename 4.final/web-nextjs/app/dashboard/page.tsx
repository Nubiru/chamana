import { BarChart } from '@/components/charts/BarChart';
import { LineChart } from '@/components/charts/LineChart';
import { EmptyState } from '@/components/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getInventarioCritico, getTopProductos, getVentasMensuales } from '@/lib/db/views';

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  // Fetch data from database views
  const [ventas, inventario, topProductos] = await Promise.all([
    getVentasMensuales().catch(() => []),
    getInventarioCritico().catch(() => []),
    getTopProductos(10).catch(() => []),
  ]);

  // Calculate KPIs
  const totalVentas = ventas.reduce((sum, v) => sum + Number(v.total_mes || 0), 0);
  const ticketPromedio =
    ventas.length > 0
      ? ventas.reduce((sum, v) => sum + Number(v.ticket_promedio || 0), 0) / ventas.length
      : 0;
  const productosCriticos = inventario.filter(
    (p) => p.estado_stock === 'CRÍTICO' || p.estado_stock === 'AGOTADO'
  ).length;

  // Prepare chart data
  const ventasLabels = ventas.map((v) => v.mes).reverse();
  const ventasData = ventas.map((v) => Number(v.total_mes || 0)).reverse();

  const topProductosLabels = topProductos.slice(0, 10).map((p) => p.nombre);
  const topProductosData = topProductos.slice(0, 10).map((p) => Number(p.unidades_vendidas || 0));

  return (
    <div className="space-y-8 p-6 md:p-12">
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-titles">
          Dashboard CHAMANA
        </h1>
        <p className="text-muted-foreground text-sm md:text-base font-text">
          Sistema de gestión e-commerce de ropa femenina artesanal
        </p>
      </div>

      {/* KPI Cards - Increased spacing for airy feel */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">S/. {totalVentas.toLocaleString('es-PE')}</div>
            <p className="text-xs text-muted-foreground">Últimos {ventas.length} meses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/. {ticketPromedio.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Por pedido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Críticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{productosCriticos}</div>
            <p className="text-xs text-muted-foreground">Stock bajo o agotado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topProductos.length}</div>
            <p className="text-xs text-muted-foreground">Productos más vendidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Increased spacing */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            {ventasLabels.length > 0 ? (
              <div className="h-64">
                <LineChart
                  labels={ventasLabels}
                  datasets={[
                    {
                      label: 'Ventas (S/.)',
                      data: ventasData,
                      borderColor: 'oklch(0.20 0.01 180)', // Forest Primary - brand color
                      backgroundColor: 'oklch(0.20 0.01 180 / 0.5)', // Forest Primary with opacity
                    },
                  ]}
                  title="Evolución de Ventas"
                />
              </div>
            ) : (
              <EmptyState
                title="No hay datos de ventas"
                description="No se encontraron registros de ventas mensuales para mostrar."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Productos</CardTitle>
          </CardHeader>
          <CardContent>
            {topProductosLabels.length > 0 ? (
              <div className="h-64">
                <BarChart
                  labels={topProductosLabels}
                  datasets={[
                    {
                      label: 'Unidades Vendidas',
                      data: topProductosData,
                      backgroundColor: 'oklch(0.64 0.02 130 / 0.5)', // Meadow - brand color with opacity
                    },
                  ]}
                  title="Productos Más Vendidos"
                />
              </div>
            ) : (
              <EmptyState
                title="No hay datos de productos"
                description="No se encontraron productos vendidos para mostrar."
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inventory Status Table */}
      <Card>
        <CardHeader>
          <CardTitle>Estado del Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Producto</th>
                  <th className="text-right p-2">Stock Disponible</th>
                  <th className="text-right p-2">Stock Vendido</th>
                  <th className="text-left p-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {inventario.length > 0 ? (
                  inventario.slice(0, 10).map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{item.nombre}</td>
                      <td className="text-right p-2">{item.stock_disponible}</td>
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center">
                      <EmptyState
                        title="No hay inventario"
                        description="No se encontraron productos en el inventario."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
