import {createRoot} from 'react-dom/client'
import './index.css'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css';

import {createBrowserRouter, RouterProvider} from "react-router"
import MenuPage from "@/pages/MenuPage.tsx"
import SchedulePage from "@/pages/SchedulePage.tsx"
import PatientPage from "@/pages/patients/PatientPage.tsx"
import {StrictMode} from "react";
import PatientFormPage from "@/pages/patients/PatientFormPage.tsx";
import {MantineProvider} from "@mantine/core";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MenuPage/>,
        children: [
            {
                path: "patients",
                element: <PatientPage/>,
            },
            {
                path: "patients/register",
                element: <PatientFormPage patient={null}/>
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
        <MantineProvider>
            <RouterProvider router={router}/>
        </MantineProvider>
    </StrictMode>
)