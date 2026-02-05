'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Navegación de reportes - Sin emojis por diseño corporativo
const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/reports/sales', label: 'Ventas Diarias' },
    { href: '/reports/products', label: 'Top Productos' },
    { href: '/reports/inventory', label: 'Inventario' },
    { href: '/reports/customers', label: 'Clientes' },
    { href: '/reports/payments', label: 'Métodos de Pago' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        // Sidebar color café tostado oscuro (#2C1810) - Flat, sin sombras
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#2C1810] text-stone-200 flex flex-col">
            {/* Logo/Título */}
            <div className="p-6 border-b border-[#4E342E]">
                <h1 className="text-xl font-bold text-white">CampusCafe</h1>
                <p className="text-stone-400 text-sm mt-1">Sistema de Reportes</p>
            </div>

            {/* Navegación */}
            <nav className="flex-1 p-4">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`block px-4 py-3 transition-colors ${isActive
                                        // Activo: fondo más claro + línea dorada izquierda
                                        ? 'bg-[#4E342E] text-white border-l-4 border-[#E5DCC5]'
                                        : 'text-stone-300 hover:bg-[#4E342E] hover:text-white border-l-4 border-transparent'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer del sidebar */}
            <div className="p-4 border-t border-[#4E342E] text-stone-500 text-xs">
                v1.0.0 - Proyecto Universitario
            </div>
        </aside>
    );
}
