// Dashboard - Server Component con datos reales de BD
// Coffee Theme aplicado - REGLA: Todos los datos de lib/data.ts

import KPICard from "@/components/ui/KPICard";
import {
    getSalesDaily,
    getTopProducts,
    getInventoryRisk,
    getCustomerValue,
    getSalesChannel
} from "@/lib/data";

export default async function Dashboard() {
    // Rango de fechas: últimos 30 días
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Obtener datos REALES de la BD vía lib/data.ts
    let salesData, topProducts, inventoryRisk, customers, channels;

    try {
        [salesData, topProducts, inventoryRisk, customers, channels] = await Promise.all([
            getSalesDaily(thirtyDaysAgo, today),
            getTopProducts(1, 5),
            getInventoryRisk(),
            getCustomerValue(1, 10),
            getSalesChannel()
        ]);
    } catch (error) {
        console.error('Error conectando a la BD:', error);
        // Arrays vacíos si hay error - NO datos inventados
        salesData = [];
        topProducts = { data: [], total: 0, page: 1, limit: 5, totalPages: 0 };
        inventoryRisk = [];
        customers = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
        channels = [];
    }

    // Calcular KPIs desde datos reales
    const totalRevenue = salesData.reduce((sum, day) => sum + Number(day.total_revenue || 0), 0);
    const totalOrders = salesData.reduce((sum, day) => sum + Number(day.total_orders || 0), 0);
    const lowStockCount = inventoryRisk.filter(p =>
        p.stock_status === 'Crítico' || p.stock_status === 'Sin Stock'
    ).length;
    const topProductName = topProducts.data[0]?.product_name || 'Sin datos';
    const totalCustomers = customers.total;

    // Formatear moneda
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(value);
    };

    return (
        <div>
            {/* Header - Textos con colores café */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#3E2723]">Dashboard</h1>
                <p className="text-[#8D6E63] mt-1">Resumen de los últimos 30 días</p>
            </div>

            {/* KPI Cards - Datos reales de BD */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <KPICard
                    title="Ventas Totales"
                    value={formatCurrency(totalRevenue)}
                    label="Últimos 30 días"
                />
                <KPICard
                    title="Órdenes"
                    value={totalOrders}
                    label="Pedidos completados"
                />
                <KPICard
                    title="Producto Top"
                    value={topProductName}
                    label="Más vendido"
                />
                <KPICard
                    title="Stock Bajo"
                    value={lowStockCount}
                    label="Productos en riesgo"
                />
                <KPICard
                    title="Clientes"
                    value={totalCustomers}
                    label="Total registrados"
                />
            </div>

            {/* Ventas por Canal - Datos reales, tema café */}
            <div className="bg-white border border-[#E5DCC5] p-6">
                <h2 className="text-lg font-semibold text-[#3E2723] mb-4">Ventas por Canal</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {channels.length > 0 ? channels.map((channel) => (
                        <div key={channel.channel} className="p-4 bg-[#FAF7F2] border border-[#E5DCC5]">
                            <p className="text-sm text-[#8D6E63]">{channel.channel}</p>
                            <p className="text-xl font-bold text-[#3E2723]">
                                {formatCurrency(Number(channel.total_revenue || 0))}
                            </p>
                            <p className="text-xs text-[#8D6E63]">{channel.total_orders} órdenes</p>
                        </div>
                    )) : (
                        <p className="text-[#8D6E63] col-span-3">
                            Sin datos disponibles. Verifica la conexión a la BD.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}