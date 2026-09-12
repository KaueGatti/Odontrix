-- ============================================================
-- Dental Clinic Management System — SEED DATA (dev/local only)
-- Nunca rodar em produção.
--
-- Senha de todos os usuários de teste: dev12345
-- (hash bcrypt abaixo já corresponde a essa senha)
-- ============================================================

-- ------------------------------------------------------------
-- ADDRESSES
-- ------------------------------------------------------------
INSERT INTO address (id, cep, street, number, complement, neighborhood, city, state, country) VALUES
    (1, '13500-000', 'Rua Sete de Setembro', '450', '', 'Centro', 'Rio Claro', 'SP', 'Brasil'),
    (2, '13500-010', 'Rua Dois de Julho', '120', 'Apto 12', 'Vila Paulista', 'Rio Claro', 'SP', 'Brasil'),
    (3, '13500-020', 'Avenida 29', '780', '', 'Jardim Bela Vista', 'Rio Claro', 'SP', 'Brasil'),
    (4, '13500-030', 'Rua Um', '55', 'Fundos', 'Centro', 'Rio Claro', 'SP', 'Brasil'),
    (5, '13500-040', 'Rua Cinco', '900', '', 'Jardim São Paulo', 'Rio Claro', 'SP', 'Brasil'),
    (6, '13500-050', 'Avenida Visconde do Rio Claro', '333', 'Sala 4', 'Centro', 'Rio Claro', 'SP', 'Brasil');
SELECT setval('address_id_seq', 6);

-- ------------------------------------------------------------
-- CLINIC
-- ------------------------------------------------------------
INSERT INTO clinic (id, name, cnpj, logo_url, phone, contact_email, address_id, opening_time, closing_time, active) VALUES
    (1, 'Clínica Odontológica Sorriso Pleno', '12.345.678/0001-90', NULL, '(19) 3333-4444', 'contato@sorrisopleno.com.br', 1, '08:00', '19:00', TRUE);
SELECT setval('clinic_id_seq', 1);

INSERT INTO clinic_bank_account (id, bank_name, agency, account, cedente_code, active) VALUES
    (1, 'Sicredi', '0748', '12345-6', '748900', TRUE);
SELECT setval('clinic_bank_account_id_seq', 1);

INSERT INTO clinic_settings (id, late_interest_percent, late_fee_percent, default_due_days, appointment_reminder_lead_hours, session_timeout_minutes) VALUES
    (1, 1.00, 2.00, 30, 24, 15);
SELECT setval('clinic_settings_id_seq', 1);

-- ------------------------------------------------------------
-- LOOKUP TABLES / TABELAS DE APOIO
-- ------------------------------------------------------------
INSERT INTO payment_method (id, description) VALUES
    (1, 'Cartão de Débito'),
    (2, 'Cartão de Crédito'),
    (3, 'Dinheiro'),
    (4, 'Boleto');
SELECT setval('payment_method_id_seq', 4);

INSERT INTO referral_source (id, description, active) VALUES
    (1, 'Indicação', TRUE),
    (2, 'Google', TRUE),
    (3, 'Instagram', TRUE),
    (4, 'Outro', TRUE);
SELECT setval('referral_source_id_seq', 4);

INSERT INTO attachment_type (id, description, active) VALUES
    (1, 'Radiografia', TRUE),
    (2, 'Foto intraoral', TRUE),
    (3, 'Anamnese', TRUE),
    (4, 'Outro', TRUE);
SELECT setval('attachment_type_id_seq', 4);

INSERT INTO specialty (id, name, active) VALUES
    (1, 'Clínico Geral', TRUE),
    (2, 'Ortodontia', TRUE),
    (3, 'Endodontia', TRUE),
    (4, 'Implantodontia', TRUE);
SELECT setval('specialty_id_seq', 4);

