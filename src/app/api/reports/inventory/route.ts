import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getInventoryRisk } from '@/lib/data';

const inventoryQuerySchema = z.object({
    category: z.string().optional(),
});

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const parsed = inventoryQuerySchema.safeParse({
            category: searchParams.get('category') ?? undefined,
        });

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues.map(i => i.message).join(', ') },
                { status: 400 }
            );
        }

        const data = await getInventoryRisk(parsed.data.category);
        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Error fetching inventory risk data' },
            { status: 500 }
        );
    }
}
