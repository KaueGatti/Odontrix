import {Button} from "@/components/ui/button.tsx";
import {Search, UserPlus} from "lucide-react";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group.tsx";
import {useNavigate} from "react-router";

export default function PatientPage() {

    const navigate = useNavigate();

    const handleRegister = () => {
        navigate("/patients/register");
    }

    return (
        <div className="flex flex-col items-center w-full h-full flex-1 p-4 gap-4">
            <h1 className="flex justify-center items-end text-6xl h-[30%] w-full pl-4">Pacientes</h1>
            <InputGroup className="max-w-[480px] !h-10">
                <InputGroupInput placeholder="Nome do paciente..."/>
                <InputGroupAddon>
                    <Search/>
                </InputGroupAddon>
            </InputGroup>
            <Button onClick={handleRegister} variant="blue" className=" text-1xl font-medium flex flex-col p-[42px]">
                <UserPlus style={{height: "24px", width: "24px"}}/>
                Cadastrar Paciente
            </Button>
        </div>
    )
}