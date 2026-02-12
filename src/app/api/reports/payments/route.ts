import { NextResponse } from 'next/server';
import { getPaymentMix } from '@/lib/data';

export async function GET() {
    try {
        const data = await getPaymentMix();
        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Error fetching payment mix data' },
            { status: 500 }
        );
    }
}
