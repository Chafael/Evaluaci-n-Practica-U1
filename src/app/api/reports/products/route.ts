import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getTopProducts } from '@/lib/data';

const productsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    q: z.string().optional(),
});

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const parsed = productsQuerySchema.safeParse({
            page: searchParams.get('page') ?? undefined,
            limit: searchParams.get('limit') ?? undefined,
            q: searchParams.get('q') ?? undefined,
        });

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues.map(i => i.message).join(', ') },
                { status: 400 }
            );
        }

        const data = await getTopProducts(parsed.data.page, parsed.data.limit, parsed.data.q);
        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Error fetching top products' },
            { status: 500 }
        );
    }
}
