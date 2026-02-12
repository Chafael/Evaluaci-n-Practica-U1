'use client';

import { useState, useEffect } from 'react';
import ReportTable from '@/components/ui/ReportTable';
import type { TopProduct } from '@/lib/definitions';

const columns = [
    {
        key: 'product_name' as keyof TopProduct,
        header: 'Producto'
    },
    {
        key: 'category_name' as keyof TopProduct,
        header: 'Categoria'
    },
    {
        key: 'unit_price' as keyof TopProduct,
        header: 'Precio',
        render: (value: unknown) => {
            return new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN'
            }).format(Number(value));
        }
    },
    {
        key: 'total_sold' as keyof TopProduct,
        header: 'Vendidos'
    },
    {
        key: 'total_revenue' as keyof TopProduct,
        header: 'Ingresos',
        render: (value: unknown) => {
            return new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN'
            }).format(Number(value));
        }
    },
    {
        key: 'order_count' as keyof TopProduct,
        header: 'Ordenes'
    },
];

export default function ProductsReportPage() {
    const [data, setData] = useState<TopProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearch, setActiveSearch] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const queryParams = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString(),
                    q: activeSearch
                });

                const response = await fetch(`/api/reports/products?${queryParams}`);

                if (!response.ok) {
                    throw new Error('Error al obtener datos');
                }

                const result = await response.json();
                setData(result.data);
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
    }, [page, limit, activeSearch]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setActiveSearch(searchTerm);
        setPage(1);
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#3E2723]">Top Productos</h1>
                <p className="text-[#8D6E63] mt-1">Productos mas vendidos</p>
            </div>

            <div className="bg-white border border-[#E5DCC5] p-6 mb-6">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar producto..."
                        className="flex-1 px-4 py-2 border border-[#E5DCC5] bg-white text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]"
                    />
                    <button
                        type="submit"
                        className="px-6 py-2 bg-[#2C1810] text-white hover:bg-[#4E342E] transition-colors"
                        disabled={loading}
                    >
                        {loading ? '...' : 'Buscar'}
                    </button>
                </form>
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
                    emptyMessage="No hay productos disponibles"
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
