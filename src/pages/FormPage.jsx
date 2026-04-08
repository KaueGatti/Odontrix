import {
    ArrowBigLeft,
    ReceiptTurkishLira,
    RefreshCw, SaveIcon, SkipBack, StepBackIcon,
    TrashIcon
} from "lucide-react";
import {Button} from "@/components/ui/button.jsx";
import {useState} from "react";
import {Input} from "@/components/ui/input.jsx";
import {Field, FieldLabel} from "@/components/ui/field.jsx";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group.jsx";
import {Label} from "@/components/ui/label.jsx";
import {useNavigate} from "react-router";

function FormPage() {

    const navigate = useNavigate();

    const [spinning, setSpinning] = useState(false)

    const onBackClick = () => {
        navigate("/");
    }

    function handleSpinCLick() {
        setSpinning(true)
        setTimeout(() => setSpinning(false), 1000) // para após 1 segundo
    }

    return (
        <div className="flex flex-col items-center pt-2 px-4 w-[800px] pr-6 gap-2">
            <h1 className="text-4xl w-full text-left pl-4">Atualização de Produto</h1>
            <div className="flex flex-col gap-2 w-full h-full border-2 border-gray-200 rounded-lg p-4">
                <div id="toolsBar" className="flex justify-end gap-1 w-full h-fit relative border-b-gray-300 pb-2 border-b-2">
                    <div id="left-toolsBar" className="flex w-full gap-2 justify-start">
                    </div>
                    <div id="center-toolsBar" className="flex justify-center w-full gap-2">
                        <Button className="cursor-pointer" variant="blue">
                            <SaveIcon/>
                            Salvar
                        </Button>
                        <Button className="cursor-pointer" variant="red">
                            <TrashIcon/>
                            Excluir
                        </Button>
                    </div>
                    <div id="right-toolsBar" className="flex w-full gap-2 justify-end">
                        <Button className="cursor-pointer" onClick={handleSpinCLick} variant="blue">
                            <RefreshCw
                                className={`transition-transform ${spinning ? "animate-spin" : ""}`}/>
                        </Button>
                        <Button onClick={onBackClick} className="cursor-pointer" variant="outline">
                            <ArrowBigLeft/>
                            Voltar
                        </Button>
                    </div>
                </div>
                <div id="form" className="flex flex-col gap-2">
                    <Field className="w-[100px]">
                        <FieldLabel htmlFor="input-field-id">ID</FieldLabel>
                        <Input
                            id="input-field-id"
                            type="text"
                            value="32"
                            disabled
                        />
                    </Field>
                    <Field className="w-[300px]">
                        <FieldLabel htmlFor="input-field-description">Descrição</FieldLabel>
                        <Input
                            id="input-field-description"
                            type="text"
                            placeholder="Insira uma descrição para o produto"
                        />
                    </Field>
                    <Field className="w-[300px]">
                        <FieldLabel htmlFor="input-field-value">Valor</FieldLabel>
                        <Input
                            id="input-field-value"
                            type="number"
                            placeholder="Insira um valor para o produto"
                        />
                    </Field>
                    <Field className="w-[100px]">
                        <FieldLabel htmlFor="input-field-quantity">Quantidade</FieldLabel>
                        <Input
                            id="input-field-quantity"
                            type="number"
                            placeholder=""
                            min="0"
                        />
                    </Field>
                    <RadioGroup className="flex" defaultValue="active">
                            <div className="flex items-center gap-3">
                                <RadioGroupItem value="active" id="option-active" />
                                <Label htmlFor="option-active">Ativo</Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <RadioGroupItem value="inative" id="option-inative" />
                                <Label htmlFor="option-inative">Inativo</Label>
                            </div>
                    </RadioGroup>
                </div>
            </div>
        </div>
    )
}

export default FormPage;