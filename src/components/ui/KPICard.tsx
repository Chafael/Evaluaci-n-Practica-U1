// Componente KPICard - Coffee Theme, Flat Design
// Los datos vienen de props desde lib/data.ts, nunca hardcodeados

interface KPICardProps {
    title: string;
    value: string | number;
    label?: string;
}

export default function KPICard({ title, value, label }: KPICardProps) {
    return (
        // Fondo blanco puro, borde beige suave, SIN sombras - Flat Design
        <div className="bg-white border border-[#E5DCC5] p-6">
            {/* Título - marrón medio */}
            <h3 className="text-sm font-medium text-[#8D6E63] uppercase tracking-wide">
                {title}
            </h3>

            {/* Valor principal - marrón oscuro, datos reales de BD */}
            <div className="mt-2">
                <span className="text-3xl font-bold text-[#3E2723]">
                    {value}
                </span>
            </div>

            {/* Label pequeño - marrón medio */}
            {label && (
                <p className="mt-2 text-sm text-[#8D6E63]">
                    {label}
                </p>
            )}
        </div>
    );
}