INSERT INTO appointment_type (id, name, description, active) VALUES
    (1, 'Consulta de rotina', 'Avaliação geral e acompanhamento', TRUE),
    (2, 'Limpeza', 'Profilaxia e remoção de tártaro', TRUE),
    (3, 'Avaliação', 'Primeira consulta / diagnóstico', TRUE),
    (4, 'Emergência', 'Atendimento de urgência', TRUE);
SELECT setval('appointment_type_id_seq', 4);

INSERT INTO cancellation_reason (id, description, active) VALUES
    (1, 'Paciente solicitou cancelamento', TRUE),
    (2, 'Conflito de agenda da clínica', TRUE),
    (3, 'Emergência médica do paciente', TRUE);
SELECT setval('cancellation_reason_id_seq', 3);

INSERT INTO cost_center (id, name, description, type, active) VALUES
    (1, 'Consultório', 'Receitas de consultas e procedimentos', 'income', TRUE),
    (2, 'Marketing', 'Anúncios e divulgação', 'expense', TRUE),
    (3, 'Administrativo', 'Material de escritório e despesas gerais', 'expense', TRUE);
SELECT setval('cost_center_id_seq', 3);

INSERT INTO dental_procedure (id, name, description, reference_price, active) VALUES
    (1, 'Limpeza (Profilaxia)', 'Remoção de placa e tártaro', 150.00, TRUE),
    (2, 'Extração simples', 'Extração de dente sem complicação', 200.00, TRUE),
    (3, 'Tratamento de canal', 'Endodontia completa', 800.00, TRUE),
    (4, 'Restauração/Obturação', 'Restauração com resina composta', 180.00, TRUE),
    (5, 'Clareamento dental', 'Clareamento a laser em consultório', 450.00, TRUE);
SELECT setval('dental_procedure_id_seq', 5);

INSERT INTO dental_plan (id, name, description, validity_days, price, active) VALUES
    (1, 'Plano Bronze', 'Cobertura básica, consultas de rotina', 365, 49.90, TRUE),
    (2, 'Plano Prata', 'Cobertura intermediária, inclui limpeza semestral', 365, 89.90, TRUE),
    (3, 'Plano Ouro', 'Cobertura completa, inclui procedimentos estéticos', 365, 149.90, TRUE);
SELECT setval('dental_plan_id_seq', 3);

-- ------------------------------------------------------------
-- USERS
-- Senha para todos: dev12345 (bcrypt, custo 10)
-- id 6 é uma conta reservada para ações automáticas do sistema
-- (job de no_show, futura confirmação de webhook de boleto).
-- OBS: user_profile não tem valor "system" — reaproveitando "manager"
-- com login desabilitado na prática (ver nota ao final do arquivo).
-- ------------------------------------------------------------
INSERT INTO users (id, username, email, password_hash, profile, active) VALUES
    (1, 'gerente.ana',      'ana.gerente@sorrisopleno.com.br',      '$2b$10$MENMeCLRP4/Vz.CvDk0P/utVIXnaFiUMbXpzVDb5./fPBP3tzjV6K', 'manager',      TRUE),
    (2, 'recepcao.bruna',   'bruna.recepcao@sorrisopleno.com.br',   '$2b$10$MENMeCLRP4/Vz.CvDk0P/utVIXnaFiUMbXpzVDb5./fPBP3tzjV6K', 'receptionist', TRUE),
    (3, 'recepcao.carla',   'carla.recepcao@sorrisopleno.com.br',   '$2b$10$MENMeCLRP4/Vz.CvDk0P/utVIXnaFiUMbXpzVDb5./fPBP3tzjV6K', 'receptionist', TRUE),
    (4, 'dr.eduardo',       'eduardo.dentista@sorrisopleno.com.br', '$2b$10$MENMeCLRP4/Vz.CvDk0P/utVIXnaFiUMbXpzVDb5./fPBP3tzjV6K', 'dentist',      TRUE),
    (5, 'dra.fernanda',     'fernanda.dentista@sorrisopleno.com.br','$2b$10$MENMeCLRP4/Vz.CvDk0P/utVIXnaFiUMbXpzVDb5./fPBP3tzjV6K', 'dentist',      TRUE),
    (6, 'sistema',          'sistema@sorrisopleno.internal',        '$2b$10$MENMeCLRP4/Vz.CvDk0P/utVIXnaFiUMbXpzVDb5./fPBP3tzjV6K', 'manager',      FALSE);
