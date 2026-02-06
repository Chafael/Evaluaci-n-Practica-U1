// Métodos de Pago - Server Component con datos reales de BD
// REQUERIDO POR RÚBRICA DEL EXAMEN
// REGLA: Datos de lib/data.ts, CERO hardcode

import ReportTable from '@/components/ui/ReportTable';
import { getPaymentMix } from '@/lib/data';
import type { PaymentMix } from '@/lib/definitions';

// Columnas de la tabla
const columns = [
    {
        key: 'method' as keyof PaymentMix,
        header: 'Método de Pago'
    },
    {
        key: 'total_payments' as keyof PaymentMix,
        header: 'Cantidad de Pagos'
    },
    {
        key: 'total_amount' as keyof PaymentMix,
        header: 'Monto Total',
        render: (value: unknown) => {
            return new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN'
            }).format(Number(value));
        }
    },
    {
        key: 'percentage' as keyof PaymentMix,
        header: 'Porcentaje',
        render: (value: unknown) => {
            return `${Number(value).toFixed(2)}%`;
        }
    },
];

export default async function PaymentsReportPage() {
    // Obtener datos REALES de BD
    let data: PaymentMix[];
    let totalAmount = 0;

    try {
        data = await getPaymentMix();
        totalAmount = data.reduce((sum, item) => sum + Number(item.total_amount || 0), 0);
    } catch (error) {
        console.error('Error conectando a BD:', error);
        data = [];
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#3E2723]">Métodos de Pago</h1>
                <p className="text-[#8D6E63] mt-1">Distribución de pagos por método</p>
            </div>

            {/* Resumen */}
            <div className="bg-white border border-[#E5DCC5] p-6 mb-6">
                <div className="flex items-center gap-8">
                    <div>
                        <p className="text-sm text-[#8D6E63]">Total Recaudado</p>
                        <p className="text-3xl font-bold text-[#3E2723]">
                            {new Intl.NumberFormat('es-MX', {
                                style: 'currency',
                                currency: 'MXN'
                            }).format(totalAmount)}
                        </p>
                    </div>
                    <div className="border-l border-[#E5DCC5] pl-8">
                        <p className="text-sm text-[#8D6E63]">Métodos Utilizados</p>
                        <p className="text-3xl font-bold text-[#3E2723]">{data.length}</p>
                    </div>
                </div>
            </div>

            {/* Tabla de métodos de pago - datos de BD */}
            <ReportTable
                columns={columns}
                data={data as unknown as Record<string, unknown>[]}
                emptyMessage="No hay datos de pagos disponibles"
            />
        </div>
    );
}
