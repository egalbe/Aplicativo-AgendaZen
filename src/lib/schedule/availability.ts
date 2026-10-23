import { createAdminClient } from "@/lib/supabase/admin";
import { format, parse, addMinutes, isBefore, isAfter, startOfDay, endOfDay } from "date-fns";

export interface AvailableSlot {
  time: string; // "08:00"
  status: "free" | "reserved" | "blocked";
  available: boolean;
}

export async function getAvailableSlotsForDate(
  clinicId: string,
  professionalId: string,
  dateStr: string, // YYYY-MM-DD
  durationMin: number = 50
): Promise<AvailableSlot[]> {
  const supabase = createAdminClient();

  // 1. Obter o dia da semana (0=Domingo, 1=Segunda, ..., 6=Sábado)
  const targetDate = parse(dateStr, "yyyy-MM-dd", new Date());
  const weekday = targetDate.getDay();

  // 2. Buscar a regra de horário de trabalho do profissional para este dia da semana
  const { data: rules } = await supabase
    .from("schedule_rules")
    .select("*, schedule_breaks(*)")
    .eq("clinic_id", clinicId)
    .eq("professional_id", professionalId)
    .eq("weekday", weekday)
    .eq("active", true);

  if (!rules || rules.length === 0) {
    return []; // Profissional não atende neste dia
  }

  const rule = rules[0];
  const slotMinutes = rule.slot_minutes || durationMin || 50;

  // 3. Buscar agendamentos já existentes neste dia para este profissional
  const dayStartIso = `${dateStr}T00:00:00Z`;
  const dayEndIso = `${dateStr}T23:59:59Z`;

  const { data: appointments } = await supabase
    .from("appointments")
    .select("period, status")
    .eq("clinic_id", clinicId)
    .eq("professional_id", professionalId)
    .not("status", "in", '("cancelled","rescheduled")');

  // 4. Buscar bloqueios pontuais (ex: férias, licença, consulta médica)
  const { data: blocks } = await supabase
    .from("schedule_blocks")
    .select("period")
    .eq("clinic_id", clinicId)
    .or(`professional_id.eq.${professionalId},professional_id.is.null`);

  // 5. Buscar overrides de slots (exceções manuais do dia)
  const { data: overrides } = await supabase
    .from("slot_overrides")
    .select("starts_at, status")
    .eq("clinic_id", clinicId)
    .eq("professional_id", professionalId);

  // 6. Gerar os slots entre start_time e end_time
  const slots: AvailableSlot[] = [];
  const [startHour, startMin] = rule.start_time.split(":").map(Number);
  const [endHour, endMin] = rule.end_time.split(":").map(Number);

  let currentSlotDate = new Date(targetDate);
  currentSlotDate.setHours(startHour, startMin, 0, 0);

  const workEndDate = new Date(targetDate);
  workEndDate.setHours(endHour, endMin, 0, 0);

  // Não permitir agendar no passado
  const now = new Date();

  while (isBefore(currentSlotDate, workEndDate)) {
    const nextSlotDate = addMinutes(currentSlotDate, slotMinutes);
    if (isAfter(nextSlotDate, workEndDate)) {
      break;
    }

    const timeString = format(currentSlotDate, "HH:mm");
    let slotStatus: "free" | "reserved" | "blocked" = rule.default_status || "free";
    let isOccupied = false;

    // A. Checar intervalos/pausas (ex: almoço)
    if (rule.schedule_breaks && rule.schedule_breaks.length > 0) {
      for (const brk of rule.schedule_breaks) {
        const [bStartH, bStartM] = brk.start_time.split(":").map(Number);
        const [bEndH, bEndM] = brk.end_time.split(":").map(Number);
        const breakStart = new Date(targetDate);
        breakStart.setHours(bStartH, bStartM, 0, 0);
        const breakEnd = new Date(targetDate);
        breakEnd.setHours(bEndH, bEndM, 0, 0);

        if (
          (isAfter(currentSlotDate, breakStart) || currentSlotDate.getTime() === breakStart.getTime()) &&
          isBefore(currentSlotDate, breakEnd)
        ) {
          isOccupied = true;
          slotStatus = "blocked";
          break;
        }
      }
    }

    // B. Checar conflito com agendamentos existentes
    if (!isOccupied && appointments) {
      for (const appt of appointments) {
        if (!appt.period) continue;
        // O formato PostgreSQL tstzrange é ex: [2026-10-23 10:00:00+00, 2026-10-23 10:50:00+00)
        // Fazemos verificação simples por string ou timestamp
        const rawPeriod = String(appt.period);
        const match = rawPeriod.match(/["']?([^,"'\[\()]+)["']?,\s*["']?([^,"'\]\)]+)["']?/);
        if (match) {
          const apptStart = new Date(match[1]);
          const apptEnd = new Date(match[2]);

          if (
            (currentSlotDate >= apptStart && currentSlotDate < apptEnd) ||
            (nextSlotDate > apptStart && nextSlotDate <= apptEnd) ||
            (currentSlotDate <= apptStart && nextSlotDate >= apptEnd)
          ) {
            isOccupied = true;
            slotStatus = "reserved";
            break;
          }
        }
      }
    }

    // C. Checar se já passou do horário atual (se for hoje)
    if (isBefore(currentSlotDate, now)) {
      isOccupied = true;
      slotStatus = "blocked";
    }

    // D. Checar overrides manuais para este horário exato
    if (overrides) {
      for (const ov of overrides) {
        const ovDate = new Date(ov.starts_at);
        if (
          ovDate.getFullYear() === currentSlotDate.getFullYear() &&
          ovDate.getMonth() === currentSlotDate.getMonth() &&
          ovDate.getDate() === currentSlotDate.getDate() &&
          ovDate.getHours() === currentSlotDate.getHours() &&
          ovDate.getMinutes() === currentSlotDate.getMinutes()
        ) {
          slotStatus = ov.status;
          if (slotStatus === "free") {
            isOccupied = false;
          } else {
            isOccupied = true;
          }
          break;
        }
      }
    }

    // Somente horários que possuem o status 'free' na regra da clínica
    // podem ser agendados pelo paciente publicamente via QR Code
    // Horários com status 'reserved' são guardados pela clínica para encaixes internos
    const isAvailableForPublic = !isOccupied && slotStatus === "free";

    slots.push({
      time: timeString,
      status: slotStatus,
      available: isAvailableForPublic,
    });

    currentSlotDate = nextSlotDate;
  }

  return slots;
}