SELECT setval('users_id_seq', 6);

INSERT INTO receptionist (id, user_id, full_name, cpf, rg, phone, email, birth_date, hire_date, active) VALUES
    (1, 2, 'Bruna Oliveira', '100.100.100-01', NULL, '(19) 99111-0001', 'bruna.recepcao@sorrisopleno.com.br', '1996-03-14', CURRENT_DATE - INTERVAL '2 years', TRUE),
    (2, 3, 'Carla Mendes',   '100.100.100-02', NULL, '(19) 99111-0002', 'carla.recepcao@sorrisopleno.com.br', '1999-07-22', CURRENT_DATE - INTERVAL '6 months', TRUE);
SELECT setval('receptionist_id_seq', 2);

INSERT INTO dentist (id, user_id, full_name, cpf, rg, cnpj, cro_number, cro_state, phone, email, birth_date, appointment_price, commission_percent, person_type, active) VALUES
    (1, 4, 'Eduardo Ramalho', '100.100.100-03', NULL, NULL, '45678', 'SP', '(19) 99111-0003', 'eduardo.dentista@sorrisopleno.com.br', '1982-05-10', 150.00, 40.00, 'natural_person', TRUE),
    (2, 5, 'Fernanda Aquino', '100.100.100-04', NULL, NULL, '52341', 'SP', '(19) 99111-0004', 'fernanda.dentista@sorrisopleno.com.br', '1988-09-02', 180.00, 45.00, 'natural_person', TRUE);
SELECT setval('dentist_id_seq', 2);

INSERT INTO dentist_specialty (dentist_id, specialty_id) VALUES
    (1, 1), (1, 2),
    (2, 1), (2, 3);

-- Horário padrão: seg-sex 08:00-18:00 com almoço 12:00-13:00 para os dois;
-- Eduardo (dentist_id 1) também atende sábado de manhã.
INSERT INTO dentist_work_schedule (dentist_id, day_of_week, start_time, end_time, start_break, end_break, active, valid_from) VALUES
    (1, 'monday',    '08:00', '18:00', '12:00', '13:00', TRUE, CURRENT_DATE - INTERVAL '90 days'),
    (1, 'tuesday',   '08:00', '18:00', '12:00', '13:00', TRUE, CURRENT_DATE - INTERVAL '90 days'),
    (1, 'wednesday', '08:00', '18:00', '12:00', '13:00', TRUE, CURRENT_DATE - INTERVAL '90 days'),
    (1, 'thursday',  '08:00', '18:00', '12:00', '13:00', TRUE, CURRENT_DATE - INTERVAL '90 days'),
    (1, 'friday',    '08:00', '18:00', '12:00', '13:00', TRUE, CURRENT_DATE - INTERVAL '90 days'),
    (1, 'saturday',  '08:00', '12:00', NULL,    NULL,    TRUE, CURRENT_DATE - INTERVAL '90 days'),
    (2, 'monday',    '08:00', '18:00', '12:00', '13:00', TRUE, CURRENT_DATE - INTERVAL '90 days'),
    (2, 'tuesday',   '08:00', '18:00', '12:00', '13:00', TRUE, CURRENT_DATE - INTERVAL '90 days'),
    (2, 'wednesday', '08:00', '18:00', '12:00', '13:00', TRUE, CURRENT_DATE - INTERVAL '90 days'),
    (2, 'thursday',  '08:00', '18:00', '12:00', '13:00', TRUE, CURRENT_DATE - INTERVAL '90 days'),
    (2, 'friday',    '08:00', '18:00', '12:00', '13:00', TRUE, CURRENT_DATE - INTERVAL '90 days');

