// Top Productos - Server Component con datos reales de BD
// REGLA: Datos de lib/data.ts, CERO hardcode

import ReportTable from '@/components/ui/ReportTable';
import { getTopProducts } from '@/lib/data';
import type { TopProduct } from '@/lib/definitions';

// Columnas de la tabla
const columns = [
    {
        key: 'product_name' as keyof TopProduct,
        header: 'Producto'
    },
    {
        key: 'category_name' as keyof TopProduct,
        header: 'Categoría'
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
        header: 'Órdenes'
    },
];

interface PageProps {
    searchParams: Promise<{ page?: string; limit?: string; q?: string }>;
}

export default async function ProductsReportPage({ searchParams }: PageProps) {
    // Obtener parámetros de búsqueda
    const params = await searchParams;
    const page = parseInt(params.page || '1', 10);
    const limit = parseInt(params.limit || '10', 10);
    const searchQuery = params.q || '';

    // Obtener datos REALES de BD
    let result;
    try {
        result = await getTopProducts(page, limit, searchQuery);
    } catch (error) {
        console.error('Error conectando a BD:', error);
        result = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#3E2723]">Top Productos</h1>
                <p className="text-[#8D6E63] mt-1">Productos más vendidos</p>
            </div>

            {/* Búsqueda */}
            <div className="bg-white border border-[#E5DCC5] p-6 mb-6">
                <form method="GET" className="flex gap-4">
                    <input
                        type="text"
                        name="q"
                        defaultValue={searchQuery}
                        placeholder="Buscar producto..."
                        className="flex-1 px-4 py-2 border border-[#E5DCC5] bg-white text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]"
                    />
                    <button
                        type="submit"
                        className="px-6 py-2 bg-[#2C1810] text-white hover:bg-[#4E342E] transition-colors"
                    >
                        Buscar
                    </button>
                </form>
            </div>

            {/* Tabla de productos - datos de BD */}
            <ReportTable
                columns={columns}
                data={result.data as unknown as Record<string, unknown>[]}
                emptyMessage="No hay productos disponibles"
            />

            {/* Paginación */}
            {result.totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                    {page > 1 && (
                        <a
                            href={`/reports/products?page=${page - 1}&limit=${limit}&q=${searchQuery}`}
                            className="px-4 py-2 border border-[#E5DCC5] text-[#3E2723] hover:bg-[#FAF7F2]"
                        >
                            Anterior
                        </a>
                    )}
                    <span className="px-4 py-2 text-[#8D6E63]">
                        Página {result.page} de {result.totalPages}
                    </span>
                    {page < result.totalPages && (
                        <a
                            href={`/reports/products?page=${page + 1}&limit=${limit}&q=${searchQuery}`}
                            className="px-4 py-2 border border-[#E5DCC5] text-[#3E2723] hover:bg-[#FAF7F2]"
                        >
                            Siguiente
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}
