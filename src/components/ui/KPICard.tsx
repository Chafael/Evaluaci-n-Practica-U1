interface KPICardProps {
    title: string;
    value: string | number;
    label?: string;
}

export default function KPICard({ title, value, label }: KPICardProps) {
    return (
        <div className="bg-white border border-[#E5DCC5] p-6">
            <h3 className="text-sm font-medium text-[#8D6E63] uppercase tracking-wide">
                {title}
            </h3>
            <div className="mt-2">
                <span className="text-3xl font-bold text-[#3E2723]">
                    {value}
                </span>
            </div>
            {label && (
                <p className="mt-2 text-sm text-[#8D6E63]">
                    {label}
                </p>
            )}
        </div>
    );
}
