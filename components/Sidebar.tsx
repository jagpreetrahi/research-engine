"use client";
import { signOut } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  useSidebar
} from "@/components/ui/sidebar"
import { Home, Users, LogOut, PanelLeftClose } from "lucide-react"

export default function SidebarComponent() {
    const {
        state,
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        isMobile,
        toggleSidebar,
    } = useSidebar()
    
    return (
        <Sidebar>
            <SidebarHeader className="flex flex-row justify-around items-center mx-auto gap-6">
                <h2 className="px-2 py-1 text-xl font-semibold">Research Engine</h2>
                
                <PanelLeftClose onClick={toggleSidebar} className="cursor-pointer hover:text-gray-500"/>
            </SidebarHeader>
            
            <SidebarContent>
                <SidebarGroup>
                    
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    <Home />
                                    <span>New Chat</span>
                                </SidebarMenuButton>
                                <SidebarMenuButton>
                                    <Home />
                                    <span>Chats</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Recents Chat</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => signOut({ callbackUrl: '/' })}>
                            <LogOut />
                            <span>Sign Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}