import { NextResponse } from 'next/server';
import { getSalesChannel } from '@/lib/data';

export async function GET() {
    try {
        const data = await getSalesChannel();
        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Error fetching sales channel data' },
            { status: 500 }
        );
    }
}
