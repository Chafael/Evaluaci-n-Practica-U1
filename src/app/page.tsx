'use client';

import { useState, useEffect } from 'react';
import KPICard from "@/components/ui/KPICard";
import type { SalesDaily, TopProduct, InventoryRisk, SalesChannel } from '@/lib/definitions';

export default function Dashboard() {
    const [loading, setLoading] = useState(true);

    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [topProductName, setTopProductName] = useState('Cargando...');
    const [lowStockCount, setLowStockCount] = useState(0);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [channels, setChannels] = useState<SalesChannel[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const today = new Date();
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(today.getDate() - 30);

                const from = thirtyDaysAgo.toISOString().split('T')[0];
                const to = today.toISOString().split('T')[0];

                const [salesRes, productsRes, inventoryRes, customersRes, channelsRes] = await Promise.all([
                    fetch(`/api/reports/sales?from=${from}&to=${to}`),
                    fetch('/api/reports/products?limit=1'),
                    fetch('/api/reports/inventory'),
                    fetch('/api/reports/customers?limit=1'),
                    fetch('/api/reports/sales-channel')
                ]);

                if (salesRes.ok) {
                    const salesData: SalesDaily[] = await salesRes.json();
                    const revenue = salesData.reduce((sum, day) => sum + Number(day.total_revenue || 0), 0);
                    const orders = salesData.reduce((sum, day) => sum + Number(day.total_orders || 0), 0);
                    setTotalRevenue(revenue);
                    setTotalOrders(orders);
                }

                if (productsRes.ok) {
                    const productsData = await productsRes.json();
                    const topProduct = productsData.data[0] as TopProduct | undefined;
                    setTopProductName(topProduct ? topProduct.product_name : 'Sin datos');
                }

                if (inventoryRes.ok) {
                    const inventoryData: InventoryRisk[] = await inventoryRes.json();
                    const riskCount = inventoryData.filter(p =>
                        p.stock_status === 'Critico' || p.stock_status === 'Sin Stock'
                    ).length;
                    setLowStockCount(riskCount);
                }

                if (customersRes.ok) {
                    const customersData = await customersRes.json();
                    setTotalCustomers(customersData.total);
                }

                if (channelsRes.ok) {
                    const channelsData: SalesChannel[] = await channelsRes.json();
                    setChannels(channelsData);
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setTopProductName('Error de carga');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(value);
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#3E2723]">Dashboard</h1>
                <p className="text-[#8D6E63] mt-1">Resumen de los ultimos 30 dias</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <KPICard
                    title="Ventas Totales"
                    value={loading ? '...' : formatCurrency(totalRevenue)}
                    label="Ultimos 30 dias"
                />
                <KPICard
                    title="Ordenes"
                    value={loading ? '...' : totalOrders}
                    label="Pedidos completados"
                />
                <KPICard
                    title="Producto Top"
                    value={loading ? '...' : topProductName}
                    label="Mas vendido"
                />
                <KPICard
                    title="Stock Bajo"
                    value={loading ? '...' : lowStockCount}
                    label="Productos en riesgo"
                />
                <KPICard
                    title="Clientes"
                    value={loading ? '...' : totalCustomers}
                    label="Total registrados"
                />
            </div>

            <div className="bg-white border border-[#E5DCC5] p-6">
                <h2 className="text-lg font-semibold text-[#3E2723] mb-4">Ventas por Canal</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {!loading && channels.length > 0 ? channels.map((channel) => (
                        <div key={channel.channel} className="p-4 bg-[#FAF7F2] border border-[#E5DCC5]">
                            <p className="text-sm text-[#8D6E63]">{channel.channel}</p>
                            <p className="text-xl font-bold text-[#3E2723]">
                                {formatCurrency(Number(channel.total_revenue || 0))}
                            </p>
                            <p className="text-xs text-[#8D6E63]">{channel.total_orders} ordenes</p>
                        </div>
                    )) : (
                        <p className="text-[#8D6E63] col-span-3">
                            {loading ? 'Cargando datos...' : 'Sin datos disponibles. Verifica la conexion a la BD.'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}