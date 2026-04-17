import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import {createBrowserRouter, RouterProvider} from "react-router";
import MenuPage from "@/pages/MenuPage.jsx";
import SchedulePage from "@/pages/SchedulePage.jsx";
import PatientFormPage from "@/pages/patients/PatientFormPage.jsx";
import PatientGridPage from "@/pages/patients/PatientGridPage.jsx";

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
                            path: "/patients",
                            element: <PatientGridPage/>,
                        },
                        {
                            path: "/patients/form",
                            element: <PatientFormPage/>,
                        },
                        {
                            path: "/schedule",
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
)
