'use client';

import { useState, useEffect } from 'react';
import ReportTable from '@/components/ui/ReportTable';
import type { InventoryRisk } from '@/lib/definitions';

const columns = [
    {
        key: 'product_name' as keyof InventoryRisk,
        header: 'Producto'
    },
    {
        key: 'category_name' as keyof InventoryRisk,
        header: 'Categoria'
    },
    {
        key: 'current_stock' as keyof InventoryRisk,
        header: 'Stock Actual'
    },
    {
        key: 'stock_status' as keyof InventoryRisk,
        header: 'Estado',
        render: (value: unknown) => {
            const status = String(value);
            const isRisk = status === 'Critico' || status === 'Sin Stock';
            return (
                <span className={isRisk ? 'text-red-600 font-semibold' : 'text-[#3E2723]'}>
                    {status}
                </span>
            );
        }
    },
    {
        key: 'total_sold_last_30_days' as keyof InventoryRisk,
        header: 'Vendidos (30 dias)'
    },
    {
        key: 'active' as keyof InventoryRisk,
        header: 'Activo',
        render: (value: unknown) => value ? 'Si' : 'No'
    },
];

export default function InventoryReportPage() {
    const [data, setData] = useState<InventoryRisk[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/reports/inventory');
                if (!response.ok) {
                    throw new Error('Error al obtener datos');
                }
                const result = await response.json();
                setData(result);
                setError(null);
            } catch (err) {
                console.error('Error:', err);
                setError('No se pudieron cargar los datos de inventario.');
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const riskCount = data.filter(p =>
        p.stock_status === 'Critico' || p.stock_status === 'Sin Stock'
    ).length;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#3E2723]">Riesgo de Inventario</h1>
                <p className="text-[#8D6E63] mt-1">Productos con stock bajo o agotado</p>
            </div>

            {error && (
                <div className="bg-[#FAF7F2] border border-[#E5DCC5] text-[#3E2723] px-4 py-3 mb-6">
                    {error}
                </div>
            )}

            <div className="bg-white border border-[#E5DCC5] p-6 mb-6">
                <div className="flex items-center gap-4">
                    <div>
                        <p className="text-sm text-[#8D6E63]">Productos en Riesgo</p>
                        <p className={`text-3xl font-bold ${riskCount > 0 ? 'text-red-600' : 'text-[#3E2723]'}`}>
                            {loading ? '...' : riskCount}
                        </p>
                    </div>
                    <div className="border-l border-[#E5DCC5] pl-4">
                        <p className="text-sm text-[#8D6E63]">Total Productos</p>
                        <p className="text-3xl font-bold text-[#3E2723]">
                            {loading ? '...' : data.length}
                        </p>
                    </div>
                </div>
            </div>

            {!loading && (
                <ReportTable
                    columns={columns}
                    data={data as unknown as Record<string, unknown>[]}
                    emptyMessage="No hay datos de inventario disponibles"
                />
            )}

            {loading && (
                <div className="p-8 text-center text-[#8D6E63]">Cargando...</div>
            )}
        </div>
    );
}
