package com.odontrix.entity;

import jakarta.persistence.Embeddable;

import java.io.Serializable;

/** PK composta de {@link PaymentInstallment} (payment_id, installment_id). */
@Embeddable
public record PaymentInstallmentId(Integer paymentId, Integer installmentId) implements Serializable {
}
