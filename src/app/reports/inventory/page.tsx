// Inventario - Server Component con datos reales de BD
// REGLA: Datos de lib/data.ts, CERO hardcode

import ReportTable from '@/components/ui/ReportTable';
import { getInventoryRisk } from '@/lib/data';
import type { InventoryRisk } from '@/lib/definitions';

// Columnas con render especial para stock status
const columns = [
    {
        key: 'product_name' as keyof InventoryRisk,
        header: 'Producto'
    },
    {
        key: 'category_name' as keyof InventoryRisk,
        header: 'Categoría'
    },
    {
        key: 'current_stock' as keyof InventoryRisk,
        header: 'Stock Actual'
    },
    {
        key: 'stock_status' as keyof InventoryRisk,
        header: 'Estado',
        // Si es Crítico o Sin Stock, texto en rojo
        render: (value: unknown) => {
            const status = String(value);
            const isRisk = status === 'Crítico' || status === 'Sin Stock';
            return (
                <span className={isRisk ? 'text-red-600 font-semibold' : 'text-[#3E2723]'}>
                    {status}
                </span>
            );
        }
    },
    {
        key: 'total_sold_last_30_days' as keyof InventoryRisk,
        header: 'Vendidos (30 días)'
    },
    {
        key: 'active' as keyof InventoryRisk,
        header: 'Activo',
        render: (value: unknown) => value ? 'Sí' : 'No'
    },
];

export default async function InventoryReportPage() {
    // Obtener datos REALES de BD
    let data: InventoryRisk[];
    try {
        data = await getInventoryRisk();
    } catch (error) {
        console.error('Error conectando a BD:', error);
        data = [];
    }

    // Contar productos en riesgo
    const riskCount = data.filter(p =>
        p.stock_status === 'Crítico' || p.stock_status === 'Sin Stock'
    ).length;

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#3E2723]">Riesgo de Inventario</h1>
                <p className="text-[#8D6E63] mt-1">Productos con stock bajo o agotado</p>
            </div>

            {/* Resumen de riesgo */}
            <div className="bg-white border border-[#E5DCC5] p-6 mb-6">
                <div className="flex items-center gap-4">
                    <div>
                        <p className="text-sm text-[#8D6E63]">Productos en Riesgo</p>
                        <p className={`text-3xl font-bold ${riskCount > 0 ? 'text-red-600' : 'text-[#3E2723]'}`}>
                            {riskCount}
                        </p>
                    </div>
                    <div className="border-l border-[#E5DCC5] pl-4">
                        <p className="text-sm text-[#8D6E63]">Total Productos</p>
                        <p className="text-3xl font-bold text-[#3E2723]">{data.length}</p>
                    </div>
                </div>
            </div>

            {/* Tabla de inventario - datos de BD */}
            <ReportTable
                columns={columns}
                data={data as unknown as Record<string, unknown>[]}
                emptyMessage="No hay datos de inventario disponibles"
            />
        </div>
    );
}
