'use client';

import { useState, useEffect } from 'react';
import ReportTable from '@/components/ui/ReportTable';
import type { CustomerValue } from '@/lib/definitions';

const columns = [
    {
        key: 'customer_name' as keyof CustomerValue,
        header: 'Cliente'
    },
    {
        key: 'email' as keyof CustomerValue,
        header: 'Email'
    },
    {
        key: 'total_orders' as keyof CustomerValue,
        header: 'Ordenes'
    },
    {
        key: 'total_spent' as keyof CustomerValue,
        header: 'Total Gastado',
        render: (value: unknown) => {
            return new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN'
            }).format(Number(value));
        }
    },
    {
        key: 'avg_order_value' as keyof CustomerValue,
        header: 'Promedio/Orden',
        render: (value: unknown) => {
            return new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN'
            }).format(Number(value));
        }
    },
    {
        key: 'last_order' as keyof CustomerValue,
        header: 'Ultima Compra',
        render: (value: unknown) => {
            if (!value) return 'Sin compras';
            const date = new Date(value as string);
            return date.toLocaleDateString('es-MX', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        }
    },
];

export default function CustomersReportPage() {
    const [data, setData] = useState<CustomerValue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/reports/customers?page=${page}&limit=${limit}`);

                if (!response.ok) {
                    throw new Error('Error al obtener datos');
                }

                const result = await response.json();
                setData(result.data);
                setTotal(result.total);
                setTotalPages(result.totalPages);
                setError(null);
            } catch (err) {
                console.error('Error:', err);
                setError('No se pudieron cargar los datos.');
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [page, limit]);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#3E2723]">Valor de Clientes</h1>
                <p className="text-[#8D6E63] mt-1">Clientes ordenados por valor total</p>
            </div>

            <div className="bg-white border border-[#E5DCC5] p-6 mb-6">
                <p className="text-sm text-[#8D6E63]">Total de Clientes</p>
                <p className="text-3xl font-bold text-[#3E2723]">
                    {loading ? '...' : total}
                </p>
            </div>

            {error && (
                <div className="bg-[#FAF7F2] border border-[#E5DCC5] text-[#3E2723] px-4 py-3 mb-6">
                    {error}
                </div>
            )}

            {!loading && (
                <ReportTable
                    columns={columns}
                    data={data as unknown as Record<string, unknown>[]}
                    emptyMessage="No hay clientes registrados"
                />
            )}

            {loading && (
                <div className="p-8 text-center text-[#8D6E63]">Cargando...</div>
            )}

            {!loading && totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-[#E5DCC5] text-[#3E2723] hover:bg-[#FAF7F2] disabled:opacity-50"
                    >
                        Anterior
                    </button>
                    <span className="px-4 py-2 text-[#8D6E63]">
                        Pagina {page} de {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 border border-[#E5DCC5] text-[#3E2723] hover:bg-[#FAF7F2] disabled:opacity-50"
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
}
