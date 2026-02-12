import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSalesDaily } from '@/lib/data';

const salesQuerySchema = z.object({
    from: z.string().refine((val) => !isNaN(new Date(val).getTime()), { message: 'Fecha "from" invalida' }),
    to: z.string().refine((val) => !isNaN(new Date(val).getTime()), { message: 'Fecha "to" invalida' }),
});

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const parsed = salesQuerySchema.safeParse({
            from: searchParams.get('from'),
            to: searchParams.get('to'),
        });

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues.map(i => i.message).join(', ') },
                { status: 400 }
            );
        }

        const from = new Date(parsed.data.from);
        const to = new Date(parsed.data.to);

        const data = await getSalesDaily(from, to);
        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Error al obtener datos de ventas' },
            { status: 500 }
        );
    }
}
