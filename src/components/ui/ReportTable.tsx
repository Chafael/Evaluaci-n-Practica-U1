// ReportTable - Coffee Theme, Flat Design
// Datos genéricos via props, nunca hardcodeados

interface Column<T> {
    key: keyof T;
    header: string;
    // Render personalizado para formateo (moneda, fechas, etc.)
    render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface ReportTableProps<T> {
    columns: Column<T>[];
    data: T[];
    emptyMessage?: string;
}

export default function ReportTable<T extends Record<string, unknown>>({
    columns,
    data,
    emptyMessage = 'No hay datos disponibles'
}: ReportTableProps<T>) {
    if (data.length === 0) {
        return (
            <div className="bg-white border border-[#E5DCC5] p-8 text-center">
                <p className="text-[#8D6E63]">{emptyMessage}</p>
            </div>
        );
    }

    return (
        // Tabla con bordes beige, sin sombras - Flat Design
        <div className="bg-white border border-[#E5DCC5] overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    {/* Header - Marrón medio con texto blanco */}
                    <thead className="bg-[#8D6E63]">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={String(col.key)}
                                    className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wide"
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    {/* Body - Zebra striping con crema tenue */}
                    <tbody>
                        {data.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                // Fila par: blanco, Fila impar: crema tenue
                                className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-[#FAF7F2]'}
                            >
                                {columns.map((col) => (
                                    <td
                                        key={String(col.key)}
                                        className="px-6 py-4 text-sm text-[#3E2723]"
                                    >
                                        {col.render
                                            ? col.render(row[col.key], row)
                                            : String(row[col.key] ?? '-')
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
