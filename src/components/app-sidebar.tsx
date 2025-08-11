"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Siren,
  UserCheck,
  Shirt,
  Move,
  Eye,
  Hand,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Chatbot } from "@/components/chatbot";

const menuItems = [
  { href: "/", label: "Uniform Detection", icon: Shirt },
  { href: "/emergency-detection", label: "Emergency Detection", icon: Siren },
  { href: "/attendance", label: "Attendance System", icon: UserCheck },
  { href: "/mask-detection", label: "Mask Detection", icon: Shield },
  { href: "/movement-tracking", label: "Movement Tracking", icon: Move },
  { href: "/sign-detection", label: "Sign Detection", icon: Hand },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2.5 p-2">
          <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg">
            <Eye className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-headline font-semibold group-data-[collapsible=icon]:hidden">
            GuardianEye
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:items-center">
        <Chatbot />
      </SidebarFooter>
    </Sidebar>
  );
}
