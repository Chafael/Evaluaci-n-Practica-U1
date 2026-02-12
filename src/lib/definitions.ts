export interface SalesDaily {
    sale_date: Date;
    total_orders: number;
    unique_customers: number;
    total_revenue: number;
    total_items_sold: number;
    channel: string;
}

export interface TopProduct {
    product_id: number;
    product_name: string;
    category_name: string;
    unit_price: number;
    total_sold: number;
    total_revenue: number;
    order_count: number;
}

export interface InventoryRisk {
    product_id: number;
    product_name: string;
    category_name: string;
    current_stock: number;
    active: boolean;
    stock_status: 'Sin Stock' | 'Crítico' | 'Bajo' | 'Normal';
    total_sold_last_30_days: number;
}

export interface CustomerValue {
    customer_id: number;
    customer_name: string;
    email: string;
    total_orders: number;
    total_spent: number;
    avg_order_value: number;
    first_order: Date | null;
    last_order: Date | null;
}

export interface SalesChannel {
    channel: string;
    total_orders: number;
    unique_customers: number;
    total_revenue: number;
    avg_order_value: number;
    total_items: number;
}

export interface PaymentMix {
    method: string;
    total_payments: number;
    total_amount: number;
    percentage: number;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface DateRangeFilter {
    from: Date;
    to: Date;
}

export interface PaginationParams {
    page: number;
    limit: number;
}
