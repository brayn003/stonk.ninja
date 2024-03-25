"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export default function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Dashboard",
      href: "/private/dashboard",
    },
    {
      name: "Capture",
      href: "/private/capture",
    },
  ];

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      {menuItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href ? "" : "text-muted-foreground",
          )}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
