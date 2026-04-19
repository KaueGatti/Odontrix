import {Bolt, Calendar, LucideIcon, Stethoscope, Users} from "lucide-react";
import {useState} from "react";
import {Outlet, useNavigate} from "react-router";

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
        {id: "settings", label: "Configurações", icon: Bolt, path: "settings"},
    ]

    return (
        <div className="w-screen h-screen flex">
            <div className="h-screen w-[350px] border-1 border-r-gray-300 shadow-[5px_0px_50px_-20px_rgba(0,0,0,0.1)]">
                <div
                    className="flex items-center border-b-1 border-b-gray-300 shadow-sm justify-center w-full h-[120px]">
                    <img className="w-[80px]" src="/logo.png" alt=""/>
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
        </div>)
}