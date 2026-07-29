import { useState } from "react";
import {
  Clock,
  Coffee,
  Plus,
  History,
  ChevronDown,
  ChevronUp,
  Trash2,
  X,
  Info,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* eslint-disable @typescript-eslint/no-unused-vars */

interface DaySchedule {
  shortLabel: string;
  fullLabel: string;
  active: boolean;
  startTime: string;
  endTime: string;
  startBreak: string;
  endBreak: string;
}

interface ScheduleException {
  id: number;
  date: string;
  isDayOff: boolean;
  startTime: string | null;
  endTime: string | null;
  reason: string;
}

interface ScheduleHistoryItem {
  id: number;
  validFrom: string;
  validTo: string;
  summary: string;
  details: DaySchedule[];
}

const DAYS_OF_WEEK: DaySchedule[] = [
  { shortLabel: "Seg", fullLabel: "Segunda-feira", active: true, startTime: "08:00", endTime: "18:00", startBreak: "12:00", endBreak: "13:00" },
  { shortLabel: "Ter", fullLabel: "Terça-feira", active: true, startTime: "08:00", endTime: "18:00", startBreak: "12:00", endBreak: "13:00" },
  { shortLabel: "Qua", fullLabel: "Quarta-feira", active: true, startTime: "08:00", endTime: "18:00", startBreak: "12:00", endBreak: "13:00" },
  { shortLabel: "Qui", fullLabel: "Quinta-feira", active: true, startTime: "08:00", endTime: "18:00", startBreak: "12:00", endBreak: "13:00" },
  { shortLabel: "Sex", fullLabel: "Sexta-feira", active: true, startTime: "08:00", endTime: "17:00", startBreak: "12:00", endBreak: "13:00" },
  { shortLabel: "Sáb", fullLabel: "Sábado", active: false, startTime: "", endTime: "", startBreak: "", endBreak: "" },
  { shortLabel: "Dom", fullLabel: "Domingo", active: false, startTime: "", endTime: "", startBreak: "", endBreak: "" },
];

const MOCK_EXCEPTIONS: ScheduleException[] = [
  { id: 1, date: "23/05/2025", isDayOff: true, startTime: null, endTime: null, reason: "Feriado municipal" },
  { id: 2, date: "10/06/2025", isDayOff: false, startTime: "09:00", endTime: "14:00", reason: "Congresso odonto" },
  { id: 3, date: "28/06/2025", isDayOff: false, startTime: "08:00", endTime: "13:00", reason: "Saída antecipada" },
];

const MOCK_HISTORY: ScheduleHistoryItem[] = [
  {
    id: 1,
    validFrom: "01/09/2024",
    validTo: "28/02/2025",
    summary: "Seg a Sex · 07:30 – 17:30",
    details: [
      { shortLabel: "Seg–Sex", fullLabel: "Segunda a Sexta", active: true, startTime: "07:30", endTime: "17:30", startBreak: "12:00", endBreak: "13:00" },
      { shortLabel: "Sáb–Dom", fullLabel: "Sábado e Domingo", active: false, startTime: "", endTime: "", startBreak: "", endBreak: "" },
    ],
  },
  {
    id: 2,
    validFrom: "15/01/2024",
    validTo: "31/08/2024",
    summary: "Seg, Qua, Sex · 08:00 – 18:00",
    details: [
      { shortLabel: "Seg, Qua, Sex", fullLabel: "Segunda, Quarta, Sexta", active: true, startTime: "08:00", endTime: "18:00", startBreak: "12:00", endBreak: "13:00" },
      { shortLabel: "Ter, Qui, Sáb, Dom", fullLabel: "Terça, Quinta, Sábado, Domingo", active: false, startTime: "", endTime: "", startBreak: "", endBreak: "" },
    ],
  },
];

interface HorariosTabProps {
  dentistId: number;
}

export function HorariosTab({ dentistId: _dentistId }: HorariosTabProps) {
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);
  const [exceptions, setExceptions] = useState<ScheduleException[]>(MOCK_EXCEPTIONS);

  // Schedule modal state
  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleDays, setScheduleDays] = useState<DaySchedule[]>(DAYS_OF_WEEK);
  const [startDate, setStartDate] = useState("");

  // Exception modal state
  const [isExceptionModalOpen, setExceptionModalOpen] = useState(false);
  const [editingException, setEditingException] = useState<ScheduleException | null>(null);
  const [excDate, setExcDate] = useState("");
  const [excIsDayOff, setExcIsDayOff] = useState(false);
  const [excStartTime, setExcStartTime] = useState("");
  const [excEndTime, setExcEndTime] = useState("");
  const [excReason, setExcReason] = useState("");

  function openScheduleModal() {
    setScheduleDays(DAYS_OF_WEEK.map((d) => ({ ...d })));
    setStartDate("");
    setScheduleModalOpen(true);
  }

  function handleSaveSchedule() {
    // TODO: integrar com PUT /dentists/{id}/schedule
    setScheduleModalOpen(false);
  }

  function toggleDayActive(index: number) {
    setScheduleDays((prev) =>
      prev.map((d, i) => (i === index ? { ...d, active: !d.active } : d)),
    );
  }

  function updateDayTime(index: number, field: keyof DaySchedule, value: string) {
    setScheduleDays((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
    );
  }

  function openExceptionModal(exc?: ScheduleException) {
    if (exc) {
      setEditingException(exc);
      setExcDate(exc.date);
      setExcIsDayOff(exc.isDayOff);
      setExcStartTime(exc.startTime ?? "");
      setExcEndTime(exc.endTime ?? "");
      setExcReason(exc.reason);
    } else {
      setEditingException(null);
      setExcDate("");
      setExcIsDayOff(false);
      setExcStartTime("");
      setExcEndTime("");
      setExcReason("");
    }
    setExceptionModalOpen(true);
  }

  function handleSaveException() {
    if (editingException) {
      setExceptions((prev) =>
        prev.map((e) =>
          e.id === editingException.id
            ? {
                ...e,
                date: excDate,
                isDayOff: excIsDayOff,
                startTime: excIsDayOff ? null : excStartTime || null,
                endTime: excIsDayOff ? null : excEndTime || null,
                reason: excReason,
              }
            : e,
        ),
      );
    } else {
      const newId = Math.max(0, ...exceptions.map((e) => e.id)) + 1;
      setExceptions((prev) => [
        ...prev,
        {
          id: newId,
          date: excDate,
          isDayOff: excIsDayOff,
          startTime: excIsDayOff ? null : excStartTime || null,
          endTime: excIsDayOff ? null : excEndTime || null,
          reason: excReason,
        },
      ]);
    }
    setExceptionModalOpen(false);
  }

  function handleDeleteException(id: number) {
    setExceptions((prev) => prev.filter((e) => e.id !== id));
  }

  function formatTimeInput(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  }

  const currentSchedule = DAYS_OF_WEEK;

  return (
    <div className="flex flex-col gap-4 px-9 py-7">
      {/* Card 1 — Horário de Trabalho */}
      <Card>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
              Horário de Trabalho
            </p>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              desde 01/03/2025
            </span>
          </div>
          <Button type="button" size="sm" className="gap-1.5" onClick={openScheduleModal}>
            <Clock className="h-3.5 w-3.5" />
            Editar
          </Button>
        </div>
        <div className="divide-y divide-border/50 p-5">
          {currentSchedule.map((day) => (
            <div
              key={day.shortLabel}
              className={`flex items-center gap-4 py-2.5 ${!day.active ? "opacity-40" : ""}`}
            >
              <span className="w-10 text-[13px] font-semibold text-foreground">
                {day.shortLabel}
              </span>
              {day.active ? (
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-[12px] font-medium text-foreground">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {day.startTime} – {day.endTime}
                  </span>
                  {day.startBreak && day.endBreak && (
                    <>
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Coffee className="h-3 w-3" />
                        Intervalo
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-[12px] font-medium text-muted-foreground">
                        {day.startBreak} – {day.endBreak}
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 text-[12px] text-muted-foreground">
                  <X className="h-3 w-3" />
                  Folga
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Card 2 — Alterações na Agenda */}
      <Card>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
            Alterações na Agenda
          </p>
          <Button type="button" size="sm" className="gap-1.5" onClick={() => openExceptionModal()}>
            <Plus className="h-3.5 w-3.5" />
            Nova exceção
          </Button>
        </div>
        <div className="p-5">
          {/* Exceções */}
          <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.06em] text-primary/70">
            Exceções
          </p>

          {exceptions.length === 0 ? (
            <p className="mb-6 text-sm text-muted-foreground">
              Nenhuma exceção cadastrada.
            </p>
          ) : (
            <div className="mb-6 overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left text-[12.5px]">
                <thead>
                  <tr className="bg-muted text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">Data</th>
                    <th className="px-4 py-2.5 font-medium">Situação</th>
                    <th className="px-4 py-2.5 font-medium">Horário</th>
                    <th className="px-4 py-2.5 font-medium">Motivo</th>
                    <th className="w-10 px-4 py-2.5 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {exceptions.map((exc) => (
                    <tr key={exc.id} className="group hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="font-semibold text-foreground underline decoration-transparent transition-colors hover:decoration-foreground/30"
                          onClick={() => openExceptionModal(exc)}
                        >
                          {exc.date}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        {exc.isDayOff ? (
                          <Badge variant="error">
                            <X className="h-2.5 w-2.5" />
                            Folga
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            <Clock className="h-2.5 w-2.5" />
                            Horário diferente
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {exc.isDayOff ? (
                          <span className="text-muted-foreground/60">—</span>
                        ) : (
                          `${exc.startTime} – ${exc.endTime}`
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {exc.reason}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="text-muted-foreground/50 transition-colors hover:text-destructive"
                          aria-label="Remover exceção"
                          onClick={() => handleDeleteException(exc.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Histórico */}
          <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.06em] text-primary/70">
            Histórico de alterações
          </p>

          {MOCK_HISTORY.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma alteração registrada.
            </p>
          ) : (
            <div className="space-y-2">
              {MOCK_HISTORY.map((item) => {
                const isOpen = expandedHistoryId === item.id;
                return (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-lg border border-border"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedHistoryId(isOpen ? null : item.id)
                      }
                      className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-2.5">
                        <History className="h-4 w-4 text-muted-foreground" />
                        <span className="text-[12px] font-semibold text-foreground">
                          {item.validFrom} – {item.validTo}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {item.summary}
                        </span>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="border-t border-border px-4 py-3">
                        {item.details.map((d) => (
                          <div
                            key={d.shortLabel}
                            className={`flex items-center gap-4 py-1.5 ${!d.active ? "opacity-40" : ""}`}
                          >
                            <span className="w-24 text-[11px] font-semibold text-foreground">
                              {d.shortLabel}
                            </span>
                            {d.active ? (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                                  <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                                  {d.startTime} – {d.endTime}
                                </span>
                                {d.startBreak && d.endBreak && (
                                  <>
                                    <span className="text-[10px] text-muted-foreground">
                                      Intervalo
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                      {d.startBreak} – {d.endBreak}
                                    </span>
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                <X className="h-2.5 w-2.5" />
                                Não atendia
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Dialog — Atualizar Horário Padrão */}
      <Dialog open={isScheduleModalOpen} onOpenChange={setScheduleModalOpen}>
        <DialogContent className="max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Atualizar horário padrão</DialogTitle>
            <DialogDescription>
              O horário atual será encerrado e um novo período será criado
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-2 rounded-md bg-muted p-3 text-[11px] text-muted-foreground">
            <Info className="h-4 w-4 flex-shrink-0 text-primary" />
            <span>
              O histórico anterior será preservado. O novo horário entra em vigor a partir da data de início informada.
            </span>
          </div>

          <div className="mb-4 mt-4">
            <Label htmlFor="schedule-start-date">
              Data de início do novo horário <span className="text-destructive">*</span>
            </Label>
            <Input
              id="schedule-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1"
            />
          </div>

          <p className="mb-3 border-b border-border pb-2 text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
            Dias e horários
          </p>

          <div className="space-y-1">
            {scheduleDays.map((day, index) => (
              <div
                key={day.fullLabel}
                className="grid grid-cols-[110px_34px_1fr] items-center gap-2 border-b border-border/50 py-2 last:border-b-0"
              >
                <span
                  className={`text-[12px] font-semibold ${
                    day.active ? "text-foreground" : "text-muted-foreground/60"
                  }`}
                >
                  {day.fullLabel}
                </span>

                <button
                  type="button"
                  role="switch"
                  aria-checked={day.active}
                  onClick={() => toggleDayActive(index)}
                  className={`relative h-[18px] w-[34px] flex-shrink-0 rounded-full transition-colors ${
                    day.active ? "bg-primary" : "bg-border"
                  }`}
                >
                  <span
                    className={`absolute left-[3px] top-[3px] h-[12px] w-[12px] rounded-full bg-white transition-all ${
                      day.active ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>

                {day.active ? (
                  <div className="grid grid-cols-4 gap-1.5">
                    <div>
                      <span className="mb-0.5 block text-[10px] text-muted-foreground">Início</span>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={day.startTime}
                        onChange={(e) => updateDayTime(index, "startTime", formatTimeInput(e.target.value))}
                        className="h-6 px-1.5 text-[11px]"
                        placeholder="--:--"
                      />
                    </div>
                    <div>
                      <span className="mb-0.5 block text-[10px] text-muted-foreground">Término</span>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={day.endTime}
                        onChange={(e) => updateDayTime(index, "endTime", formatTimeInput(e.target.value))}
                        className="h-6 px-1.5 text-[11px]"
                        placeholder="--:--"
                      />
                    </div>
                    <div>
                      <span className="mb-0.5 block text-[10px] text-muted-foreground">Início intervalo</span>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={day.startBreak}
                        onChange={(e) => updateDayTime(index, "startBreak", formatTimeInput(e.target.value))}
                        className="h-6 px-1.5 text-[11px]"
                        placeholder="--:--"
                      />
                    </div>
                    <div>
                      <span className="mb-0.5 block text-[10px] text-muted-foreground">Fim intervalo</span>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={day.endBreak}
                        onChange={(e) => updateDayTime(index, "endBreak", formatTimeInput(e.target.value))}
                        className="h-6 px-1.5 text-[11px]"
                        placeholder="--:--"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-[11px] italic text-muted-foreground/60">Não atende</span>
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setScheduleModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSaveSchedule}>
              Salvar novo horário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog — Nova Exceção / Editar Exceção */}
      <Dialog open={isExceptionModalOpen} onOpenChange={setExceptionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingException ? "Editar exceção" : "Nova exceção"}
            </DialogTitle>
            <DialogDescription>
              {editingException
                ? "Altere os dados da exceção de agenda."
                : "Registre uma alteração pontual na agenda do dentista."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="exc-date">
                Data <span className="text-destructive">*</span>
              </Label>
              <Input
                id="exc-date"
                type="date"
                value={excDate}
                onChange={(e) => setExcDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={excIsDayOff}
                onClick={() => setExcIsDayOff(!excIsDayOff)}
                className={`relative h-[18px] w-[34px] flex-shrink-0 rounded-full transition-colors ${
                  excIsDayOff ? "bg-destructive" : "bg-border"
                }`}
              >
                <span
                  className={`absolute left-[3px] top-[3px] h-[12px] w-[12px] rounded-full bg-white transition-all ${
                    excIsDayOff ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
              <Label className="cursor-pointer text-sm font-medium" onClick={() => setExcIsDayOff(!excIsDayOff)}>
                Dia de folga (não atende)
              </Label>
            </div>

            {!excIsDayOff && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="exc-start">Horário início</Label>
                  <Input
                    id="exc-start"
                    type="text"
                    inputMode="numeric"
                    value={excStartTime}
                    onChange={(e) => setExcStartTime(formatTimeInput(e.target.value))}
                    className="mt-1"
                    placeholder="--:--"
                  />
                </div>
                <div>
                  <Label htmlFor="exc-end">Horário término</Label>
                  <Input
                    id="exc-end"
                    type="text"
                    inputMode="numeric"
                    value={excEndTime}
                    onChange={(e) => setExcEndTime(formatTimeInput(e.target.value))}
                    className="mt-1"
                    placeholder="--:--"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="exc-reason">Motivo</Label>
              <Input
                id="exc-reason"
                type="text"
                value={excReason}
                onChange={(e) => setExcReason(e.target.value)}
                className="mt-1"
                placeholder="Ex: Feriado municipal, Congresso, etc."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setExceptionModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSaveException}>
              {editingException ? "Salvar alterações" : "Criar exceção"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
