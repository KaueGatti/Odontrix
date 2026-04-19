import {AddressForm} from "./Address.ts";
import {ResponsibleForm} from "./Responsible.ts";
import {PlanForm} from "./Plan.ts";

export interface Patient {
    id?: number;
    fullName: string;
    cpf?: string;
    rg?: string;
    telephoneContact: string;
    telephoneEmergency: string;
    birthdate: string;
    addressId?: number;
    address?: AddressForm;
    email?: string;
    planId?: number;
    plan?: PlanForm;
    responsibleId?: number;
    responsible?: ResponsibleForm;
    referralSource?: string;
}