import {Patient} from "@/types/Patient.ts";
import {useState} from 'react';
import {Button, Group, Stepper} from '@mantine/core';
import {FormCard} from "@/components/Form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useForm} from "react-hook-form";
import {Field, FieldLabel} from "@/components/ui/field.tsx";
import 'dayjs/locale/pt-br';
import {DateInput} from "@/components/DateInput.tsx";
import {RGInput} from "@/components/RGInput.tsx";
import {CPFInput} from "@/components/CPFInput.tsx";

interface PatientFormProps {
    patient: Patient | null;
}

export default function PatientFormPage({patient}: PatientFormProps) {

    function handleRegisterPatient(data: any) {
        console.log(data);
    }

    const [active, setActive] = useState(0);

    const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    const {handleSubmit} = useForm();

    return (
        <div className="flex flex-col h-full w-full items-center gap-4">
            <h1 className="text-5xl w-full h-[120px] flex justify-center items-center">{patient != null ? "Atualização de" +
                " Paciente" : "Cadastro" +
                " de" +
                " Paciente"}</h1>
            <Stepper active={active} onStepClick={setActive} className="w-[75%]">
                <Stepper.Step label="Dados Pessoais" description="Insira os dados pessoais">
                </Stepper.Step>
                <Stepper.Step label="Contato" description="Informações para contato">
                </Stepper.Step>
                <Stepper.Step label="Endereço" description="Endereço para contato">
                </Stepper.Step>
                <Stepper.Completed>
                    Cadastrado, aperte o botão &quot;Finalizar&quot; para acessar o formulário do paciente
                </Stepper.Completed>
            </Stepper>

            <FormCard className="flex flex-col gap-4">
                {active == 0 && <Step1/>}
                {active == 1 && <Step2/>}
                {active == 2 && <Step3/>}
                <Group className="mt-auto" justify="center">
                    {active != 0 && <Button variant="default" onClick={prevStep}>Voltar</Button>}
                    <Button onClick={active === 2 ? handleSubmit(handleRegisterPatient) : nextStep}>
                        {active === 2 ? "Finalizar" : "Próximo"}
                    </Button>
                </Group>
            </FormCard>

        </div>

    )
}

function Step1() {
    return (
        <div className="h-full w-full flex flex-col gap-4 justify-between">
            <Field className="">
                <FieldLabel htmlFor="name">Nome</FieldLabel>
                <Input id="name" placeholder="Nome do paciente..."/>
            </Field>
            <div className="flex gap-2">
                <Field className="">
                    <FieldLabel htmlFor="cpf">CPF</FieldLabel>
                    <CPFInput id="cpf" placeholder="123.456.789-01"/>
                </Field>
                <Field className="">
                    <FieldLabel htmlFor="rg">RG</FieldLabel>
                    <RGInput id="rg" placeholder="12.345.678-9"/>
                </Field>
            </div>
            <Field className="">
                <FieldLabel htmlFor="birthDate">Data de nascimento</FieldLabel>
                <DateInput id="birthDate"/>
            </Field>
        </div>
    )
}

function Step2() {
    return (
        <div className="h-full w-full flex flex-col gap-4 justify-between">
            <Field className="">
                <FieldLabel htmlFor="phone">Telefone</FieldLabel>
                <Input id="phone" placeholder="(19) 99871-9313"/>
            </Field>
            <Field className="">
                <FieldLabel htmlFor="emergencyPhone">Telefone de Emergência</FieldLabel>
                <Input id="emergencyPhone" placeholder="(19) 99689-1712"/>
            </Field>
            <Field className="">
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input id="email" type="email" placeholder="email@exemplo.com"/>
            </Field>
        </div>
    )
}

function Step3() {
    return (
        <div className="h-full w-full flex flex-col gap-4 justify-between">
            <Field className="">
                <FieldLabel htmlFor="name">Nome</FieldLabel>
                <Input id="name" placeholder="Nome do paciente..."/>
            </Field>
            <div className="flex gap-2">
                <Field className="">
                    <FieldLabel htmlFor="cpf">CPF</FieldLabel>
                    <CPFInput id="cpf" placeholder="123.456.789-01"/>
                </Field>
                <Field className="">
                    <FieldLabel htmlFor="rg">RG</FieldLabel>
                    <RGInput id="rg" placeholder="12.345.678-9"/>
                </Field>
            </div>
            <Field className="">
                <FieldLabel htmlFor="birthDate">Data de nascimento</FieldLabel>
                <DateInput id="birthDate"/>
            </Field>
        </div>
    )
}