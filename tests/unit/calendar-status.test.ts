import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  daysUntil,
  formatCountdownText,
  getDeadlineStatus,
  getDeadlineStatusLabel,
} from "../../src/lib/calendar/status";

const TODAY = new Date(2026, 2, 10);

describe("calendar/status", () => {
  it("daysUntil retorna 0 para el mismo día", () => {
    assert.equal(daysUntil("2026-03-10", TODAY), 0);
  });

  it("daysUntil retorna positivo para fecha futura", () => {
    assert.equal(daysUntil("2026-03-15", TODAY), 5);
  });

  it("daysUntil retorna negativo para fecha pasada", () => {
    assert.equal(daysUntil("2026-03-01", TODAY), -9);
  });

  it("clasifica estado vencido", () => {
    assert.equal(getDeadlineStatus("2026-03-09", TODAY), "vencido");
  });

  it("clasifica estado próximo (<= 7 días)", () => {
    assert.equal(getDeadlineStatus("2026-03-17", TODAY), "proximo");
  });

  it("clasifica estado vigente (> 7 días)", () => {
    assert.equal(getDeadlineStatus("2026-03-20", TODAY), "vigente");
  });

  it("retorna etiquetas legibles por estado", () => {
    assert.equal(getDeadlineStatusLabel("vencido"), "Vencido");
    assert.equal(getDeadlineStatusLabel("proximo"), "Próximo");
    assert.equal(getDeadlineStatusLabel("vigente"), "Vigente");
  });

  it("formatea cuenta regresiva para pasado singular", () => {
    assert.equal(formatCountdownText("2026-03-09", TODAY), "Venció hace 1 día");
  });

  it("formatea cuenta regresiva para pasado plural", () => {
    assert.equal(formatCountdownText("2026-03-01", TODAY), "Venció hace 9 días");
  });

  it("formatea cuenta regresiva para hoy", () => {
    assert.equal(formatCountdownText("2026-03-10", TODAY), "Vence hoy");
  });

  it("formatea cuenta regresiva para mañana", () => {
    assert.equal(formatCountdownText("2026-03-11", TODAY), "Vence mañana");
  });

  it("formatea cuenta regresiva para varios días", () => {
    assert.equal(formatCountdownText("2026-03-15", TODAY), "Vence en 5 días");
  });
});
