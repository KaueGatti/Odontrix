import {
    PencilIcon,
    PlusIcon,
    RefreshCw,
    TrashIcon,
    Search,
    ChevronsRight,
    ChevronRight,
    ChevronLeft
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {Button} from "@/components/ui/button.jsx";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group"
import {useState} from "react";
import {useNavigate} from "react-router";

function PatientGridPage() {

    const navigate = useNavigate();

    const [spinning, setSpinning] = useState(false)

    function handleSpinCLick() {
        setSpinning(true)
        setTimeout(() => setSpinning(false), 1000)
    }

    const onEditPatientClick = () => {
        navigate("/patients/form");
    }

    return (
        <div className="flex flex-col items-center flex-1 p-6 pb-2 gap-2">
            <h1 className="text-4xl w-full text-left pl-4">Pacientes</h1>
            <div className="flex justify-end gap-2 w-full h-fit relative">
                <InputGroup className="max-w-xs absolute left-0">
                    <InputGroupInput placeholder="Procurar..." />
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end"></InputGroupAddon>
                </InputGroup>
                <Button className="cursor-pointer" variant="green">
                    <PlusIcon/>
                    Novo
                </Button>
                <Button className="cursor-pointer" onClick={handleSpinCLick} variant="blue">
                    <RefreshCw
                        className={`transition-transform ${spinning ? "animate-spin" : ""}`}/>
                </Button>
            </div>

            <Table className="flex-1">
                <TableHeader>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableHead className="w-[100px]" text-center>ID</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead className="text-center">Telefone</TableHead>
                        <TableHead className="text-center">CPF</TableHead>
                        <TableHead className="text-center">E-mail</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell onClick={onEditPatientClick}><PencilIcon className="cursor-pointer" size="20" color="blue"/></TableCell>
                        <TableCell className="font-medium">1</TableCell>
                        <TableCell>Kauê</TableCell>
                        <TableCell className="text-center">(19) 99871-9313</TableCell>
                        <TableCell className="text-center">538.350.558-01</TableCell>
                        <TableCell className="text-center">cliente@gmail.com</TableCell>
                        <TableCell><TrashIcon className="cursor-pointer" color="red" size="20"/></TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <div className="flex [&_*]:text-[16px] [&_*]:bg-transparent [&_*]:text-gray-700 [&_*]:cursor-pointer [&_*]:hover:bg-gray-100 justify-center items-center gap-x-1 h-[10%] w-full">
                <ChevronLeft className="rounded-md"/>
                <Button>1</Button>
                <Button>2</Button>
                <Button>3</Button>
                <Button>4</Button>
                <ChevronRight className="rounded-sm"/>
            </div>
        </div>
    )
}

export default ClientGridPage;