-- ------------------------------------------------------------
-- RESPONSIBLE (para o paciente menor de idade)
-- ------------------------------------------------------------
INSERT INTO responsible (id, full_name, cpf, rg, active) VALUES
    (1, 'Sandra Costa', '200.200.200-01', NULL, TRUE);
SELECT setval('responsible_id_seq', 1);

-- ------------------------------------------------------------
-- PATIENTS
-- ------------------------------------------------------------
INSERT INTO patient (id, full_name, cpf, rg, landline_phone, cell_phone, emergency_phone, email, birth_date, address_id, referral_source_id, active, responsible_id, plan_id, plan_started_at) VALUES
    (1, 'Maria da Silva',   '111.111.111-11', NULL, '(19) 3222-1111', '(19) 99222-1111', '(19) 99333-1111', 'maria.silva@example.com',   '1985-04-12', 2, 1, TRUE, NULL, 1, CURRENT_DATE - INTERVAL '60 days'),
    (2, 'João Souza',       '222.222.222-22', NULL, '(19) 3222-2222', '(19) 99222-2222', '(19) 99333-2222', 'joao.souza@example.com',    '1990-08-23', 3, 2, TRUE, NULL, NULL, NULL),
    (3, 'Ana Costa',        NULL, '33.222.111-3', '(19) 3222-3333', '(19) 99222-3333', '(19) 99333-3333', NULL,                        (CURRENT_DATE - INTERVAL '10 years')::date, 4, 3, TRUE, 1, NULL, NULL),
    (4, 'Carlos Pereira',   '444.444.444-44', NULL, '(19) 3222-4444', '(19) 99222-4444', '(19) 99333-4444', 'carlos.pereira@example.com','1978-01-30', 5, 1, TRUE, NULL, 2, CURRENT_DATE - INTERVAL '30 days'),
    (5, 'Beatriz Lima',     '555.555.555-55', NULL, '(19) 3222-5555', '(19) 99222-5555', '(19) 99333-5555', 'beatriz.lima@example.com',  '1995-11-05', 6, 4, TRUE, NULL, NULL, NULL);
SELECT setval('patient_id_seq', 5);

