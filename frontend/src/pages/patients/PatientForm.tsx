import {SaveIcon} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Field, FieldLabel} from "@/components/ui/field.tsx";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Patient} from "@/types/Patient.ts";

interface PatientFormProps {
    patient: Patient | null;
}

export default function PatientForm({patient}: PatientFormProps) {

    return (
        <div className="flex flex-col flex-1 justify-center items-center p-6 gap-2">
            <h1 className="text-3xl w-full text-center pl-4">{patient != null ? "Atualização de Paciente" : "Novo" +
                " Paciente"}</h1>
            <div className="flex flex-col gap-2 w-full h-full border-2 border-gray-200 rounded-lg p-4">
                <div id="toolsBar"
                     className="flex justify-end gap-1 w-full h-fit relative border-b-gray-300 pb-2 border-b-2">
                    <div id="left-toolsBar" className="flex w-full gap-2 justify-start">
                    </div>
                    <div id="center-toolsBar" className="flex justify-center w-full gap-2">
                        <Button className="cursor-pointer" variant="blue">
                            <SaveIcon/>
                            Salvar
                        </Button>
                    </div>
                    <div id="right-toolsBar" className="flex w-full gap-2 justify-end">
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
                        <FieldLabel htmlFor="input-field-name">Nome</FieldLabel>
                        <Input
                            id="input-field-name"
                            type="text"
                            placeholder="Cliente"
                        />
                    </Field>
                    <Field className="w-[300px]">
                        <FieldLabel htmlFor="input-field-tel">Telefone</FieldLabel>
                        <Input
                            id="input-field-tel"
                            type="text"
                            placeholder="(19) 99999-9999"
                        />
                    </Field>
                    <Field className="w-[150px]">
                        <FieldLabel htmlFor="input-field-cpf">CPF</FieldLabel>
                        <Input
                            id="input-field-cpf"
                            type="text"
                            placeholder="123.456.789-01"
                        />
                    </Field>
                    <Field className="w-[300px]">
                        <FieldLabel htmlFor="input-field-email">E-mail</FieldLabel>
                        <Input
                            id="input-field-email"
                            type="email"
                            placeholder="exemplo@email.com"
                        />
                    </Field>
                    <FieldLabel htmlFor="input-field-status">Status</FieldLabel>
                    <RadioGroup className="flex" defaultValue="active">
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="active" id="option-active"/>
                            <Label htmlFor="option-active">Ativo</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="inative" id="option-inative"/>
                            <Label htmlFor="option-inative">Inativo</Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>
        </div>
    )
}