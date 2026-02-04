import { NextRequest, NextResponse } from 'next/server';
import { getSalesDaily } from '@/lib/data';

// API Route para obtener ventas diarias con filtro de fechas
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const fromParam = searchParams.get('from');
        const toParam = searchParams.get('to');

        // Validar parámetros
        if (!fromParam || !toParam) {
            return NextResponse.json(
                { error: 'Se requieren los parámetros from y to' },
                { status: 400 }
            );
        }

        const from = new Date(fromParam);
        const to = new Date(toParam);

        // Validar fechas
        if (isNaN(from.getTime()) || isNaN(to.getTime())) {
            return NextResponse.json(
                { error: 'Fechas inválidas' },
                { status: 400 }
            );
        }

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