-- ------------------------------------------------------------
-- APPOINTMENTS — cobrindo todos os status da máquina de estados
-- (time_range é coluna GERADA — nunca inserir manualmente)
-- ------------------------------------------------------------
INSERT INTO appointment (id, patient_id, dentist_id, receptionist_id, appointment_type_id, scheduled_date_time, estimated_duration_min, status, scheduling_observations, price, cancellation_reason_id, cancellation_notes, actual_start_date_time, actual_end_date_time, main_complaint, diagnosis, treatment_plan, clinical_notes, next_recommended_appointment) VALUES
    -- 1) scheduled — futuro, dentist 1 (Eduardo)
    (1, 1, 1, 2, 1, (CURRENT_DATE + INTERVAL '3 days' + TIME '10:00')::timestamptz, 30, 'scheduled',
        NULL, 150.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),

    -- 2) confirmed — futuro, dentist 1, paciente com ansiedade relatada
    (2, 2, 1, 2, 2, (CURRENT_DATE + INTERVAL '1 day' + TIME '14:00')::timestamptz, 30, 'confirmed',
        'Paciente tem ansiedade', 150.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),

    -- 3) checked_in — hoje de manhã, dentist 2 (Fernanda), paciente menor
    (3, 3, 2, 2, 1, (CURRENT_DATE + TIME '08:30')::timestamptz, 30, 'checked_in',
        NULL, 180.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),

    -- 4) in_progress — hoje, dentist 1, já chamado pelo dentista
    (4, 4, 1, 3, 3, (CURRENT_DATE + TIME '09:00')::timestamptz, 45, 'in_progress',
        NULL, 150.00, NULL, NULL, (CURRENT_DATE + TIME '09:05')::timestamptz, NULL, 'Dor ao mastigar do lado direito', NULL, NULL, NULL, NULL),

    -- 5) completed — ontem, dentist 2, com todos os dados pós-consulta preenchidos
    (5, 5, 2, 2, 1, (CURRENT_DATE - INTERVAL '1 day' + TIME '15:00')::timestamptz, 60, 'completed',
        NULL, 180.00, NULL, NULL,
        (CURRENT_DATE - INTERVAL '1 day' + TIME '15:05')::timestamptz,
        (CURRENT_DATE - INTERVAL '1 day' + TIME '16:00')::timestamptz,
        'Sensibilidade a frio no lado esquerdo', 'Cárie profunda no dente 36', 'Restauração seguida de acompanhamento em 6 meses',
        'Paciente colaborativa, sem intercorrências durante o procedimento', (CURRENT_DATE + INTERVAL '180 days')::date),

    -- 6) cancelled — futuro, dentist 2, cancelada pela recepção
    (6, 1, 2, 3, 1, (CURRENT_DATE + INTERVAL '5 days' + TIME '10:00')::timestamptz, 30, 'cancelled',
        NULL, 180.00, 1, 'Paciente ligou pedindo para remarcar', NULL, NULL, NULL, NULL, NULL, NULL, NULL),

    -- 7) no_show — passado, dentist 1, paciente não compareceu
    (7, 2, 1, 2, 1, (CURRENT_DATE - INTERVAL '2 days' + TIME '11:00')::timestamptz, 30, 'no_show',
        NULL, 150.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
SELECT setval('appointment_id_seq', 7);

-- ------------------------------------------------------------
-- APPOINTMENT PROCEDURES (para a consulta completed, id 5)
-- ------------------------------------------------------------
INSERT INTO appointment_procedure (id, appointment_id, procedure_id, unit_price, discount, final_price, observation) VALUES
    (1, 5, 1, 150.00, 0,  150.00, NULL),
    (2, 5, 4, 180.00, 10, 170.00, 'Restauração em resina composta, dente 36');
SELECT setval('appointment_procedure_id_seq', 2);

INSERT INTO appointment_procedure_tooth (appointment_procedure_id, tooth_fdi) VALUES
    (2, 36);

-- ------------------------------------------------------------
-- ANAMNESIS (registro estruturado — coexiste com o anexo de arquivo)
-- ------------------------------------------------------------
INSERT INTO anamnesis (id, patient_id, dentist_id, record_date, allergies, current_medications, preexisting_conditions, observations) VALUES
    (1, 5, 2, (CURRENT_DATE - INTERVAL '1 day' + TIME '16:00')::timestamptz,
        'Alergia a penicilina', 'Nenhum', 'Hipertensão controlada', 'Paciente relata sensibilidade a frio há 2 semanas');
SELECT setval('anamnesis_id_seq', 1);

-- ------------------------------------------------------------
-- ATTACHMENTS
-- ------------------------------------------------------------
INSERT INTO attachment (id, patient_id, appointment_id, description, file_url, type, sent_at) VALUES
    (1, 5, 5, 'Ficha de anamnese assinada', 'https://storage.example.com/seed/anamnese-patient-5-appt-5.pdf', 3, (CURRENT_DATE - INTERVAL '1 day' + TIME '16:05')::timestamptz),
    (2, 1, NULL, 'Raio-x panorâmico', 'https://storage.example.com/seed/raiox-patient-1.jpg', 1, CURRENT_DATE - INTERVAL '20 days');
SELECT setval('attachment_id_seq', 2);

-- ------------------------------------------------------------
-- BILLING / INSTALLMENTS
-- Billing 1: gerado pela consulta completed (id 5), já quitado
-- Billing 2: avulso (boleto a vulso), sem consulta vinculada, parcelado 2x
-- OBS: installment.intended_payment_method admite NULL (cobrança sem
-- combinado estruturado — ver V1)
-- ------------------------------------------------------------
INSERT INTO billing (id, appointment_id, patient_id, cost_center_id, total_amount, discount, created_at) VALUES
    (1, 5,    5, 1, 320.00, 0, (CURRENT_DATE - INTERVAL '1 day' + TIME '16:10')::timestamptz),
    (2, NULL, 1, 1, 600.00, 0, CURRENT_DATE - INTERVAL '10 days');
SELECT setval('billing_id_seq', 2);

INSERT INTO installment (id, billing_id, amount, paid_amount, due_date, payment_date, intended_payment_method) VALUES
    (1, 1, 320.00, 320.00, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day', 1),
    (2, 2, 300.00, 0,      CURRENT_DATE - INTERVAL '5 days', NULL, 4),
    (3, 2, 300.00, 0,      CURRENT_DATE + INTERVAL '25 days', NULL, 4);
SELECT setval('installment_id_seq', 3);

-- ------------------------------------------------------------
-- BOLETOS
-- OBS: boleto_status não tem valor "overdue" — "vencido" é um estado
-- computado (status='registered' AND due_date < CURRENT_DATE AND paid_at
-- IS NULL), não uma coluna própria. Ver nota ao final do arquivo.
-- boleto 1: já vencido (due_date passado), ainda "registered" no banco
-- boleto 2: futuro, recém emitido
-- ------------------------------------------------------------
INSERT INTO boleto (id, installment_id, due_date, amount, issued_at, our_number, bar_code, digitable_line, registered_at, status) VALUES
    (1, 2, CURRENT_DATE - INTERVAL '5 days', 300.00, CURRENT_DATE - INTERVAL '10 days', '00000001', '74891234500000300002123456789012345678901234', '74891.23450 00003.000212 34567.890123 4 12340000030000', CURRENT_DATE - INTERVAL '9 days', 'registered'),
    (2, 3, CURRENT_DATE + INTERVAL '25 days', 300.00, CURRENT_DATE - INTERVAL '2 days', '00000002', NULL, NULL, NULL, 'issued');
SELECT setval('boleto_id_seq', 2);

-- ------------------------------------------------------------
-- PAYMENTS
-- payment 1: recebimento da consulta completed (installment 1), por Bruna
-- payment 2: pagamento de despesa (Administrativo), apenas Gerente pode
-- OBS: o crédito do orçamento (type=credit) é semeado na seção QUOTES,
-- mais abaixo — quote 1 ainda não existe neste ponto do arquivo
-- ------------------------------------------------------------
INSERT INTO expense (id, cost_center_id, description, observation, amount, issued_on, due_date, payment_date, active, created_by, created_at) VALUES
    (1, 2, 'Anúncio Instagram', NULL, 250.00, CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '10 days', NULL, TRUE, 1, CURRENT_DATE - INTERVAL '3 days'),
    (2, 3, 'Material de escritório', NULL, 120.00, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE - INTERVAL '3 days', TRUE, 1, CURRENT_DATE - INTERVAL '4 days');
SELECT setval('expense_id_seq', 2);

INSERT INTO payment (id, user_id, type, notes, amount, payment_method, date_time, refund_ref_id, patient_id, quote_id) VALUES
    (1, 2, 'income',  'Pagamento da consulta de limpeza + restauração', 320.00, 1, CURRENT_DATE - INTERVAL '1 day', NULL, NULL, NULL),
    (2, 1, 'expense', 'Compra de material de escritório',               120.00, 3, CURRENT_DATE - INTERVAL '3 days', NULL, NULL, NULL);
SELECT setval('payment_id_seq', 2);

INSERT INTO payment_installment (payment_id, installment_id, amount_applied) VALUES
    (1, 1, 320.00);

INSERT INTO payment_expense (payment_id, expense_id, amount_applied) VALUES
    (2, 2, 120.00);

-- ------------------------------------------------------------
-- QUOTES
-- Orçamento 1: enviado, com combinado de pagamento (entrada R$ 205 +
-- saldo em 3x no Cartão de Crédito, payment_method id 2). planned_*
-- guardam a expectativa combinada com o paciente — a cobrança real
-- (billing) só nasce na finalização da consulta
-- ------------------------------------------------------------
INSERT INTO quote (id, patient_id, created_by, description, status, discount, discount_type, total_amount, valid_until, notes, payment_notes,
                   planned_payment_method, planned_installments, entrance_amount) VALUES
    (1, 4, 4, 'Orçamento: clareamento + tratamento de canal', 'sent', 0, 'percent', 1205.00, CURRENT_DATE + INTERVAL '30 days', 'Inclui avaliação inicial', NULL,
     2, 3, 205.00);
SELECT setval('quote_id_seq', 1);

-- payment 3: crédito do paciente (type=credit) — entrada de R$ 205 combinada
-- no orçamento 1, paga na aprovação e ainda NÃO alocada a parcela alguma
-- (a billing da consulta ainda não existe); será alocada automaticamente
-- à 1ª parcela quando a billing nascer (Opção B / unearned — ver V1).
-- Semeado aqui (e não na seção PAYMENTS) porque quote 1 ainda não existia
-- naquele ponto do arquivo.
INSERT INTO payment (id, user_id, type, notes, amount, payment_method, date_time, refund_ref_id, patient_id, quote_id) VALUES
    (3, 2, 'credit', 'Entrada do orçamento 1 (clareamento + canal) — aguardando alocação', 205.00, 2, CURRENT_DATE - INTERVAL '2 days', NULL, 4, 1);
SELECT setval('payment_id_seq', 3);

INSERT INTO quote_procedure (id, quote_id, procedure_id, unit_price, discount, discount_type, quantity, final_price, notes) VALUES
    (1, 1, 5, 450.00, 10, 'percent', 1, 405.00, NULL),
    (2, 1, 3, 800.00, 0,  'percent', 1, 800.00, NULL);
SELECT setval('quote_procedure_id_seq', 2);

-- ------------------------------------------------------------
-- AUDIT LOG (amostra — na aplicação real todo insert acima geraria
-- automaticamente um registro; aqui inserimos alguns manualmente
-- só para popular a tela de auditoria)
-- ------------------------------------------------------------
INSERT INTO audit_log (id, user_id, table_name, record_id, action, previous_data, new_data, occurred_at) VALUES
    (1, 1, 'patient',     1, 'create', NULL,
        '{"fullName":"Maria da Silva","cpf":"111.111.111-11"}'::jsonb,
        CURRENT_DATE - INTERVAL '60 days'),
    (2, 3, 'appointment', 6, 'update',
        '{"status":"scheduled"}'::jsonb,
        '{"status":"cancelled","cancellationReasonId":1}'::jsonb,
        CURRENT_DATE - INTERVAL '1 day'),
    (3, 6, 'appointment', 7, 'update',
        '{"status":"confirmed"}'::jsonb,
        '{"status":"no_show"}'::jsonb,
        CURRENT_DATE - INTERVAL '2 days' + TIME '11:05');
SELECT setval('audit_log_id_seq', 3);

-- ============================================================
-- NOTAS IMPORTANTES — decisões que precisam de confirmação
-- ============================================================
-- 1) "sistema" (users.id=6): user_profile não tem valor dedicado para
--    ações automáticas (job de no_show, futuro webhook de boleto).
--    Reaproveitei o profile 'manager' com active=FALSE (impede login,
--    mas mantém FK válida para user_id em audit_log/appointment). Se
--    preferir um profile "system" de verdade, precisa de uma migration
--    alterando o enum user_profile — combinem isso antes de ir pra prod.
--
-- 2) boleto_status não tem valor "overdue"/"vencido" — a máquina de
--    estados documentada em maquinas-de-estado.md trata Vencido como
--    estado próprio, mas o schema atual computa isso implicitamente
--    (status='registered' AND due_date < CURRENT_DATE AND paid_at IS NULL).
--    O boleto id=1 acima demonstra esse caso. Se a aplicação/frontend
--    precisar expor "vencido" como valor literal de status (ex. no filtro
--    da API), essa é uma decisão pendente: computar sempre em query/view,
--    ou adicionar 'overdue' ao enum e um job que faz a transição.
-- ============================================================
