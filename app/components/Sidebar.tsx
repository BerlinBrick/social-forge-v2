"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/studio", label: "Content Studio" },
  { href: "/media", label: "Medien" },
  { href: "/posts", label: "Beiträge" },
  { href: "/planning", label: "Planung" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Einstellungen" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 p-6">
      <h1 className="text-3xl font-bold text-white mb-8">
        🚀 Social Forge
      </h1>

      <nav className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-xl px-4 py-3 transition ${
              pathname === item.href
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}