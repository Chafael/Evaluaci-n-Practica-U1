// Clientes - Server Component con datos reales de BD
// REGLA: Datos de lib/data.ts, CERO hardcode

import ReportTable from '@/components/ui/ReportTable';
import { getCustomerValue } from '@/lib/data';
import type { CustomerValue } from '@/lib/definitions';

// Columnas de la tabla
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
        header: 'Órdenes'
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
        header: 'Última Compra',
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

interface PageProps {
    searchParams: Promise<{ page?: string; limit?: string }>;
}

export default async function CustomersReportPage({ searchParams }: PageProps) {
    // Obtener parámetros de paginación
    const params = await searchParams;
    const page = parseInt(params.page || '1', 10);
    const limit = parseInt(params.limit || '10', 10);

    // Obtener datos REALES de BD
    let result;
    try {
        result = await getCustomerValue(page, limit);
    } catch (error) {
        console.error('Error conectando a BD:', error);
        result = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#3E2723]">Valor de Clientes</h1>
                <p className="text-[#8D6E63] mt-1">Clientes ordenados por valor total</p>
            </div>

            {/* Resumen */}
            <div className="bg-white border border-[#E5DCC5] p-6 mb-6">
                <p className="text-sm text-[#8D6E63]">Total de Clientes</p>
                <p className="text-3xl font-bold text-[#3E2723]">{result.total}</p>
            </div>

            {/* Tabla de clientes - datos de BD */}
            <ReportTable
                columns={columns}
                data={result.data as unknown as Record<string, unknown>[]}
                emptyMessage="No hay clientes registrados"
            />

            {/* Paginación */}
            {result.totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                    {page > 1 && (
                        <a
                            href={`/reports/customers?page=${page - 1}&limit=${limit}`}
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
                            href={`/reports/customers?page=${page + 1}&limit=${limit}`}
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
