package com.odontrix.entity;

import jakarta.persistence.Embeddable;

import java.io.Serializable;

/** PK composta de {@link PaymentExpense} (payment_id, expense_id). */
@Embeddable
public record PaymentExpenseId(Integer paymentId, Integer expenseId) implements Serializable {
}
