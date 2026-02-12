'use client';

import { useState, useEffect } from 'react';
import ReportTable from '@/components/ui/ReportTable';
import type { PaymentMix } from '@/lib/definitions';

const columns = [
    {
        key: 'method' as keyof PaymentMix,
        header: 'Metodo de Pago'
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

export default function PaymentsReportPage() {
    const [data, setData] = useState<PaymentMix[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/reports/payments');
                if (!response.ok) {
                    throw new Error('Error al obtener datos');
                }
                const result = await response.json();
                setData(result);
                setError(null);
            } catch (err) {
                console.error('Error:', err);
                setError('No se pudieron cargar los datos de pagos.');
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalAmount = data.reduce((sum, item) => sum + Number(item.total_amount || 0), 0);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#3E2723]">Metodos de Pago</h1>
                <p className="text-[#8D6E63] mt-1">Distribucion de pagos por metodo</p>
            </div>

            {error && (
                <div className="bg-[#FAF7F2] border border-[#E5DCC5] text-[#3E2723] px-4 py-3 mb-6">
                    {error}
                </div>
            )}

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
                        <p className="text-sm text-[#8D6E63]">Metodos Utilizados</p>
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
                    emptyMessage="No hay datos de pagos disponibles"
                />
            )}

            {loading && (
                <div className="p-8 text-center text-[#8D6E63]">Cargando...</div>
            )}
        </div>
    );
}
