import {Bolt, Calendar, ChevronsLeft, ChevronsRight, LucideIcon, Stethoscope, Users} from "lucide-react";
import {useState} from "react";
import {Outlet, useNavigate} from "react-router";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarHeaderTrigger,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider
} from "@/components/ui/sidebar.tsx";

interface MenuItem {
    id: string
    label: string
    icon: LucideIcon
    path: string
}

export default function MenuPage() {

    const navigate = useNavigate();

    const [activeItem, setActiveItem] = useState<MenuItem | null>(null)

    const navigateMenuItem = (item: MenuItem) => {
        setActiveItem(item);
        navigate(item.path);
    }

    const menuItems: MenuItem[] = [
        {id: "patients", label: "Pacientes", icon: Users, path: "patients"},
        {id: "dentists", label: "Dentistas", icon: Stethoscope, path: "dentists"},
        {id: "schedule", label: "Agenda", icon: Calendar, path: "schedule"},
    ]

    const footerItems: MenuItem[] = [
        {id: "settings", label: "Configurações", icon: Bolt, path: "settings"}
    ]

    return (
        /*<div className="w-screen h-screen flex">
            <div className="h-screen w-[75px] border-1 border-r-gray-300 shadow-[5px_0px_50px_-20px_rgba(0,0,0,0.1)]">
                <div
                    className="flex gap-1 items-center border-b-1 border-b-gray-300 shadow-sm justify-center w-full h-[80px]">
                    <img className="w-[30px]" src="/logo.png" alt=""/>
                    <ChevronsRight className="cursor-pointer"/>
                </div>
                {menuItems.map((item) => {
                    return (
                        <button
                            onClick={() => {
                                navigateMenuItem(item)
                            }}
                            key={item.id}
                            className={`cursor-pointer hover:bg-neutral-100 flex items-center gap-4 text-[22px] text-gray-600 h-fit py-4 w-full text-left pl-8 border-y-1 border-b-gray-300 ${activeItem?.id === item.id ? "bg-neutral-300 border-l-4 border-l-blue-500" : ""}`}>
                            <item.icon/>
                            {item.label}
                        </button>)
                })
                }
            </div>
            <Outlet/>
        </div>*/
        <SidebarProvider className={"p-2"} defaultOpen={false}>
            <Sidebar collapsible="icon">
                <SidebarHeader className="flex items-end">
                    <SidebarHeaderTrigger collapsedIcon={ChevronsRight} expandedIcon={ChevronsLeft}/>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {menuItems.map((item) => {
                                    return (
                                        <SidebarMenuItem key={item.label}>
                                            <SidebarMenuButton
                                                onClick={() => navigateMenuItem(item)}
                                                isActive={activeItem?.id === item.id}
                                                tooltip={item.label}
                                                className="data-active:bg-blue-500 data-active:text-white transition-colors duration-200 data-active:hover:bg-blue-500 data-active:hover:text-white
                                                hover:bg-gray-200"
                                            >
                                                <item.icon/>
                                                <span>{item.label}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })
                                }
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                        {footerItems.map((item) => {
                            return (
                                <SidebarMenuItem key={item.label}>
                                    <SidebarMenuButton
                                        onClick={() => navigateMenuItem(item)}
                                        isActive={activeItem?.id === item.id}
                                        tooltip={item.label}
                                        className="data-active:bg-blue-500 data-active:text-white transition-colors duration-200 data-active:hover:bg-blue-500 data-active:hover:text-white
                                                hover:bg-gray-200"
                                    >
                                        <item.icon/>
                                        <span>{item.label}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })
                        }
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <div className="flex-1 ml-(--sidebar-width-icon)">
                <Outlet/>
            </div>
        </SidebarProvider>
    )
}