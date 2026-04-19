import {createRoot} from 'react-dom/client'
import './index.css'

import {createBrowserRouter, RouterProvider} from "react-router"
import MenuPage from "@/pages/MenuPage.tsx"
import SchedulePage from "@/pages/SchedulePage.tsx"
import PatientGridPage from "@/pages/patients/PatientGridPage.tsx"
import {StrictMode} from "react";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MenuPage/>,
        children: [
            {
                path: "patients",
                element: <PatientGridPage/>,
            },
            {
                path: "dentists",
                element: <></>,
            },
            {
                path: "schedule",
                element: <SchedulePage/>
            },
        ]
    },
])

const rootElement = document.getElementById('root')

if (!rootElement) {
    throw new Error('Elemento root não encontrado no DOM')
}

createRoot(rootElement).render(
    <StrictMode>
        <RouterProvider router={router}/>
    </StrictMode>
)