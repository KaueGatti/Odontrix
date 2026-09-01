import {createRoot} from 'react-dom/client'
import './index.css'

import {createBrowserRouter, RouterProvider} from "react-router"
import {StrictMode} from "react";
import LoginPage from "@/pages/Login.tsx";
import RecuperarSenhaPage from "@/pages/RecuperarSenha.tsx";
import RedefinirSenhaPage from "@/pages/RedefinirSenha.tsx";
import {AppLayout} from "@/pages/AppLayout.tsx";
import {ConfiguracoesPage} from "@/pages/Configuracoes.tsx";
import {AuxiliaresPage} from "@/pages/Auxiliares.tsx";
import PacientesListPage from "@/pages/patients/PacientesList.tsx";
import CadastroPacientePage from "@/pages/patients/CadastroPaciente.tsx";
import PacienteDetalhesPage from "@/pages/patients/PacienteDetalhes.tsx";
import RecepcionistasListPage from "@/pages/receptionists/RecepcionistasList.tsx";
import CadastroRecepcionistaPage from "@/pages/receptionists/CadastroRecepcionista.tsx";
import RecepcionistaDetalhesPage from "@/pages/receptionists/RecepcionistaDetalhes.tsx";
import DentistasListPage from "@/pages/dentists/DentistasList.tsx";
import CadastroDentistaPage from "@/pages/dentists/CadastroDentista.tsx";
import DentistaDetalhesPage from "@/pages/dentists/DentistaDetalhes.tsx";
import DashboardPage from "@/pages/dashboard/DashboardPage.tsx";
import ContasPage from "@/pages/financeiro/ContasPage.tsx";
import AReceberPage from "@/pages/financeiro/AReceberPage.tsx";
import APagarPage from "@/pages/financeiro/APagarPage.tsx";
import AgendaPage from "@/pages/agenda/AgendaPage.tsx";
import AtendimentoPage from "@/pages/agenda/atendimento/AtendimentoPage.tsx";

const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginPage/>
    },
    {
        path: "/recover-password",
        element: <RecuperarSenhaPage/>
    },
    {
        path: "/reset-password",
        element: <RedefinirSenhaPage/>
    },
    {
        path: "/",
        element: <AppLayout/>,
        children: [
            {
                path: "dashboard",
                element: <DashboardPage/>,
            },
            {
                path: "agenda",
                element: <AgendaPage/>,
            },
            {
                path: "agenda/atendimento/:id",
                element: <AtendimentoPage/>,
            },
            {
                path: "pacientes",
                element: <PacientesListPage/>,
            },
            {
                path: "pacientes/register",
                element: <CadastroPacientePage/>,
            },
            {
                path: "pacientes/details",
                element: <PacienteDetalhesPage/>,
            },
            {
                path: "recepcionistas",
                element: <RecepcionistasListPage/>,
            },
            {
                path: "recepcionistas/register",
                element: <CadastroRecepcionistaPage/>,
            },
            {
                path: "recepcionistas/details",
                element: <RecepcionistaDetalhesPage/>,
            },
            {
                path: "dentistas",
                element: <DentistasListPage/>,
            },
            {
                path: "dentistas/register",
                element: <CadastroDentistaPage/>,
            },
            {
                path: "dentistas/details",
                element: <DentistaDetalhesPage/>,
            },
            {
                path: "contas",
                element: <ContasPage/>,
            },
            {
                path: "a-pagar",
                element: <APagarPage/>,
            },
            {
                path: "a-receber",
                element: <AReceberPage/>,
            },
            {
                path: "contratos",
                element: <></>,
            },
            {
                path: "planos",
                element: <></>,
            },
            {
                path: "auxiliares",
                element: <AuxiliaresPage/>,
            },
            {
                path: "configuracoes",
                element: <ConfiguracoesPage/>,
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