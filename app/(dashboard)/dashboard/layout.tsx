"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"



export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider >
        <main>
          <SidebarTrigger className="w-16 h-10 px-2 py-1"/>
        </main>
         {children}
    </SidebarProvider>
    
   
  )
}