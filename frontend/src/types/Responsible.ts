import {AddressForm} from "./Address.ts";

export interface ResponsibleForm {
    id?: number;
    fullName: string;
    cpf?: string;
    rg?: string;
    phone: string;
    email?: string;
    addressId?: number;
    address: AddressForm;
    active: boolean
}