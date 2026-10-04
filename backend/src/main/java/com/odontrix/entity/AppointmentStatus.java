package com.odontrix.entity;

/**
 * Status da consulta (enum nativo {@code appointment_status}).
 *
 * <p>Máquina de estados em {@code maquinas-de-estado.md}: scheduled → confirmed
 * → checked_in → in_progress → completed; cancelamento em qualquer estado
 * anterior a completed; no_show automático por job; checked_in pode voltar
 * de no_show (paciente atrasado).</p>
 */
public enum AppointmentStatus {
	scheduled, confirmed, checked_in, in_progress, completed, cancelled, no_show
}
