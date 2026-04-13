-- ============================================================
-- Dental Clinic Management System
-- Database: PostgreSQL
-- ============================================================

-- Enums
CREATE TYPE user_profile AS ENUM ('manager', 'receptionist', 'dentist');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled');
CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
CREATE TYPE attachment_type AS ENUM ('xray', 'intraoral_photo', 'document', 'other');
CREATE TYPE billing_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
CREATE TYPE installment_status AS ENUM ('pending', 'paid', 'overdue');
CREATE TYPE payment_method AS ENUM ('cash', 'debit_card', 'credit_card', 'boleto', 'pix');
CREATE TYPE payment_type AS ENUM ('income', 'expense');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'deactivate');
CREATE TYPE person_type AS ENUM ('legal_entity', 'natural_person');
CREATE TYPE quote_status AS ENUM ('draft', 'sent', 'approved', 'rejected', 'expired');
CREATE TYPE contract_status AS ENUM ('generated', 'awaiting_signature', 'signed', 'cancelled');

-- ------------------------------------------------------------
-- ADDRESS
-- ------------------------------------------------------------
CREATE TABLE address
(
    id           SERIAL PRIMARY KEY,
    cep          VARCHAR(10),
    street       VARCHAR(200),
    number       VARCHAR(20),
    complement   VARCHAR(50),
    neighborhood VARCHAR(100),
    city         VARCHAR(100) NOT NULL,
    state        VARCHAR(50),
    country      VARCHAR(50)  NOT NULL DEFAULT 'Brasil'
);

