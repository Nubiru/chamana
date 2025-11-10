'use client';

import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import type { ApiResponse } from '@/types/database';
import { useState } from 'react';

type ProcedureParams =
  | { cliente_id: string; items: string; descuento: string }
  | { prenda_id: string; cantidad: string; motivo: string }
  | {
      fecha_inicio: string;
      fecha_fin: string;
      mes: string;
      año: string;
      porcentaje: string;
    };

interface ExecutionHistory {
  id: number;
  procedure: string;
  params: ProcedureParams;
  result: string;
  timestamp: Date;
}

export default function ProcesosPage() {
  const { addToast } = useToast();
  const [history, setHistory] = useState<ExecutionHistory[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Form 1: Procesar Pedido
  const [pedidoForm, setPedidoForm] = useState({
    cliente_id: '',
    items: '[{"prenda_id": 1, "cantidad": 1}]',
    descuento: '0',
  });

  // Form 2: Reabastecer Inventario
  const [inventarioForm, setInventarioForm] = useState({
    prenda_id: '',
    cantidad: '',
    motivo: 'Reabastecimiento manual',
  });

  // Form 3: Calcular Comisión
  const [comisionForm, setComisionForm] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    mes: '',
    año: '',
    porcentaje: '5.0',
  });

  const addToHistory = (procedure: string, params: ProcedureParams, result: string) => {
    setHistory((prev) => [
      {
        id: Date.now(),
        procedure,
        params,
        result,
        timestamp: new Date(),
      },
      ...prev,
    ]);
  };

  const handleProcesarPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading({ ...loading, pedido: true });

    try {
      const items = JSON.parse(pedidoForm.items);
      const response = await fetch('/api/procedures/procesar-pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: Number.parseInt(pedidoForm.cliente_id),
          items,
          descuento: Number.parseFloat(pedidoForm.descuento),
        }),
      });

      const data: ApiResponse<{ pedido_id: number }> = await response.json();

      if (data.success) {
        addToHistory(
          'procesar_pedido',
          pedidoForm,
          `Éxito: Pedido #${data.data?.pedido_id} procesado`
        );
        addToast({
          title: 'Pedido procesado',
          description: `Pedido #${data.data?.pedido_id} procesado exitosamente`,
          variant: 'success',
        });
        setPedidoForm({
          cliente_id: '',
          items: '[{"prenda_id": 1, "cantidad": 1}]',
          descuento: '0',
        });
      } else {
        addToHistory('procesar_pedido', pedidoForm, `Error: ${data.error}`);
        addToast({
          title: 'Error al procesar pedido',
          description: data.error || 'Ocurrió un error desconocido',
          variant: 'error',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addToHistory('procesar_pedido', pedidoForm, `Error: ${errorMessage}`);
      addToast({
        title: 'Error al procesar pedido',
        description: errorMessage,
        variant: 'error',
      });
    } finally {
      setLoading({ ...loading, pedido: false });
    }
  };

  const handleReabastecerInventario = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading({ ...loading, inventario: true });

    try {
      const response = await fetch('/api/procedures/reabastecer-inventario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prenda_id: Number.parseInt(inventarioForm.prenda_id),
          cantidad: Number.parseInt(inventarioForm.cantidad),
          motivo: inventarioForm.motivo,
        }),
      });

      const data: ApiResponse<{
        success: boolean;
        prenda_id: number;
        cantidad: number;
      }> = await response.json();

      if (data.success) {
        addToHistory('reabastecer_inventario', inventarioForm, 'Éxito: Inventario reabastecido');
        addToast({
          title: 'Inventario reabastecido',
          description: 'El inventario se ha actualizado exitosamente',
          variant: 'success',
        });
        setInventarioForm({
          prenda_id: '',
          cantidad: '',
          motivo: 'Reabastecimiento manual',
        });
      } else {
        addToHistory('reabastecer_inventario', inventarioForm, `Error: ${data.error}`);
        addToast({
          title: 'Error al reabastecer inventario',
          description: data.error || 'Ocurrió un error desconocido',
          variant: 'error',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addToHistory('reabastecer_inventario', inventarioForm, `Error: ${errorMessage}`);
      addToast({
        title: 'Error al reabastecer inventario',
        description: errorMessage,
        variant: 'error',
      });
    } finally {
      setLoading({ ...loading, inventario: false });
    }
  };

  const handleCalcularComision = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading({ ...loading, comision: true });

    try {
      type ComisionRequestBody = {
        porcentaje: number;
        fecha_inicio?: string;
        fecha_fin?: string;
        mes?: number;
        año?: number;
      };
      const body: ComisionRequestBody = {
        porcentaje: Number.parseFloat(comisionForm.porcentaje),
      };

      if (comisionForm.fecha_inicio && comisionForm.fecha_fin) {
        body.fecha_inicio = comisionForm.fecha_inicio;
        body.fecha_fin = comisionForm.fecha_fin;
      } else if (comisionForm.mes && comisionForm.año) {
        body.mes = Number.parseInt(comisionForm.mes);
        body.año = Number.parseInt(comisionForm.año);
      } else {
        throw new Error('Debe proporcionar fecha_inicio/fecha_fin o mes/año');
      }

      const response = await fetch('/api/procedures/calcular-comision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      type ComisionResponseData = {
        comision: string;
        total_ventas: string;
        pedidos: number;
        detalle: Array<{
          fecha: string;
          total_ventas: string;
          comision: string;
          pedidos: number;
        }>;
      };
      const data: ApiResponse<ComisionResponseData> = await response.json();

      if (data.success) {
        addToHistory(
          'calcular_comision_vendedor',
          comisionForm,
          `Éxito: Comisión S/. ${data.data?.comision}, Ventas S/. ${data.data?.total_ventas}`
        );
        addToast({
          title: 'Comisión calculada',
          description: `Comisión: S/. ${data.data?.comision}, Ventas: S/. ${data.data?.total_ventas}`,
          variant: 'success',
        });
        setComisionForm({
          fecha_inicio: '',
          fecha_fin: '',
          mes: '',
          año: '',
          porcentaje: '5.0',
        });
      } else {
        addToHistory('calcular_comision_vendedor', comisionForm, `Error: ${data.error}`);
        addToast({
          title: 'Error al calcular comisión',
          description: data.error || 'Ocurrió un error desconocido',
          variant: 'error',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addToHistory('calcular_comision_vendedor', comisionForm, `Error: ${errorMessage}`);
      addToast({
        title: 'Error al calcular comisión',
        description: errorMessage,
        variant: 'error',
      });
    } finally {
      setLoading({ ...loading, comision: false });
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Procesos</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Ejecutar procedimientos almacenados de la base de datos
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Form 1: Procesar Pedido */}
        <Card>
          <CardHeader>
            <CardTitle>Procesar Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProcesarPedido} className="space-y-4">
              <div>
                <label htmlFor="pedido-cliente-id" className="block text-sm font-medium mb-1">
                  Cliente ID
                </label>
                <input
                  id="pedido-cliente-id"
                  type="number"
                  required
                  value={pedidoForm.cliente_id}
                  onChange={(e) => setPedidoForm({ ...pedidoForm, cliente_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="1"
                />
              </div>
              <div>
                <label htmlFor="pedido-items" className="block text-sm font-medium mb-1">
                  Items (JSON)
                </label>
                <textarea
                  id="pedido-items"
                  required
                  value={pedidoForm.items}
                  onChange={(e) => setPedidoForm({ ...pedidoForm, items: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md font-mono text-xs"
                  rows={3}
                  placeholder='[{"prenda_id": 1, "cantidad": 2}]'
                />
              </div>
              <div>
                <label htmlFor="pedido-descuento" className="block text-sm font-medium mb-1">
                  Descuento
                </label>
                <input
                  id="pedido-descuento"
                  type="number"
                  step="0.01"
                  value={pedidoForm.descuento}
                  onChange={(e) => setPedidoForm({ ...pedidoForm, descuento: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="0"
                />
              </div>
              <Button type="submit" disabled={loading.pedido} className="w-full">
                {loading.pedido ? 'Procesando...' : 'Procesar Pedido'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Form 2: Reabastecer Inventario */}
        <Card>
          <CardHeader>
            <CardTitle>Reabastecer Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReabastecerInventario} className="space-y-4">
              <div>
                <label htmlFor="inventario-prenda-id" className="block text-sm font-medium mb-1">
                  Prenda ID
                </label>
                <input
                  id="inventario-prenda-id"
                  type="number"
                  required
                  value={inventarioForm.prenda_id}
                  onChange={(e) =>
                    setInventarioForm({
                      ...inventarioForm,
                      prenda_id: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="1"
                />
              </div>
              <div>
                <label htmlFor="inventario-cantidad" className="block text-sm font-medium mb-1">
                  Cantidad
                </label>
                <input
                  id="inventario-cantidad"
                  type="number"
                  required
                  min="1"
                  value={inventarioForm.cantidad}
                  onChange={(e) =>
                    setInventarioForm({
                      ...inventarioForm,
                      cantidad: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="10"
                />
              </div>
              <div>
                <label htmlFor="inventario-motivo" className="block text-sm font-medium mb-1">
                  Motivo
                </label>
                <input
                  id="inventario-motivo"
                  type="text"
                  value={inventarioForm.motivo}
                  onChange={(e) =>
                    setInventarioForm({
                      ...inventarioForm,
                      motivo: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Reabastecimiento manual"
                />
              </div>
              <Button type="submit" disabled={loading.inventario} className="w-full">
                {loading.inventario ? 'Reabasteciendo...' : 'Reabastecer Inventario'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Form 3: Calcular Comisión */}
        <Card>
          <CardHeader>
            <CardTitle>Calcular Comisión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCalcularComision} className="space-y-4">
              <div>
                <label htmlFor="comision-fecha-inicio" className="block text-sm font-medium mb-1">
                  Fecha Inicio
                </label>
                <input
                  id="comision-fecha-inicio"
                  type="date"
                  value={comisionForm.fecha_inicio}
                  onChange={(e) =>
                    setComisionForm({
                      ...comisionForm,
                      fecha_inicio: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label htmlFor="comision-fecha-fin" className="block text-sm font-medium mb-1">
                  Fecha Fin
                </label>
                <input
                  id="comision-fecha-fin"
                  type="date"
                  value={comisionForm.fecha_fin}
                  onChange={(e) =>
                    setComisionForm({
                      ...comisionForm,
                      fecha_fin: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="text-xs text-muted-foreground text-center">O usar mes/año:</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="comision-mes" className="block text-sm font-medium mb-1">
                    Mes
                  </label>
                  <input
                    id="comision-mes"
                    type="number"
                    min="1"
                    max="12"
                    value={comisionForm.mes}
                    onChange={(e) =>
                      setComisionForm({
                        ...comisionForm,
                        mes: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="11"
                  />
                </div>
                <div>
                  <label htmlFor="comision-año" className="block text-sm font-medium mb-1">
                    Año
                  </label>
                  <input
                    id="comision-año"
                    type="number"
                    value={comisionForm.año}
                    onChange={(e) =>
                      setComisionForm({
                        ...comisionForm,
                        año: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="2025"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="comision-porcentaje" className="block text-sm font-medium mb-1">
                  Porcentaje (%)
                </label>
                <input
                  id="comision-porcentaje"
                  type="number"
                  step="0.1"
                  value={comisionForm.porcentaje}
                  onChange={(e) =>
                    setComisionForm({
                      ...comisionForm,
                      porcentaje: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="5.0"
                />
              </div>
              <Button type="submit" disabled={loading.comision} className="w-full">
                {loading.comision ? 'Calculando...' : 'Calcular Comisión'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Execution History */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Ejecuciones</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <EmptyState
              title="No hay historial"
              description="El historial de ejecuciones aparecerá aquí después de ejecutar procedimientos."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Procedimiento</th>
                    <th className="text-left p-2 hidden md:table-cell">Parámetros</th>
                    <th className="text-left p-2">Resultado</th>
                    <th className="text-left p-2">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 10).map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-mono text-xs">{item.procedure}</td>
                      <td className="p-2 font-mono text-xs hidden md:table-cell">
                        {JSON.stringify(item.params)}
                      </td>
                      <td className="p-2">
                        <span
                          className={
                            item.result.startsWith('Éxito') ? 'text-green-600' : 'text-red-600'
                          }
                        >
                          {item.result}
                        </span>
                      </td>
                      <td className="p-2 text-xs text-muted-foreground">
                        {item.timestamp.toLocaleTimeString('es-PE')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
