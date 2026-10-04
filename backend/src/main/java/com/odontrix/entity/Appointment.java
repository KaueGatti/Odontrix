package com.odontrix.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Consulta odontológica.
 *
 * <p>Nota: a coluna {@code time_range} (TSTZRANGE) NÃO é mapeada — ela é
 * mantida pelo trigger {@code set_appointment_time_range()} do banco e usada
 * pela exclusion constraint de sobreposição. Se um dia precisar dela no
 * código Java, avaliar hypersistence-utils (fora do escopo desta fase).</p>
 */
@Entity
@Table(name = "appointment")
@Getter
@Setter
@NoArgsConstructor
public class Appointment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "patient_id", nullable = false)
	private Patient patient;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "dentist_id", nullable = false)
	private Dentist dentist;

	/** Quem agendou — FK para {@code users(id)}. */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "receptionist_id", nullable = false)
	private User receptionist;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "appointment_type_id")
	private AppointmentType appointmentType;

	@Column(name = "scheduled_date_time", nullable = false)
	private OffsetDateTime scheduledDateTime;

	@Column(name = "estimated_duration_min", nullable = false)
	private Integer estimatedDurationMin;

	@Enumerated(EnumType.STRING)
	@JdbcTypeCode(SqlTypes.NAMED_ENUM)
	@Column(nullable = false)
	private AppointmentStatus status = AppointmentStatus.scheduled;

	@Column(name = "scheduling_observations", columnDefinition = "text")
	private String schedulingObservations;

	@Column(precision = 10, scale = 2)
	private BigDecimal price;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "cancellation_reason_id")
	private CancellationReason cancellationReason;

	@Column(name = "cancellation_notes", columnDefinition = "text")
	private String cancellationNotes;

	// ---- preenchido pelo dentista após a consulta ----

	@Column(name = "actual_start_date_time")
	private OffsetDateTime actualStartDateTime;

	@Column(name = "actual_end_date_time")
	private OffsetDateTime actualEndDateTime;

	@Column(name = "main_complaint", columnDefinition = "text")
	private String mainComplaint;

	@Column(columnDefinition = "text")
	private String diagnosis;

	@Column(name = "treatment_plan", columnDefinition = "text")
	private String treatmentPlan;

	@Column(name = "clinical_notes", columnDefinition = "text")
	private String clinicalNotes;

	@Column(name = "next_recommended_appointment")
	private LocalDate nextRecommendedAppointment;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false)
	private OffsetDateTime createdAt;
}
