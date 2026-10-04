package com.odontrix.entity;

/**
 * Status do contrato (enum nativo {@code contract_status}).
 * {@code signed} é terminal — contrato assinado não é editável nem cancelável.
 */
public enum ContractStatus {
	generated, awaiting_signature, signed, cancelled
}
