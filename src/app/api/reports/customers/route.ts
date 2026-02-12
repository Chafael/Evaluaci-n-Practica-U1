import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCustomerValue } from '@/lib/data';

const customersQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
});

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const parsed = customersQuerySchema.safeParse({
            page: searchParams.get('page') ?? undefined,
            limit: searchParams.get('limit') ?? undefined,
        });

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues.map(i => i.message).join(', ') },
                { status: 400 }
            );
        }

        const data = await getCustomerValue(parsed.data.page, parsed.data.limit);
        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Error fetching customer value data' },
            { status: 500 }
        );
    }
}