-- ------------------------------------------------------------
-- CLINIC
-- ------------------------------------------------------------
CREATE TABLE clinic
(
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(150)       NOT NULL,
    cnpj         VARCHAR(18) UNIQUE NOT NULL,
    logo_url     TEXT,
    phone        VARCHAR(20),
    address_id   INT REFERENCES address (id),
    opening_time TIME               NOT NULL,
    closing_time TIME               NOT NULL,
    active       BOOLEAN            NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------
CREATE TABLE users
(
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(150)        NOT NULL,
    email         VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT                NOT NULL,
    profile       user_profile        NOT NULL,
    active        BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- SPECIALTIES
-- ------------------------------------------------------------
CREATE TABLE specialty
(
    id     SERIAL PRIMARY KEY,
    name   VARCHAR(100) NOT NULL UNIQUE,
    active BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------
-- DENTAL PLANS
-- ------------------------------------------------------------
CREATE TABLE plan
(
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100)   NOT NULL,
    description   TEXT,
    validity_days INT            NOT NULL,
    price         NUMERIC(10, 2) NOT NULL,
    active        BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- RESPONSIBLE (financial/legal guardian)
-- ------------------------------------------------------------
CREATE TABLE responsible
(
    id         SERIAL PRIMARY KEY,
    full_name  VARCHAR(150)       NOT NULL,
    cpf        VARCHAR(14) UNIQUE NOT NULL,
    phone      VARCHAR(20)        NOT NULL,
    email      VARCHAR(150),
    address_id INT REFERENCES address (id),
    active     BOOLEAN            NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------
-- PATIENTS
-- ------------------------------------------------------------
CREATE TABLE patient
(
    id              SERIAL PRIMARY KEY,
    full_name       VARCHAR(150) NOT NULL,
    cpf             VARCHAR(14) UNIQUE,
    rg              VARCHAR(14) UNIQUE,
    phone           VARCHAR(20)  NOT NULL,
    emergency_phone VARCHAR(20)  NOT NULL,
    email           VARCHAR(150),
    birth_date      DATE         NOT NULL,
    address_id      INT REFERENCES address (id),
    referral_source VARCHAR(100),
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    responsible_id  INT REFERENCES responsible (id),
    plan_id         INT REFERENCES plan (id),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT patient_document_check CHECK (cpf IS NOT NULL OR rg IS NOT NULL)
);

-- ------------------------------------------------------------
-- DENTISTS
-- ------------------------------------------------------------
CREATE TABLE dentist
(
    id                 SERIAL PRIMARY KEY,
    user_id            INT          NOT NULL UNIQUE REFERENCES users (id),
    full_name          VARCHAR(150) NOT NULL,
    cpf                VARCHAR(14),
    cnpj               VARCHAR(18),
    cro_number         VARCHAR(30),
    phone              VARCHAR(20)  NOT NULL,
    email              VARCHAR(150),
    birth_date         DATE,
    appointment_price  NUMERIC(10, 2),
    commission_percent NUMERIC(5, 2),
    person_type        person_type  NOT NULL,
    active             BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT dentist_doc_check CHECK (cpf IS NOT NULL OR cnpj IS NOT NULL)
);

-- ------------------------------------------------------------
-- DENTIST × SPECIALTY (N:N)
-- ------------------------------------------------------------
CREATE TABLE dentist_specialty
(
    dentist_id   INT NOT NULL REFERENCES dentist (id),
    specialty_id INT NOT NULL REFERENCES specialty (id),
    PRIMARY KEY (dentist_id, specialty_id)
);

-- ------------------------------------------------------------
-- DENTIST UNAVAILABILITY
-- ------------------------------------------------------------
CREATE TABLE unavailability
(
    id         SERIAL PRIMARY KEY,
    dentist_id INT  NOT NULL REFERENCES dentist (id),
    start_date DATE NOT NULL,
    end_date   DATE NOT NULL,

    CONSTRAINT unavailability_date_check CHECK (start_date < end_date)
);

-- ------------------------------------------------------------
-- APPOINTMENT TYPES
-- ------------------------------------------------------------
CREATE TABLE appointment_type
(
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    active      BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------
-- PROCEDURES
-- ------------------------------------------------------------
CREATE TABLE procedure
(
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(150)   NOT NULL,
    description     TEXT,
    reference_price NUMERIC(10, 2) NOT NULL,
    active          BOOLEAN        NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------
-- APPOINTMENTS
-- ------------------------------------------------------------
CREATE TABLE appointment
(
    id                           SERIAL PRIMARY KEY,
    patient_id                   INT                NOT NULL REFERENCES patient (id),
    dentist_id                   INT                NOT NULL REFERENCES dentist (id),
    receptionist_id              INT                NOT NULL REFERENCES users (id),
    appointment_type_id          INT REFERENCES appointment_type (id),
    scheduled_date_time          TIMESTAMPTZ        NOT NULL,
    estimated_duration_min       INT                NOT NULL,
    status                       appointment_status NOT NULL DEFAULT 'scheduled',
    scheduling_observations      TEXT,
    price                        NUMERIC(10, 2),
    cancellation_reason          TEXT,

    -- Filled by the dentist after the appointment
    actual_start_date_time       TIMESTAMPTZ,
    actual_end_date_time         TIMESTAMPTZ,
    main_complaint               TEXT,
    diagnosis                    TEXT,
    treatment_plan               TEXT,
    clinical_notes               TEXT,
    next_recommended_appointment DATE,

    created_at                   TIMESTAMPTZ        NOT NULL DEFAULT NOW(),

    CONSTRAINT cancellation_reason_check
        CHECK (status != 'cancelled' OR cancellation_reason IS NOT NULL
)
    );

-- ------------------------------------------------------------
-- APPOINTMENT × PROCEDURE (N:N)
-- ------------------------------------------------------------
CREATE TABLE appointment_procedure
(
    appointment_id INT            NOT NULL REFERENCES appointment (id),
    procedure_id   INT            NOT NULL REFERENCES procedure (id),
    tooth_fdi      SMALLINT,
    unit_price     NUMERIC(10, 2) NOT NULL,
    discount       NUMERIC(10, 2) NOT NULL DEFAULT 0,
    final_price    NUMERIC(10, 2) NOT NULL,
    observation    TEXT,
    PRIMARY KEY (appointment_id, procedure_id, tooth_fdi)
);

-- ------------------------------------------------------------
-- ANAMNESIS (patient health history)
-- ------------------------------------------------------------
CREATE TABLE anamnesis
(
    id                     SERIAL PRIMARY KEY,
    patient_id             INT         NOT NULL REFERENCES patient (id),
    dentist_id             INT         NOT NULL REFERENCES dentist (id),
    record_date            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    allergies              TEXT,
    current_medications    TEXT,
    preexisting_conditions TEXT,
    observations           TEXT
);

-- ------------------------------------------------------------
-- ATTACHMENTS
-- ------------------------------------------------------------
CREATE TABLE attachment
(
    id             SERIAL PRIMARY KEY,
    patient_id     INT             NOT NULL REFERENCES patient (id),
    appointment_id INT REFERENCES appointment (id),
    description    VARCHAR(200),
    file_url       TEXT            NOT NULL,
    type           attachment_type NOT NULL DEFAULT 'other',
    sent_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- BILLINGS (generated automatically when appointment is completed)
-- ------------------------------------------------------------
CREATE TABLE billing
(
    id             SERIAL PRIMARY KEY,
    appointment_id INT            NOT NULL UNIQUE REFERENCES appointment (id),
    patient_id     INT            NOT NULL REFERENCES patient (id),
    total_amount   NUMERIC(10, 2) NOT NULL,
    discount       NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status         billing_status NOT NULL DEFAULT 'pending',
    created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- INSTALLMENTS
-- ------------------------------------------------------------
CREATE TABLE installment
(
    id             SERIAL PRIMARY KEY,
    billing_id     INT                NOT NULL REFERENCES billing (id),
    number         SMALLINT           NOT NULL,
    amount         NUMERIC(10, 2)     NOT NULL,
    due_date       DATE               NOT NULL,
    payment_date   DATE,
    payment_method payment_method,
    status         installment_status NOT NULL DEFAULT 'pending',

    CONSTRAINT installment_method_check
        CHECK (payment_method IN ('credit_card', 'boleto') OR number = 1)
);

-- ------------------------------------------------------------
-- COST CENTERS
-- ------------------------------------------------------------
CREATE TABLE cost_center
(
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    active      BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------
-- PAYMENTS (clinic income and expenses)
-- ------------------------------------------------------------
CREATE TABLE payment
(
    id             SERIAL PRIMARY KEY,
    user_id        INT            NOT NULL REFERENCES users (id),
    type           payment_type   NOT NULL,
    billing_id     INT REFERENCES billing (id),
    cost_center_id INT REFERENCES cost_center (id),
    notes          TEXT,
    amount         NUMERIC(10, 2) NOT NULL,
    payment_method payment_method NOT NULL,
    date_time      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    refund_ref_id  INT REFERENCES payment (id),

    CONSTRAINT payment_source_check CHECK (
        (type = 'income' AND billing_id IS NOT NULL AND cost_center_id IS NULL) OR
        (type = 'expense' AND cost_center_id IS NOT NULL AND billing_id IS NULL)
        )
);

-- ------------------------------------------------------------
-- QUOTES
-- ------------------------------------------------------------
CREATE TABLE quote
(
    id           SERIAL PRIMARY KEY,
    patient_id   INT            NOT NULL REFERENCES patient (id),
    dentist_id   INT            NOT NULL REFERENCES dentist (id),
    created_by   INT            NOT NULL REFERENCES users (id),
    status       quote_status   NOT NULL DEFAULT 'draft',
    discount     NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    valid_until  DATE,
    notes        TEXT,
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- QUOTE × PROCEDURE (1:N)
-- ------------------------------------------------------------
CREATE TABLE quote_procedure
(
    id           SERIAL PRIMARY KEY,
    quote_id     INT            NOT NULL REFERENCES quote (id),
    procedure_id INT            NOT NULL REFERENCES procedure (id),
    unit_price   NUMERIC(10, 2) NOT NULL,
    discount     NUMERIC(10, 2) NOT NULL DEFAULT 0,
    quantity     SMALLINT       NOT NULL DEFAULT 1,
    final_price  NUMERIC(10, 2) NOT NULL,
    notes        TEXT
);

-- ------------------------------------------------------------
-- CONTRACT TEMPLATES
-- ------------------------------------------------------------
CREATE TABLE contract_template
(
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- CONTRACT TEMPLATE VERSIONS
-- Imutável — nunca atualizar, sempre inserir nova versão
-- ------------------------------------------------------------
CREATE TABLE contract_template_version
(
    id                   SERIAL PRIMARY KEY,
    contract_template_id INT         NOT NULL REFERENCES contract_template (id),
    version_number       INT         NOT NULL,
    content              TEXT        NOT NULL,
    created_by           INT         NOT NULL REFERENCES users (id),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_contract_template_version
        UNIQUE (contract_template_id, version_number)
);

-- ------------------------------------------------------------
-- CONTRACTS
-- ------------------------------------------------------------
CREATE TABLE contract
(
    id                  SERIAL PRIMARY KEY,
    patient_id          INT             NOT NULL REFERENCES patient (id),
    appointment_id      INT             NOT NULL REFERENCES appointment (id),
    template_version_id INT             NOT NULL REFERENCES contract_template_version (id),
    snapshot_data       JSONB           NOT NULL,
    status              contract_status NOT NULL DEFAULT 'generated',
    generated_by        INT             NOT NULL REFERENCES users (id),
    generated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    signed_at           TIMESTAMPTZ,
    cancelled_at        TIMESTAMPTZ,
    cancellation_reason TEXT
);

-- ------------------------------------------------------------
-- AUDIT LOG
-- ------------------------------------------------------------
CREATE TABLE audit_log
(
    id            SERIAL PRIMARY KEY,
    user_id       INT          NOT NULL REFERENCES users (id),
    table_name    VARCHAR(100) NOT NULL,
    record_id     INT          NOT NULL,
    action        audit_action NOT NULL,
    previous_data JSONB,
    new_data      JSONB,
    occurred_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- VIEWS
-- ============================================================

-- ------------------------------------------------------------
-- vw_appointment_summary
-- Listagem da agenda e dashboard
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW vw_appointment_summary AS
SELECT
    a.id                        AS appointment_id,
    a.scheduled_date_time,
    a.estimated_duration_min,
    a.status,
    a.price,
    a.cancellation_reason,
    a.actual_start_date_time,
    a.actual_end_date_time,
    p.id                        AS patient_id,
    p.full_name                 AS patient_name,
    p.phone                     AS patient_phone,
    d.id                        AS dentist_id,
    d.full_name                 AS dentist_name,
    at2.name                    AS appointment_type,
    u.name                      AS receptionist_name
FROM appointment a
         JOIN patient         p   ON p.id  = a.patient_id
         JOIN dentist         d   ON d.id  = a.dentist_id
         JOIN users           u   ON u.id  = a.receptionist_id
         LEFT JOIN appointment_type at2 ON at2.id = a.appointment_type_id;

-- ------------------------------------------------------------
-- vw_billing_overview
-- Situação financeira por cobrança
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW vw_billing_overview AS
SELECT
    b.id                                            AS billing_id,
    b.status                                        AS billing_status,
    b.total_amount,
    b.discount,
    b.created_at                                    AS billing_created_at,
    p.id                                            AS patient_id,
    p.full_name                                     AS patient_name,
    a.scheduled_date_time,
    COUNT(i.id)                                     AS total_installments,
    COUNT(i.id) FILTER (WHERE i.status = 'pending') AS pending_installments,
    COUNT(i.id) FILTER (WHERE i.status = 'overdue') AS overdue_installments,
    COALESCE(SUM(i.amount) FILTER (WHERE i.status = 'pending'), 0) AS pending_amount,
    COALESCE(SUM(i.amount) FILTER (WHERE i.status = 'overdue'), 0) AS overdue_amount
FROM billing b
         JOIN patient     p ON p.id = b.patient_id
         JOIN appointment a ON a.id = b.appointment_id
         LEFT JOIN installment i ON i.billing_id = b.id
GROUP BY b.id, p.id, a.scheduled_date_time;

-- ------------------------------------------------------------
-- vw_contract_detail
-- Geração de PDF e exibição do contrato
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW vw_contract_detail AS
SELECT
    c.id                    AS contract_id,
    c.status,
    c.snapshot_data,
    c.generated_at,
    c.signed_at,
    c.cancelled_at,
    c.cancellation_reason,
    p.id                    AS patient_id,
    p.full_name             AS patient_name,
    p.cpf                   AS patient_cpf,
    a.id                    AS appointment_id,
    a.scheduled_date_time,
    ct.id                   AS template_id,
    ct.name                 AS template_name,
    ctv.id                  AS template_version_id,
    ctv.version_number,
    ctv.content             AS template_content,
    u.id                    AS generated_by_id,
    u.name                  AS generated_by_name
FROM contract c
         JOIN patient                  p   ON p.id   = c.patient_id
         JOIN appointment              a   ON a.id   = c.appointment_id
         JOIN contract_template_version ctv ON ctv.id = c.template_version_id
         JOIN contract_template        ct  ON ct.id  = ctv.contract_template_id
         JOIN users                    u   ON u.id  = c.generated_by;

-- ------------------------------------------------------------
-- vw_dentist_schedule
-- Agenda do dentista com indisponibilidades
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW vw_dentist_schedule AS
SELECT
    d.id                    AS dentist_id,
    d.full_name             AS dentist_name,
    a.id                    AS appointment_id,
    a.scheduled_date_time,
    a.estimated_duration_min,
    a.status                AS appointment_status,
    p.full_name             AS patient_name,
    CAST(NULL AS INTEGER)     AS unavailability_id,
    CAST(NULL AS DATE)       AS unavailability_start,
    CAST(NULL AS DATE)       AS unavailability_end,
    'appointment'          AS entry_type
FROM dentist d
         JOIN appointment a ON a.dentist_id = d.id
         JOIN patient     p ON p.id = a.patient_id
WHERE a.status NOT IN ('cancelled')

UNION ALL

SELECT
    d.id,
    d.full_name,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    u.id,
    u.start_date,
    u.end_date,
    'unavailability'
FROM dentist d
         JOIN unavailability u ON u.dentist_id = d.id;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_appointment_patient ON appointment (patient_id);
CREATE INDEX idx_appointment_dentist ON appointment (dentist_id);
CREATE INDEX idx_appointment_date ON appointment (scheduled_date_time);
CREATE INDEX idx_appointment_status ON appointment (status);
CREATE INDEX idx_billing_patient ON billing (patient_id);
CREATE INDEX idx_billing_status ON billing (status);
CREATE INDEX idx_installment_due_date ON installment (due_date);
CREATE INDEX idx_installment_status ON installment (status);
CREATE INDEX idx_anamnesis_patient ON anamnesis (patient_id);
CREATE INDEX idx_attachment_patient ON attachment (patient_id);
CREATE INDEX idx_audit_log_table_record ON audit_log (table_name, record_id);
CREATE INDEX idx_audit_log_occurred ON audit_log (occurred_at);
CREATE INDEX idx_unavailability_dentist ON unavailability (dentist_id, start_date);
CREATE INDEX idx_unavailability_end_date ON unavailability (end_date);
CREATE INDEX idx_address_city ON address (city);
CREATE INDEX idx_patient_address ON patient (address_id);
CREATE INDEX idx_clinic_address ON clinic (address_id);
CREATE INDEX idx_responsible_address ON responsible (address_id);
CREATE INDEX idx_dentist_user ON dentist (user_id);
CREATE INDEX idx_quote_patient ON quote (patient_id);
CREATE INDEX idx_quote_dentist ON quote (dentist_id);
CREATE INDEX idx_quote_created_by ON quote (created_by);
CREATE INDEX idx_quote_status ON quote (status);
CREATE INDEX idx_quote_procedure_quote ON quote_procedure (quote_id);
CREATE INDEX idx_appointment_procedure ON appointment_procedure (appointment_id);
CREATE INDEX idx_payment_billing ON payment (billing_id);
CREATE INDEX idx_payment_cost_center ON payment (cost_center_id);
CREATE INDEX idx_payment_type ON payment (type);
CREATE INDEX idx_payment_date ON payment (date_time);
CREATE INDEX idx_cost_center_active ON cost_center (active);
CREATE INDEX idx_contract_template_version_template ON contract_template_version (contract_template_id);
CREATE INDEX idx_contract_patient ON contract (patient_id);
CREATE INDEX idx_contract_appointment ON contract (appointment_id);
CREATE INDEX idx_contract_status ON contract (status);
CREATE INDEX idx_contract_generated_by ON contract (generated_by);
CREATE INDEX idx_contract_snapshot ON contract USING GIN (snapshot_data);