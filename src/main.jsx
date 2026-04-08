import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import {createBrowserRouter, RouterProvider} from "react-router";
import FormPage from "@/pages/FormPage.jsx";
import GridPage from "@/pages/GridPage.jsx";

const router = createBrowserRouter([
        {
            path: "/",
            element: <App/>,
            children: [
                {
                    path: "/",
                    element: <GridPage/>,
                },
                {
                    path: "edit",
                    element: <FormPage/>
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
