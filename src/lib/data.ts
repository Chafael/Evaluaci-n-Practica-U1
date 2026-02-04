import { z } from 'zod';
import { query } from './db';
import type {
    SalesDaily,
    TopProduct,
    InventoryRisk,
    CustomerValue,
    SalesChannel,
    PaymentMix,
    PaginatedResult
} from './definitions';

const dateRangeSchema = z.object({
    from: z.date(),
    to: z.date()
}).refine(data => data.from <= data.to, {
    message: "La fecha 'from' debe ser anterior o igual a 'to'"
});

const paginationSchema = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10)
});

const categoryFilterSchema = z.string().optional();
const searchQuerySchema = z.string().optional();

export async function getSalesDaily(from: Date, to: Date): Promise<SalesDaily[]> {
    try {
        const validated = dateRangeSchema.parse({ from, to });
        const sql = `
            SELECT sale_date, total_orders, unique_customers, total_revenue, total_items_sold, channel
            FROM vw_sales_daily
            WHERE sale_date >= $1 AND sale_date <= $2
            ORDER BY sale_date DESC
        `;
        return await query<SalesDaily>(sql, [validated.from, validated.to]);
    } catch (error) {
        console.error('Error fetching daily sales:', error);
        if (error instanceof z.ZodError) {
            throw new Error(`Validation error: ${error.issues.map((e: z.ZodIssue) => e.message).join(', ')}`);
        }
        throw new Error('Failed to fetch daily sales report');
    }
}

export async function getTopProducts(
    page: number = 1,
    limit: number = 10,
    searchQuery?: string
): Promise<PaginatedResult<TopProduct>> {
    try {
        const pagination = paginationSchema.parse({ page, limit });
        const search = searchQuerySchema.parse(searchQuery);
        const offset = (pagination.page - 1) * pagination.limit;

        let sql: string;
        let countSql: string;
        let params: unknown[];
        let countParams: unknown[];

        if (search && search.trim() !== '') {
            const searchPattern = `%${search}%`;
            sql = `
                SELECT product_id, product_name, category_name, unit_price, total_sold, total_revenue, order_count
                FROM vw_top_products
                WHERE product_name ILIKE $1 OR category_name ILIKE $1
                ORDER BY total_sold DESC NULLS LAST
                LIMIT $2 OFFSET $3
            `;
            countSql = `SELECT COUNT(*) as count FROM vw_top_products WHERE product_name ILIKE $1 OR category_name ILIKE $1`;
            params = [searchPattern, pagination.limit, offset];
            countParams = [searchPattern];
        } else {
            sql = `
                SELECT product_id, product_name, category_name, unit_price, total_sold, total_revenue, order_count
                FROM vw_top_products
                ORDER BY total_sold DESC NULLS LAST
                LIMIT $1 OFFSET $2
            `;
            countSql = `SELECT COUNT(*) as count FROM vw_top_products`;
            params = [pagination.limit, offset];
            countParams = [];
        }

        const [data, countResult] = await Promise.all([
            query<TopProduct>(sql, params),
            query<{ count: string }>(countSql, countParams)
        ]);

        const total = parseInt(countResult[0]?.count || '0', 10);

        return {
            data,
            total,
            page: pagination.page,
            limit: pagination.limit,
            totalPages: Math.ceil(total / pagination.limit)
        };
    } catch (error) {
        console.error('Error fetching top products:', error);
        if (error instanceof z.ZodError) {
            throw new Error(`Validation error: ${error.issues.map((e: z.ZodIssue) => e.message).join(', ')}`);
        }
        throw new Error('Failed to fetch top products');
    }
}

export async function getInventoryRisk(category?: string): Promise<InventoryRisk[]> {
    try {
        const validatedCategory = categoryFilterSchema.parse(category);
        let sql: string;
        let params: unknown[];

        if (validatedCategory && validatedCategory.trim() !== '') {
            sql = `
                SELECT product_id, product_name, category_name, current_stock, active, stock_status, total_sold_last_30_days
                FROM vw_inventory_risk
                WHERE category_name ILIKE $1
                ORDER BY current_stock ASC, total_sold_last_30_days DESC
            `;
            params = [`%${validatedCategory}%`];
        } else {
            sql = `
                SELECT product_id, product_name, category_name, current_stock, active, stock_status, total_sold_last_30_days
                FROM vw_inventory_risk
                ORDER BY current_stock ASC, total_sold_last_30_days DESC
            `;
            params = [];
        }

        return await query<InventoryRisk>(sql, params);
    } catch (error) {
        console.error('Error fetching inventory risk:', error);
        if (error instanceof z.ZodError) {
            throw new Error(`Validation error: ${error.issues.map((e: z.ZodIssue) => e.message).join(', ')}`);
        }
        throw new Error('Failed to fetch inventory risk report');
    }
}

export async function getCustomerValue(
    page: number = 1,
    limit: number = 10
): Promise<PaginatedResult<CustomerValue>> {
    try {
        const pagination = paginationSchema.parse({ page, limit });
        const offset = (pagination.page - 1) * pagination.limit;

        const sql = `
            SELECT customer_id, customer_name, email, total_orders, total_spent, avg_order_value, first_order, last_order
            FROM vw_customer_value
            ORDER BY total_spent DESC
            LIMIT $1 OFFSET $2
        `;

        const countSql = `SELECT COUNT(*) as count FROM vw_customer_value`;

        const [data, countResult] = await Promise.all([
            query<CustomerValue>(sql, [pagination.limit, offset]),
            query<{ count: string }>(countSql, [])
        ]);

        const total = parseInt(countResult[0]?.count || '0', 10);

        return {
            data,
            total,
            page: pagination.page,
            limit: pagination.limit,
            totalPages: Math.ceil(total / pagination.limit)
        };
    } catch (error) {
        console.error('Error fetching customer value:', error);
        if (error instanceof z.ZodError) {
            throw new Error(`Validation error: ${error.issues.map((e: z.ZodIssue) => e.message).join(', ')}`);
        }
        throw new Error('Failed to fetch customer value report');
    }
}

export async function getSalesChannel(): Promise<SalesChannel[]> {
    try {
        const sql = `
            SELECT channel, total_orders, unique_customers, total_revenue, avg_order_value, total_items
            FROM vw_sales_channel
            ORDER BY total_revenue DESC
        `;
        return await query<SalesChannel>(sql, []);
    } catch (error) {
        console.error('Error fetching sales by channel:', error);
        throw new Error('Failed to fetch sales by channel report');
    }
}

export async function getPaymentMix(): Promise<PaymentMix[]> {
    try {
        const sql = `
            SELECT method, total_payments, total_amount, percentage
            FROM vw_payment_mix
            ORDER BY total_amount DESC
        `;
        return await query<PaymentMix>(sql, []);
    } catch (error) {
        console.error('Error fetching payment mix:', error);
        throw new Error('Failed to fetch payment mix report');
    }
}
