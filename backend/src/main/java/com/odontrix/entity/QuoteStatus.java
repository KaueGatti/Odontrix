package com.odontrix.entity;

/**
 * Status do orçamento (enum nativo {@code quote_status}).
 * {@code expired} é computado/acionado em runtime — nunca por edição manual.
 */
public enum QuoteStatus {
	draft, sent, approved, rejected, expired
}
