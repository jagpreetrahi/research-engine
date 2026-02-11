"use client";

import  SidebarComponent  from "@/components/Sidebar";
import  Chat  from "@/components/chat";


export default function DashBoard() {
   return (
      <div className="flex h-screen w-full">
        {/**Sibebar fixed */}
        <SidebarComponent/>

        {/**main content area */}
        <div className="flex-1 flex flex-col">
            {/*message area */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto  p-4">
                     {/*chat content */}
                </div>
            </div>

            <div className="sticky bg-background overflow-y-auto resize-none min-h-40 bottom-0">
                <div className="max-w-[750px] mx-auto p-4 ">
                    <Chat/>
                </div>

            </div>

        </div>
         
      </div>
   )
}