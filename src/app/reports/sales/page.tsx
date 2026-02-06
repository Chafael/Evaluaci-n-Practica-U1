'use client';

import { useState } from 'react';
import ReportTable from '@/components/ui/ReportTable';
import type { SalesDaily } from '@/lib/definitions';

// Columnas de la tabla - formateo personalizado
const columns = [
    {
        key: 'sale_date' as keyof SalesDaily,
        header: 'Fecha',
        render: (value: unknown) => {
            const date = new Date(value as string);
            return date.toLocaleDateString('es-MX', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        }
    },
    {
        key: 'channel' as keyof SalesDaily,
        header: 'Canal'
    },
    {
        key: 'total_orders' as keyof SalesDaily,
        header: 'Órdenes'
    },
    {
        key: 'unique_customers' as keyof SalesDaily,
        header: 'Clientes'
    },
    {
        key: 'total_items_sold' as keyof SalesDaily,
        header: 'Items'
    },
    {
        key: 'total_revenue' as keyof SalesDaily,
        header: 'Ingresos',
        render: (value: unknown) => {
            return new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN'
            }).format(Number(value));
        }
    },
];

export default function SalesReportPage() {
    // Estado para filtros de fecha
    const [fromDate, setFromDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    });
    const [toDate, setToDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    // Estado para datos y loading
    const [data, setData] = useState<SalesDaily[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    // Función para buscar datos - llama a API que usa lib/data.ts
    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const response = await fetch(`/api/reports/sales?from=${fromDate}&to=${toDate}`);
            if (!response.ok) {
                throw new Error('Error al obtener datos');
            }
            const result = await response.json();
            setData(result);
        } catch (err) {
            console.error('Error:', err);
            setError('No se pudieron cargar los datos. Verifica que la base de datos esté conectada.');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Header - Colores café */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#3E2723]">Ventas Diarias</h1>
                <p className="text-[#8D6E63] mt-1">Reporte de ventas filtrado por fecha</p>
            </div>

            {/* Filtros - Tema café */}
            <div className="bg-white border border-[#E5DCC5] p-6 mb-6">
                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label htmlFor="from" className="block text-sm font-medium text-[#3E2723] mb-1">
                            Desde
                        </label>
                        <input
                            type="date"
                            id="from"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="px-4 py-2 border border-[#E5DCC5] bg-white text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label htmlFor="to" className="block text-sm font-medium text-[#3E2723] mb-1">
                            Hasta
                        </label>
                        <input
                            type="date"
                            id="to"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="px-4 py-2 border border-[#E5DCC5] bg-white text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="px-6 py-2 bg-[#2C1810] text-white hover:bg-[#4E342E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Buscando...' : 'Buscar'}
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-[#FAF7F2] border border-[#E5DCC5] text-[#3E2723] px-4 py-3 mb-6">
                    {error}
                </div>
            )}

            {/* Tabla de resultados - datos de BD */}
            {hasSearched && !loading && (
                <ReportTable
                    columns={columns}
                    data={data as unknown as Record<string, unknown>[]}
                    emptyMessage="No hay ventas en el rango de fechas seleccionado"
                />
            )}

            {/* Estado inicial */}
            {!hasSearched && !loading && (
                <div className="bg-white border border-[#E5DCC5] p-8 text-center">
                    <p className="text-[#8D6E63]">
                        Selecciona un rango de fechas y presiona &quot;Buscar&quot; para ver el reporte
                    </p>
                </div>
            )}
        </div>
    );
}
