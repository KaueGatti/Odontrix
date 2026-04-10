import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import {createBrowserRouter, RouterProvider} from "react-router";
import MenuPage from "@/pages/MenuPage.jsx";
import ClientGridPage from "@/pages/clients/ClientGridPage.jsx";
import ClientFormPage from "@/pages/clients/ClientFormPage.jsx";
import SchedulePage from "@/pages/SchedulePage.jsx";

const router = createBrowserRouter([
        {
            path: "/",
            element: <App/>,
            children: [
                {
                    path: "/",
                    element: <MenuPage/>,
                    children: [
                        {
                            path: "/clientes",
                            element: <ClientGridPage/>,
                        },
                        {
                            path: "/clientes/form",
                            element: <ClientFormPage/>,
                        },
                        {
                            path: "/agenda",
                            element: <SchedulePage/>
                        },
                    ]
                },
            ]
        },
    ]
);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <RouterProvider router={router}/>
    </StrictMode>
    ,
)
