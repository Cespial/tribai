/* ═══════════════════════════════════════════════════════════
   engine.test.ts — 200+ test cases Declaración de Renta
   Personas Jurídicas (Formulario 110 DIAN)
   Art. 240, 147, 254-259, TTD, Sobretasas, Ley 2277
   ═══════════════════════════════════════════════════════════ */

import {
  calcularDeclaracionJuridica,
  determinarTarifa,
} from "../engine";
import {
  type DeclaracionJuridicaState,
  INITIAL_STATE_JURIDICA,
  DEFAULT_PERFIL_JURIDICO,
  DEFAULT_DATOS_INFORMATIVOS,
  DEFAULT_PATRIMONIO_JURIDICO,
  DEFAULT_INGRESOS_JURIDICOS,
  DEFAULT_COSTOS_GASTOS,
  DEFAULT_COMPENSACION,
  DEFAULT_RENTAS_EXENTAS_JURIDICAS,
  DEFAULT_DESCUENTOS_JURIDICOS,
  DEFAULT_GO_JURIDICAS,
  DEFAULT_RETENCIONES_JURIDICO,
  DEFAULT_TTD_INPUTS,
} from "../types";

// ── Test infrastructure ──────────────────────────────────

const UVT_2025 = 49_799;
let passed = 0;
let failed = 0;
const failures: string[] = [];

function makeState(overrides: Partial<DeclaracionJuridicaState> = {}): DeclaracionJuridicaState {
  return { ...INITIAL_STATE_JURIDICA, ...overrides };
}

function assert(condition: boolean, name: string, detail?: string) {
  if (condition) {
    passed++;
  } else {
    failed++;
    const msg = detail ? `FAIL: ${name} — ${detail}` : `FAIL: ${name}`;
    failures.push(msg);
    console.error(msg);
  }
}

function assertApprox(actual: number, expected: number, tolerance: number, name: string) {
  const diff = Math.abs(actual - expected);
  assert(
    diff <= tolerance,
    name,
    `expected ≈${expected}, got ${actual} (diff=${diff}, tol=${tolerance})`
  );
}

// ══════════════════════════════════════════════════════════
// SECTION 1: INITIAL STATE (5 tests)
// ══════════════════════════════════════════════════════════

function testInitialState() {
  const r = calcularDeclaracionJuridica(INITIAL_STATE_JURIDICA);

  assert(r.patrimonio.patrimonioBruto === 0, "T001: initial patrimonio bruto = 0");
  assert(r.depuracion.rentaLiquidaGravable === 0, "T002: initial renta gravable = 0");
  assert(r.liquidacion.saldoPagar === 0, "T003: initial saldo a pagar = 0");
  assert(r.liquidacion.totalSaldoFavor === 0, "T004: initial saldo a favor = 0");
  assert(r.tasaEfectiva === 0, "T005: initial tasa efectiva = 0");
}

// ══════════════════════════════════════════════════════════
// SECTION 2: TARIFA DETERMINATION (25 tests)
// ══════════════════════════════════════════════════════════

function testTarifas() {
  // T006-T019: Each entity type
  assert(determinarTarifa("sociedad_nacional", 0, 0) === 0.35, "T006: sociedad_nacional = 35%");
  assert(determinarTarifa("entidad_financiera", 0, 0) === 0.35, "T007: financiera = 35% (sobretasa aparte)");
  assert(determinarTarifa("generador_hidroelectrico", 0, 0) === 0.35, "T008: hidro = 35% (sobretasa aparte)");
  assert(determinarTarifa("extractivo", 0, 0) === 0.35, "T009: extractivo = 35%");
  assert(determinarTarifa("zona_franca_comercial", 0, 0) === 0.35, "T010: ZF comercial = 35%");
  assert(determinarTarifa("zona_franca_pre2023", 0, 0) === 0.20, "T011: ZF pre-2023 = 20%");
  assert(determinarTarifa("hotelero", 0, 0) === 0.15, "T012: hotelero = 15%");
  assert(determinarTarifa("editorial", 0, 0) === 0.15, "T013: editorial = 15%");
  assert(determinarTarifa("mega_inversion", 0, 0) === 0.27, "T014: mega-inversión = 27%");
  assert(determinarTarifa("regimen_especial", 0, 0) === 0.20, "T015: régimen especial = 20%");

  // T016-T018: ZOMAC
  assert(determinarTarifa("zomac_micro_pequena", 0, 0) === 0.175, "T016: ZOMAC micro = 17.5%");
  assert(determinarTarifa("zomac_mediana_grande", 0, 0) === 0.2625, "T017: ZOMAC grande = 26.25%");

  // T018-T020: ZESE
  assert(determinarTarifa("zese", 0, 1) === 0, "T018: ZESE año 1 = 0%");
  assert(determinarTarifa("zese", 0, 5) === 0, "T019: ZESE año 5 = 0%");
  assert(determinarTarifa("zese", 0, 6) === 0.175, "T020: ZESE año 6 = 17.5%");
  assert(determinarTarifa("zese", 0, 10) === 0.175, "T021: ZESE año 10 = 17.5%");
  assert(determinarTarifa("zese", 0, 11) === 0.35, "T022: ZESE año 11 = 35%");

  // T023-T026: Zona franca mixta
  assertApprox(determinarTarifa("zona_franca_industrial", 1.0, 0), 0.20, 0.001, "T023: ZF 100% export = 20%");
  assertApprox(determinarTarifa("zona_franca_industrial", 0.0, 0), 0.35, 0.001, "T024: ZF 0% export = 35%");
  assertApprox(determinarTarifa("zona_franca_industrial", 0.5, 0), 0.275, 0.001, "T025: ZF 50% export = 27.5%");
  assertApprox(determinarTarifa("zona_franca_industrial", 0.4, 0), 0.29, 0.001, "T026: ZF 40% export = 29%");

  // T027-T030: Tarifa applied in full calculation
  let s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, tipoEntidad: "sociedad_nacional" },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
  });
  let r = calcularDeclaracionJuridica(s);
  assert(r.tarifaAplicada === 0.35, "T027: full calc tarifa = 35%");

  s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, tipoEntidad: "hotelero" },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.tarifaAplicada === 0.15, "T028: full calc hotelero = 15%");

  s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, tipoEntidad: "mega_inversion" },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 500_000_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.tarifaAplicada === 0.27, "T029: full calc mega = 27%");

  s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, tipoEntidad: "zese", anosZESE: 3 },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.tarifaAplicada === 0, "T030: ZESE year 3 → 0% tarifa");
}

// ══════════════════════════════════════════════════════════
// SECTION 3: PATRIMONIO ESF (15 tests)
// ══════════════════════════════════════════════════════════

function testPatrimonio() {
  // T031: Empty patrimonio
  let r = calcularDeclaracionJuridica(INITIAL_STATE_JURIDICA);
  assert(r.patrimonio.patrimonioBruto === 0, "T031: empty patrimonio = 0");
  assert(r.patrimonio.patrimonioLiquido === 0, "T032: empty patrimonio liquido = 0");

  // T033: All asset types
  let s = makeState({
    patrimonio: {
      efectivoEquivalentes: 100_000_000,
      inversionesFinancieras: 200_000_000,
      cuentasPorCobrar: 150_000_000,
      inventarios: 300_000_000,
      activosIntangibles: 50_000_000,
      activosBiologicos: 25_000_000,
      ppePlantaEquipo: 500_000_000,
      otrosActivos: 75_000_000,
      pasivos: 400_000_000,
    },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.patrimonio.patrimonioBruto === 1_400_000_000, "T033: all assets sum");
  assert(r.patrimonio.pasivos === 400_000_000, "T034: pasivos");
  assert(r.patrimonio.patrimonioLiquido === 1_000_000_000, "T035: liquido = bruto - pasivos");

  // T036: Pasivos > bruto → liquido clamped to 0
  s = makeState({
    patrimonio: { ...DEFAULT_PATRIMONIO_JURIDICO, ppePlantaEquipo: 100_000_000, pasivos: 500_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.patrimonio.patrimonioLiquido === 0, "T036: pasivos > bruto → liquido = 0");

  // T037: Only efectivo
  s = makeState({
    patrimonio: { ...DEFAULT_PATRIMONIO_JURIDICO, efectivoEquivalentes: 50_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.patrimonio.patrimonioBruto === 50_000_000, "T037: solo efectivo");

  // T038-T045: Individual asset categories
  for (const [key, label, idx] of [
    ["efectivoEquivalentes", "efectivo", 38],
    ["inversionesFinancieras", "inversiones", 39],
    ["cuentasPorCobrar", "CxC", 40],
    ["inventarios", "inventarios", 41],
    ["activosIntangibles", "intangibles", 42],
    ["activosBiologicos", "biologicos", 43],
    ["ppePlantaEquipo", "PPE", 44],
    ["otrosActivos", "otros", 45],
  ] as const) {
    s = makeState({
      patrimonio: { ...DEFAULT_PATRIMONIO_JURIDICO, [key]: 100_000_000 },
    });
    r = calcularDeclaracionJuridica(s);
    assert(r.patrimonio.patrimonioBruto === 100_000_000, `T0${idx}: ${label} = 100M`);
  }
}

// ══════════════════════════════════════════════════════════
// SECTION 4: DEPURACIÓN DE RENTA (25 tests)
// ══════════════════════════════════════════════════════════

function testDepuracionRenta() {
  const uvt = UVT_2025;

  // T046: Basic income → renta liquida
  let s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
  });
  let r = calcularDeclaracionJuridica(s);
  assert(r.depuracion.ingresosBrutos === 1_000_000_000, "T046: ingresos brutos");
  assert(r.depuracion.ingresosNetos === 1_000_000_000, "T047: ingresos netos = brutos (no INCR)");
  assert(r.depuracion.rentaLiquidaOrdinaria === 1_000_000_000, "T048: renta liquida = ingresos (no costos)");

  // T049: Ingresos - costos = renta
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
    costosGastos: { ...DEFAULT_COSTOS_GASTOS, costos: 600_000_000, gastosAdministracion: 200_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.depuracion.totalCostosGastos === 800_000_000, "T049: total costos");
  assert(r.depuracion.rentaLiquidaOrdinaria === 200_000_000, "T050: renta = ing - costos");
  assert(r.depuracion.perdidaLiquida === 0, "T051: no perdida when profitable");

  // T052: Loss scenario
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 100_000_000 },
    costosGastos: { ...DEFAULT_COSTOS_GASTOS, costos: 300_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.depuracion.rentaLiquidaOrdinaria === 0, "T052: renta clamped to 0");
  assert(r.depuracion.perdidaLiquida === 200_000_000, "T053: perdida = costos - ingresos");

  // T054: INCRNGO reduces ingresos netos
  s = makeState({
    ingresos: {
      ...DEFAULT_INGRESOS_JURIDICOS,
      ingresosOperacionales: 1_000_000_000,
      ingresosNoCRNGO: 200_000_000,
    },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.depuracion.incrngo === 200_000_000, "T054: INCRNGO");
  assert(r.depuracion.ingresosNetos === 800_000_000, "T055: netos = brutos - INCR");

  // T056: Devoluciones reduce ingresos netos
  s = makeState({
    ingresos: {
      ...DEFAULT_INGRESOS_JURIDICOS,
      ingresosOperacionales: 1_000_000_000,
      devolucionesDescuentos: 50_000_000,
    },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.depuracion.devolucionesDescuentos === 50_000_000, "T056: devoluciones");
  assert(r.depuracion.ingresosNetos === 950_000_000, "T057: netos after devoluciones");

  // T058: All income types sum
  s = makeState({
    ingresos: {
      ...DEFAULT_INGRESOS_JURIDICOS,
      ingresosOperacionales: 500_000_000,
      ingresosFinancieros: 100_000_000,
      otrosIngresos: 50_000_000,
      recuperacionDeducciones: 25_000_000,
    },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.depuracion.ingresosBrutos === 675_000_000, "T058: sum all income types");

  // T059: All cost types sum
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 2_000_000_000 },
    costosGastos: {
      costos: 500_000_000,
      gastosAdministracion: 200_000_000,
      gastosVentas: 150_000_000,
      gastosFinancieros: 100_000_000,
      otrosGastosDeducciones: 50_000_000,
    },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.depuracion.totalCostosGastos === 1_000_000_000, "T059: sum all cost types");

  // T060: Renta presuntiva = 0 (since 2021)
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.depuracion.rentaPresuntiva === 0, "T060: renta presuntiva = 0");

  // T061: Renta liquida gravable base = max(renta, presuntiva)
  assert(
    r.depuracion.rentaLiquidaGravableBase === r.depuracion.rentaLiquida,
    "T061: base = renta liquida (presuntiva is 0)"
  );

  // T062-T063: Rentas exentas reduce gravable
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
    rentasExentas: { ...DEFAULT_RENTAS_EXENTAS_JURIDICAS, energiaRenovable: 200_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.depuracion.rentasExentas === 200_000_000, "T062: rentas exentas");
  assert(r.depuracion.rentaLiquidaGravable === 800_000_000, "T063: gravable = base - exentas");

  // T064: Exentas > base → gravable clamped to 0
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 100_000_000 },
    rentasExentas: { ...DEFAULT_RENTAS_EXENTAS_JURIDICAS, energiaRenovable: 500_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.depuracion.rentaLiquidaGravable === 0, "T064: exentas > base → gravable = 0");

  // T065: Tax = renta * tarifa (flat rate, not progressive)
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assertApprox(
    r.liquidacion.impuestoRentaLiquidaGravable,
    Math.round(1_000_000_000 * 0.35),
    1,
    "T065: tax = renta * 35%"
  );

  // T066: Different tarifa = different tax
  s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, tipoEntidad: "hotelero" },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assertApprox(
    r.liquidacion.impuestoRentaLiquidaGravable,
    Math.round(1_000_000_000 * 0.15),
    1,
    "T066: hotelero tax = renta * 15%"
  );

  // T067-T070: Dividendos add to ingresos brutos
  s = makeState({
    ingresos: {
      ...DEFAULT_INGRESOS_JURIDICOS,
      ingresosOperacionales: 500_000_000,
      dividendosSubcedula2: 100_000_000,
      dividendosTarifa27: 50_000_000,
    },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.depuracion.ingresosBrutos === 650_000_000, "T067: dividendos in ingresos brutos");
}

// ══════════════════════════════════════════════════════════
// SECTION 5: COMPENSACIÓN PÉRDIDAS (20 tests)
// ══════════════════════════════════════════════════════════

function testCompensacionPerdidas() {
  // T068: No perdidas → no compensacion
  let s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 500_000_000 },
  });
  let r = calcularDeclaracionJuridica(s);
  assert(r.depuracion.compensacionPerdidas === 0, "T068: no losses → no compensation");

  // T069: Single loss fully compensated
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 500_000_000 },
    compensacion: {
      perdidasAnteriores: [{ ano: 2023, montoOriginal: 100_000_000, montoDisponible: 100_000_000 }],
      excesoRentaPresuntivaAnterior: 0,
    },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.depuracion.compensacionPerdidas === 100_000_000, "T069: full loss compensated");
  assert(r.depuracion.rentaLiquida === 400_000_000, "T070: renta reduced by loss");

  // T071: Loss exceeds renta → only compensate up to renta
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 100_000_000 },
    compensacion: {
      perdidasAnteriores: [{ ano: 2022, montoOriginal: 500_000_000, montoDisponible: 500_000_000 }],
      excesoRentaPresuntivaAnterior: 0,
    },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.depuracion.compensacionPerdidas === 100_000_000, "T071: capped to renta");
  assert(r.depuracion.rentaLiquida === 0, "T072: renta = 0 after full compensation");

  // T073: Multiple losses
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 500_000_000 },
    compensacion: {
      perdidasAnteriores: [
        { ano: 2020, montoOriginal: 100_000_000, montoDisponible: 100_000_000 },
        { ano: 2021, montoOriginal: 200_000_000, montoDisponible: 200_000_000 },
        { ano: 2022, montoOriginal: 50_000_000, montoDisponible: 50_000_000 },
      ],
      excesoRentaPresuntivaAnterior: 0,
    },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.depuracion.compensacionPerdidas === 350_000_000, "T073: multiple losses sum");
  assert(r.depuracion.rentaLiquida === 150_000_000, "T074: renta after multi-loss");

  // T075: Multiple losses exceeding renta
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 200_000_000 },
    compensacion: {
      perdidasAnteriores: [
        { ano: 2020, montoOriginal: 150_000_000, montoDisponible: 150_000_000 },
        { ano: 2021, montoOriginal: 200_000_000, montoDisponible: 200_000_000 },
      ],
      excesoRentaPresuntivaAnterior: 0,
    },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.depuracion.compensacionPerdidas === 200_000_000, "T075: multi-loss capped");

  // T076: No renta → no compensation even with losses
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 100_000_000 },
    costosGastos: { ...DEFAULT_COSTOS_GASTOS, costos: 200_000_000 },
    compensacion: {
      perdidasAnteriores: [{ ano: 2022, montoOriginal: 50_000_000, montoDisponible: 50_000_000 }],
      excesoRentaPresuntivaAnterior: 0,
    },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.depuracion.compensacionPerdidas === 0, "T076: no renta → no compensation");

  // T077: Exceso renta presuntiva
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 500_000_000 },
    compensacion: {
      perdidasAnteriores: [],
      excesoRentaPresuntivaAnterior: 100_000_000,
    },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.depuracion.compensacionPerdidas === 100_000_000, "T077: exceso RP compensated");

  // T078-T087: Loss + exceso RP combined
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 500_000_000 },
    compensacion: {
      perdidasAnteriores: [{ ano: 2022, montoOriginal: 200_000_000, montoDisponible: 200_000_000 }],
      excesoRentaPresuntivaAnterior: 50_000_000,
    },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.depuracion.compensacionPerdidas === 250_000_000, "T078: loss + exceso RP");
  assert(r.depuracion.rentaLiquida === 250_000_000, "T079: renta after combined");

  // T080: Empty losses array
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 500_000_000 },
    compensacion: { perdidasAnteriores: [], excesoRentaPresuntivaAnterior: 0 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.depuracion.compensacionPerdidas === 0, "T080: empty losses → 0");

  // T081-T087: Partially available losses
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 500_000_000 },
    compensacion: {
      perdidasAnteriores: [
        { ano: 2020, montoOriginal: 300_000_000, montoDisponible: 100_000_000 }, // partially used
        { ano: 2021, montoOriginal: 200_000_000, montoDisponible: 200_000_000 },
      ],
      excesoRentaPresuntivaAnterior: 0,
    },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.depuracion.compensacionPerdidas === 300_000_000, "T081: partial + full loss");
}

// ══════════════════════════════════════════════════════════
// SECTION 6: DESCUENTOS TRIBUTARIOS (25 tests)
// ══════════════════════════════════════════════════════════

function testDescuentos() {
  // T082: No descuentos → total = 0
  let s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
  });
  let r = calcularDeclaracionJuridica(s);
  assert(r.descuentos.totalDescuentos === 0, "T082: no descuentos → 0");
  assert(r.descuentos.limitado === false, "T083: not limited");

  // T084: Impuestos pagados exterior
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
    descuentos: { ...DEFAULT_DESCUENTOS_JURIDICOS, impuestosPagadosExterior: 50_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.descuentos.impuestosPagadosExterior === 50_000_000, "T084: exterior applied");
  assert(r.descuentos.totalDescuentos > 0, "T085: total > 0");

  // T086: Medio ambiente (25% of investment)
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
    descuentos: { ...DEFAULT_DESCUENTOS_JURIDICOS, inversionesMedioAmbiente: 100_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assertApprox(r.descuentos.medioAmbiente, 25_000_000, 1, "T086: medioambiente = 25% of 100M");

  // T087: I+D (30% of investment)
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
    descuentos: { ...DEFAULT_DESCUENTOS_JURIDICOS, investigacionDesarrollo: 100_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assertApprox(r.descuentos.iDMasI, 30_000_000, 1, "T087: I+D = 30% of 100M");

  // T088: Donaciones estándar (25%)
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
    descuentos: { ...DEFAULT_DESCUENTOS_JURIDICOS, donacionesEntidadesEspeciales: 100_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.descuentos.donaciones > 0, "T088: donaciones applied");

  // T089: Donaciones bancos alimentos (37%)
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
    descuentos: { ...DEFAULT_DESCUENTOS_JURIDICOS, donacionesBancosAlimentos: 100_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.descuentos.donaciones > 0, "T089: donaciones alimentos applied");

  // T090: IVA activos capital (100%)
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
    descuentos: { ...DEFAULT_DESCUENTOS_JURIDICOS, ivaActivosCapital: 50_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.descuentos.ivaActivos === 50_000_000, "T090: IVA activos = 100%");

  // T091: Combined limit (25% of impuesto a cargo)
  const impuesto1B = Math.round(1_000_000_000 * 0.35); // 350M
  const limite25 = Math.round(impuesto1B * 0.25); // 87.5M
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
    descuentos: {
      ...DEFAULT_DESCUENTOS_JURIDICOS,
      inversionesMedioAmbiente: 500_000_000, // 125M descuento
      investigacionDesarrollo: 500_000_000, // 150M descuento
      donacionesEntidadesEspeciales: 500_000_000, // 125M descuento
    },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.descuentos.limitado === true, "T091: combined limit hit");

  // T092: Descuentos don't exceed impuesto
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 100_000_000 },
    descuentos: {
      ...DEFAULT_DESCUENTOS_JURIDICOS,
      impuestosPagadosExterior: 500_000_000,
    },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.descuentos.totalDescuentos <= Math.round(100_000_000 * 0.35), "T092: descuentos ≤ impuesto");

  // T093: Zero income → zero descuentos effect
  s = makeState({
    descuentos: { ...DEFAULT_DESCUENTOS_JURIDICOS, impuestosPagadosExterior: 100_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.descuentos.totalDescuentos === 0, "T093: zero income → 0 descuentos");

  // T094-T106: More descuento combinations
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 2_000_000_000 },
    descuentos: {
      impuestosPagadosExterior: 50_000_000,
      inversionesMedioAmbiente: 40_000_000,
      investigacionDesarrollo: 60_000_000,
      donacionesEntidadesEspeciales: 20_000_000,
      donacionesBancosAlimentos: 10_000_000,
      ivaActivosCapital: 30_000_000,
      otrosDescuentos: 5_000_000,
    },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.descuentos.totalDescuentos > 0, "T094: all descuento types combined");
  assert(r.descuentos.impuestosPagadosExterior === 50_000_000, "T095: exterior intact");
  assert(r.liquidacion.impuestoNetoRenta >= 0, "T096: impuesto neto ≥ 0");
}

// ══════════════════════════════════════════════════════════
// SECTION 7: TTD — TASA MÍNIMA TRIBUTACIÓN (20 tests)
// ══════════════════════════════════════════════════════════

function testTTD() {
  // T097: TTD not triggered with sufficient tax
  let s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
    ttdInputs: {
      ...DEFAULT_TTD_INPUTS,
      utilidadContableAntesImpuestos: 1_000_000_000,
    },
  });
  let r = calcularDeclaracionJuridica(s);
  // Tax = 350M, UD = 1B, TTD = 350M/1B = 35% > 15%
  assert(r.ttd.aplica === true, "T097: TTD aplica (checks)");
  assert(r.ttd.impuestoAdicionar === 0, "T098: no adicional when TTD > 15%");
  assert(r.ttd.tasaTributacionDepurada >= 0.15, "T099: TTD ≥ 15%");

  // T100: TTD triggered with low tax / high utility
  s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, tipoEntidad: "sociedad_nacional" },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
    rentasExentas: { ...DEFAULT_RENTAS_EXENTAS_JURIDICAS, energiaRenovable: 800_000_000 },
    ttdInputs: {
      ...DEFAULT_TTD_INPUTS,
      utilidadContableAntesImpuestos: 1_000_000_000,
    },
  });
  r = calcularDeclaracionJuridica(s);
  // Gravable = 200M, Tax = 70M, UD = 1B
  // TTD = 70M/1B = 7% < 15% → IA = 1B*15% - 70M = 80M
  assert(r.ttd.aplica === true, "T100: TTD triggered");
  assert(r.ttd.impuestoAdicionar > 0, "T101: adicional > 0");
  assert(r.ttd.tasaTributacionDepurada < 0.15, "T102: TTD < 15%");

  // T103: TTD excluido for ZESE
  s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, tipoEntidad: "zese", anosZESE: 3 },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
    ttdInputs: { ...DEFAULT_TTD_INPUTS, utilidadContableAntesImpuestos: 1_000_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.ttd.excluido === true, "T103: ZESE excluded from TTD");
  assert(r.ttd.impuestoAdicionar === 0, "T104: no adicional for ZESE");

  // T105: TTD excluido for ZOMAC
  s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, tipoEntidad: "zomac_micro_pequena" },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
    ttdInputs: { ...DEFAULT_TTD_INPUTS, utilidadContableAntesImpuestos: 1_000_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.ttd.excluido === true, "T105: ZOMAC excluded from TTD");

  // T106: TTD excluido for hotelero
  s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, tipoEntidad: "hotelero" },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
    ttdInputs: { ...DEFAULT_TTD_INPUTS, utilidadContableAntesImpuestos: 1_000_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.ttd.excluido === true, "T106: hotelero excluded from TTD");

  // T107: TTD excluido for regimen_especial
  s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, tipoEntidad: "regimen_especial" },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
    ttdInputs: { ...DEFAULT_TTD_INPUTS, utilidadContableAntesImpuestos: 1_000_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.ttd.excluido === true, "T107: régimen especial excluded from TTD");

  // T108: UD ≤ 0 → TTD no aplica
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
    ttdInputs: {
      ...DEFAULT_TTD_INPUTS,
      utilidadContableAntesImpuestos: -500_000_000, // Loss
    },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.ttd.aplica === false, "T108: UD < 0 → TTD no aplica");
  assert(r.ttd.impuestoAdicionar === 0, "T109: no adicional when UD negative");

  // T110: UD = 0 → TTD no aplica
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
    ttdInputs: { ...DEFAULT_TTD_INPUTS, utilidadContableAntesImpuestos: 0 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.ttd.aplica === false, "T110: UD = 0 → TTD no aplica");

  // T111-T116: TTD calculation verification
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 500_000_000 },
    rentasExentas: { ...DEFAULT_RENTAS_EXENTAS_JURIDICAS, energiaRenovable: 400_000_000 },
    ttdInputs: { ...DEFAULT_TTD_INPUTS, utilidadContableAntesImpuestos: 500_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  // Gravable = 100M, Tax = 35M, UD = 500M
  // TTD = 35M/500M = 7%, IA = 500M*15% - 35M = 40M
  assert(r.ttd.impuestoAdicionar > 0, "T111: IA calculated");
  const expectedIA = Math.round(500_000_000 * 0.15 - Math.round(100_000_000 * 0.35));
  assertApprox(r.ttd.impuestoAdicionar, expectedIA, 1, "T112: IA = UD*15% - ID");
}

// ══════════════════════════════════════════════════════════
// SECTION 8: SOBRETASAS (15 tests)
// ══════════════════════════════════════════════════════════

function testSobretasas() {
  const uvt = UVT_2025;

  // T113: Financiero above threshold → 5% sobretasa
  let s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, tipoEntidad: "entidad_financiera" },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 120_001 * uvt },
  });
  let r = calcularDeclaracionJuridica(s);
  assert(r.sobretasa.aplica === true, "T113: financiero sobretasa aplica");
  assert(r.sobretasa.tasa === 0.05, "T114: tasa = 5%");
  assert(r.sobretasa.impuestoSobretasa > 0, "T115: sobretasa > 0");

  // T116: Financiero below threshold → no sobretasa
  s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, tipoEntidad: "entidad_financiera" },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 100_000 * uvt },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.sobretasa.aplica === false, "T116: below threshold → no sobretasa");

  // T117: Hidroeléctrico above 30,000 UVT → 3%
  s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, tipoEntidad: "generador_hidroelectrico" },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 30_001 * uvt },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.sobretasa.aplica === true, "T117: hidro sobretasa aplica");
  assert(r.sobretasa.tasa === 0.03, "T118: tasa = 3%");

  // T119: Hidroeléctrico below 30,000 UVT → no sobretasa
  s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, tipoEntidad: "generador_hidroelectrico" },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 20_000 * uvt },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.sobretasa.aplica === false, "T119: hidro below threshold → no sobretasa");

  // T120: Sociedad nacional → no sobretasa
  s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, tipoEntidad: "sociedad_nacional" },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 200_000 * uvt },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.sobretasa.aplica === false, "T120: sociedad normal → no sobretasa");

  // T121: Sobretasa affects liquidación
  s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, tipoEntidad: "entidad_financiera" },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 150_000 * uvt },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.liquidacion.sobretasa > 0, "T121: sobretasa in liquidacion");
  assert(r.liquidacion.saldoPagar > 0 || r.liquidacion.totalSaldoFavor >= 0, "T122: saldo computed with sobretasa");

  // T123-T127: Edge cases
  s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, tipoEntidad: "entidad_financiera" },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 120_000 * uvt },
  });
  r = calcularDeclaracionJuridica(s);
  // Exactly at threshold — renta gravable = 120,000 UVT
  // Sobretasa applies when renta >= threshold
  assert(r.sobretasa.aplica === true, "T123: exactly at threshold → aplica");
}

// ══════════════════════════════════════════════════════════
// SECTION 9: GANANCIAS OCASIONALES (15 tests)
// ══════════════════════════════════════════════════════════

function testGananciasOcasionales() {
  // T124: No GO
  let r = calcularDeclaracionJuridica(INITIAL_STATE_JURIDICA);
  assert(r.gananciasOcasionales.impuesto === 0, "T124: no GO → 0");

  // T125: GO básico → 15%
  let s = makeState({
    gananciasOcasionales: { ingresos: 1_000_000_000, costos: 200_000_000, noGravadasExentas: 100_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.gananciasOcasionales.gravables === 700_000_000, "T125: GO gravable");
  assertApprox(r.gananciasOcasionales.impuesto, Math.round(700_000_000 * 0.15), 1, "T126: GO 15%");

  // T127: GO costos > ingresos → clamped
  s = makeState({
    gananciasOcasionales: { ingresos: 100_000_000, costos: 200_000_000, noGravadasExentas: 0 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.gananciasOcasionales.gravables === 0, "T127: GO costos > ing → 0");
  assert(r.gananciasOcasionales.impuesto === 0, "T128: GO 0 gravable → 0 tax");

  // T129: GO no gravadas reduce gravable
  s = makeState({
    gananciasOcasionales: { ingresos: 500_000_000, costos: 100_000_000, noGravadasExentas: 300_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.gananciasOcasionales.gravables === 100_000_000, "T129: GO after exemptions");

  // T130: GO exentas > neto → gravable = 0
  s = makeState({
    gananciasOcasionales: { ingresos: 200_000_000, costos: 0, noGravadasExentas: 300_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.gananciasOcasionales.gravables === 0, "T130: exentas > neto → 0");

  // T131-T138: GO in liquidación
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 500_000_000 },
    gananciasOcasionales: { ingresos: 200_000_000, costos: 50_000_000, noGravadasExentas: 0 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.liquidacion.impuestoGananciasOcasionales > 0, "T131: GO in liquidación");
  assert(
    r.liquidacion.totalImpuestoCargo >= r.liquidacion.impuestoNetoRenta,
    "T132: total a cargo ≥ neto renta"
  );
}

// ══════════════════════════════════════════════════════════
// SECTION 10: ANTICIPO (10 tests)
// ══════════════════════════════════════════════════════════

function testAnticipo() {
  // T133: Primer año = 25%
  let s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, anosDeclarando: 1 },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
  });
  let r = calcularDeclaracionJuridica(s);
  assert(
    r.liquidacion.anticipoSiguienteAno === Math.round(r.liquidacion.impuestoNetoRenta * 0.25),
    "T133: anticipo 1er año = 25%"
  );

  // T134: Segundo año = 50%
  s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, anosDeclarando: 2 },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(
    r.liquidacion.anticipoSiguienteAno === Math.round(r.liquidacion.impuestoNetoRenta * 0.50),
    "T134: anticipo 2do año = 50%"
  );

  // T135: Tercer año = 75%
  s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, anosDeclarando: 3 },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(
    r.liquidacion.anticipoSiguienteAno === Math.round(r.liquidacion.impuestoNetoRenta * 0.75),
    "T135: anticipo 3er+ año = 75%"
  );

  // T136: 25% < 50% < 75%
  const s1 = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, anosDeclarando: 1 },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
  });
  const s2 = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, anosDeclarando: 2 },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
  });
  const s3 = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, anosDeclarando: 3 },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
  });
  const r1 = calcularDeclaracionJuridica(s1);
  const r2 = calcularDeclaracionJuridica(s2);
  const r3 = calcularDeclaracionJuridica(s3);
  assert(
    r1.liquidacion.anticipoSiguienteAno < r2.liquidacion.anticipoSiguienteAno &&
    r2.liquidacion.anticipoSiguienteAno < r3.liquidacion.anticipoSiguienteAno,
    "T136: 25% < 50% < 75% ordering"
  );

  // T137: Zero income → anticipo = 0
  s = makeState({ perfil: { ...DEFAULT_PERFIL_JURIDICO, anosDeclarando: 3 } });
  r = calcularDeclaracionJuridica(s);
  assert(r.liquidacion.anticipoSiguienteAno === 0, "T137: 0 income → 0 anticipo");

  // T138: Anticipo reduces saldo a pagar
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
    retenciones: { ...DEFAULT_RETENCIONES_JURIDICO, anticipoAnoAnterior: 100_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  const sNoAnticipo = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
  });
  const rNoAnticipo = calcularDeclaracionJuridica(sNoAnticipo);
  assert(r.liquidacion.saldoPagar < rNoAnticipo.liquidacion.saldoPagar, "T138: anticipo reduces saldo");
}

// ══════════════════════════════════════════════════════════
// SECTION 11: LIQUIDACIÓN FINAL (20 tests)
// ══════════════════════════════════════════════════════════

function testLiquidacion() {
  // T139: Retenciones reduce saldo a pagar
  let s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
    retenciones: { ...DEFAULT_RETENCIONES_JURIDICO, autorretenciones: 100_000_000 },
  });
  let r = calcularDeclaracionJuridica(s);
  assert(r.liquidacion.totalRetenciones === 100_000_000, "T139: retenciones applied");

  // T140: Saldo a favor when retenciones > impuesto
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 100_000_000 },
    retenciones: { ...DEFAULT_RETENCIONES_JURIDICO, autorretenciones: 500_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.liquidacion.totalSaldoFavor > 0, "T140: retenciones > impuesto → saldo a favor");
  assert(r.liquidacion.saldoPagar === 0, "T141: saldo a pagar = 0 when favor");

  // T142: Mutually exclusive
  assert(
    !(r.liquidacion.saldoPagar > 0 && r.liquidacion.totalSaldoFavor > 0),
    "T142: pagar and favor mutually exclusive"
  );

  // T143: Saldo favor anterior
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
    retenciones: { ...DEFAULT_RETENCIONES_JURIDICO, saldoFavorAnterior: 50_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.liquidacion.saldoFavorAnterior === 50_000_000, "T143: saldo favor anterior");

  // T144: Impuesto neto ≥ 0
  r = calcularDeclaracionJuridica(INITIAL_STATE_JURIDICA);
  assert(r.liquidacion.impuestoNetoRenta >= 0, "T144: impuesto neto ≥ 0");

  // T145: Total retenciones = sum
  s = makeState({
    retenciones: {
      anticipoAnoAnterior: 0,
      saldoFavorAnterior: 0,
      autorretenciones: 30_000_000,
      otrasRetenciones: 20_000_000,
    },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.liquidacion.totalRetenciones === 50_000_000, "T145: total retenciones = sum");

  // T146: Tasa efectiva > 0 with income
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.tasaEfectiva > 0, "T146: tasa efectiva > 0");
  assert(r.tasaEfectiva <= 0.50, "T147: tasa efectiva ≤ 50%");

  // T148: Zero income → tasa efectiva = 0
  r = calcularDeclaracionJuridica(INITIAL_STATE_JURIDICA);
  assert(r.tasaEfectiva === 0, "T148: tasa efectiva = 0 with 0 income");

  // T149-T158: Full scenario
  s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, tipoEntidad: "sociedad_nacional", anosDeclarando: 3 },
    ingresos: {
      ...DEFAULT_INGRESOS_JURIDICOS,
      ingresosOperacionales: 5_000_000_000,
      ingresosFinancieros: 500_000_000,
      otrosIngresos: 100_000_000,
      devolucionesDescuentos: 200_000_000,
      ingresosNoCRNGO: 300_000_000,
    },
    costosGastos: {
      costos: 2_000_000_000,
      gastosAdministracion: 800_000_000,
      gastosVentas: 500_000_000,
      gastosFinancieros: 200_000_000,
      otrosGastosDeducciones: 100_000_000,
    },
    gananciasOcasionales: { ingresos: 300_000_000, costos: 50_000_000, noGravadasExentas: 100_000_000 },
    retenciones: {
      anticipoAnoAnterior: 200_000_000,
      saldoFavorAnterior: 50_000_000,
      autorretenciones: 300_000_000,
      otrasRetenciones: 100_000_000,
    },
    ttdInputs: { ...DEFAULT_TTD_INPUTS, utilidadContableAntesImpuestos: 2_000_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.depuracion.ingresosBrutos === 5_600_000_000, "T149: full scenario ingresos brutos");
  assert(r.depuracion.ingresosNetos === 5_100_000_000, "T150: full scenario ingresos netos");
  assert(r.depuracion.totalCostosGastos === 3_600_000_000, "T151: full scenario costos");
  assert(r.depuracion.rentaLiquidaOrdinaria === 1_500_000_000, "T152: full scenario renta");
  assert(r.liquidacion.impuestoRentaLiquidaGravable > 0, "T153: full scenario has tax");
  assert(r.liquidacion.anticipoSiguienteAno > 0, "T154: full scenario has anticipo");
  assert(r.gananciasOcasionales.impuesto > 0, "T155: full scenario has GO tax");
  assert(isFinite(r.tasaEfectiva), "T156: tasa efectiva finite");
  assert(r.liquidacion.totalRetenciones === 400_000_000, "T157: total retenciones");
  assert(r.liquidacion.anticipoAnterior === 200_000_000, "T158: anticipo anterior");
}

// ══════════════════════════════════════════════════════════
// SECTION 12: COMPLETE PROFILES (20 tests)
// ══════════════════════════════════════════════════════════

function testCompleteProfiles() {
  const uvt = UVT_2025;

  // T159: Small company — sociedad nacional
  let s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, tipoEntidad: "sociedad_nacional", tamano: "pequena" },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 500_000_000 },
    costosGastos: { ...DEFAULT_COSTOS_GASTOS, costos: 300_000_000 },
  });
  let r = calcularDeclaracionJuridica(s);
  assertApprox(
    r.liquidacion.impuestoRentaLiquidaGravable,
    Math.round(200_000_000 * 0.35),
    1,
    "T159: small company tax"
  );

  // T160: Financial entity with sobretasa
  s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, tipoEntidad: "entidad_financiera" },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 200_000 * uvt },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.sobretasa.aplica === true, "T160: fin sobretasa");
  assert(r.liquidacion.sobretasa > 0, "T161: fin sobretasa in liquidacion");

  // T162: Zona franca industrial 80% export
  s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, tipoEntidad: "zona_franca_industrial", porcentajeExportacion: 0.8 },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  // tarifa = 0.20*0.8 + 0.35*0.2 = 0.16 + 0.07 = 0.23
  assertApprox(r.tarifaAplicada, 0.23, 0.001, "T162: ZF 80% export = 23%");
  assertApprox(
    r.liquidacion.impuestoRentaLiquidaGravable,
    Math.round(1_000_000_000 * 0.23),
    1,
    "T163: ZF tax correct"
  );

  // T164: ZESE year 3 → 0% tax
  s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, tipoEntidad: "zese", anosZESE: 3 },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.liquidacion.impuestoRentaLiquidaGravable === 0, "T164: ZESE 0% tax");
  assert(r.ttd.excluido === true, "T165: ZESE TTD excluded");

  // T166: ZESE year 7 → 17.5% tax
  s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, tipoEntidad: "zese", anosZESE: 7 },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assertApprox(
    r.liquidacion.impuestoRentaLiquidaGravable,
    Math.round(1_000_000_000 * 0.175),
    1,
    "T166: ZESE year 7 = 17.5%"
  );

  // T167: Mega-inversión
  s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, tipoEntidad: "mega_inversion" },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 10_000_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assertApprox(
    r.liquidacion.impuestoRentaLiquidaGravable,
    Math.round(10_000_000_000 * 0.27),
    1,
    "T167: mega-inversión = 27%"
  );

  // T168: Régimen especial (ESAL)
  s = makeState({
    perfil: { ...DEFAULT_PERFIL_JURIDICO, tipoEntidad: "regimen_especial" },
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 500_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assertApprox(
    r.liquidacion.impuestoRentaLiquidaGravable,
    Math.round(500_000_000 * 0.20),
    1,
    "T168: ESAL = 20%"
  );

  // T169: Company with losses and GO
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 200_000_000 },
    costosGastos: { ...DEFAULT_COSTOS_GASTOS, costos: 300_000_000 },
    gananciasOcasionales: { ingresos: 100_000_000, costos: 0, noGravadasExentas: 0 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.depuracion.rentaLiquidaGravable === 0, "T169: loss → 0 renta gravable");
  assert(r.depuracion.perdidaLiquida === 100_000_000, "T170: loss recorded");
  assert(r.gananciasOcasionales.impuesto > 0, "T171: GO still taxed despite loss");

  // T172: All zero → no tax
  r = calcularDeclaracionJuridica(INITIAL_STATE_JURIDICA);
  assert(r.liquidacion.totalImpuestoCargo === 0, "T172: all zero → no tax");
  assert(r.liquidacion.saldoPagar === 0, "T173: all zero → no saldo");

  // T174-T178: Multiple cédula interactions
  s = makeState({
    ingresos: {
      ...DEFAULT_INGRESOS_JURIDICOS,
      ingresosOperacionales: 3_000_000_000,
      dividendosSubcedula2: 500_000_000,
      dividendosTarifa27: 200_000_000,
    },
    costosGastos: { ...DEFAULT_COSTOS_GASTOS, costos: 1_500_000_000 },
    gananciasOcasionales: { ingresos: 400_000_000, costos: 100_000_000, noGravadasExentas: 50_000_000 },
    descuentos: { ...DEFAULT_DESCUENTOS_JURIDICOS, impuestosPagadosExterior: 30_000_000 },
    retenciones: { ...DEFAULT_RETENCIONES_JURIDICO, autorretenciones: 200_000_000, otrasRetenciones: 100_000_000 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(r.dividendos.impuestoDividendos35 > 0, "T174: dividendos 35% tax");
  assert(r.dividendos.impuestoDividendos27 > 0, "T175: dividendos 27% tax");
  assert(r.gananciasOcasionales.impuesto > 0, "T176: GO tax");
  assert(r.descuentos.totalDescuentos > 0, "T177: descuentos applied");
  assert(r.liquidacion.totalRetenciones === 300_000_000, "T178: retenciones sum");
}

// ══════════════════════════════════════════════════════════
// SECTION 13: EDGE CASES (30 tests)
// ══════════════════════════════════════════════════════════

function testEdgeCases() {
  const uvt = UVT_2025;

  // T179: Very large values
  let s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 100_000_000_000_000 }, // 100 trillion
  });
  let r = calcularDeclaracionJuridica(s);
  assert(isFinite(r.liquidacion.impuestoRentaLiquidaGravable), "T179: 100T → finite tax");
  assert(r.liquidacion.impuestoRentaLiquidaGravable > 0, "T180: 100T → tax > 0");

  // T181: NaN protection
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 0 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(!isNaN(r.tasaEfectiva), "T181: 0/0 → 0 not NaN");

  // T182-T184: Negative protection
  assert(r.depuracion.rentaLiquidaGravable >= 0, "T182: gravable ≥ 0");
  assert(r.liquidacion.impuestoNetoRenta >= 0, "T183: impuesto neto ≥ 0");
  assert(r.liquidacion.totalImpuestoCargo >= 0, "T184: total cargo ≥ 0");

  // T185: Integer outputs
  s = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 123_456_789 },
    costosGastos: { ...DEFAULT_COSTOS_GASTOS, costos: 45_678_901 },
  });
  r = calcularDeclaracionJuridica(s);
  assert(Number.isInteger(r.liquidacion.impuestoRentaLiquidaGravable), "T185: tax is integer");
  assert(Number.isInteger(r.liquidacion.anticipoSiguienteAno), "T186: anticipo is integer");
  assert(Number.isInteger(r.gananciasOcasionales.impuesto), "T187: GO tax is integer");

  // T188: Patrimonio doesn't affect income tax
  const sNoPatr = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
  });
  const sWithPatr = makeState({
    ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
    patrimonio: { ...DEFAULT_PATRIMONIO_JURIDICO, ppePlantaEquipo: 50_000_000_000 },
  });
  const rNoP = calcularDeclaracionJuridica(sNoPatr);
  const rWithP = calcularDeclaracionJuridica(sWithPatr);
  assert(
    rNoP.liquidacion.impuestoRentaLiquidaGravable === rWithP.liquidacion.impuestoRentaLiquidaGravable,
    "T188: patrimonio doesn't affect income tax"
  );

  // T189: SaldoPagar × SaldoFavor always exclusive
  for (const income of [0, 100_000_000, 1_000_000_000, 10_000_000_000]) {
    s = makeState({
      ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: income },
      retenciones: { ...DEFAULT_RETENCIONES_JURIDICO, autorretenciones: income * 0.15 },
    });
    r = calcularDeclaracionJuridica(s);
    assert(
      r.liquidacion.saldoPagar === 0 || r.liquidacion.totalSaldoFavor === 0,
      `T189: mutually exclusive for income ${income}`
    );
  }

  // T190-T193: Stress tests
  for (const mult of [1, 100, 10000, 100000]) {
    s = makeState({
      ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: mult * uvt },
    });
    r = calcularDeclaracionJuridica(s);
    assert(isFinite(r.liquidacion.impuestoRentaLiquidaGravable), `T190: stress ${mult} UVT finite`);
    assert(r.liquidacion.impuestoRentaLiquidaGravable >= 0, `T191: stress ${mult} UVT ≥ 0`);
  }

  // T194: All entity types produce valid results
  const tipos: Array<[string, Partial<typeof DEFAULT_PERFIL_JURIDICO>]> = [
    ["sociedad_nacional", { tipoEntidad: "sociedad_nacional" as const }],
    ["entidad_financiera", { tipoEntidad: "entidad_financiera" as const }],
    ["generador_hidroelectrico", { tipoEntidad: "generador_hidroelectrico" as const }],
    ["zona_franca_industrial", { tipoEntidad: "zona_franca_industrial" as const, porcentajeExportacion: 0.6 }],
    ["zona_franca_pre2023", { tipoEntidad: "zona_franca_pre2023" as const }],
    ["zona_franca_comercial", { tipoEntidad: "zona_franca_comercial" as const }],
    ["hotelero", { tipoEntidad: "hotelero" as const }],
    ["editorial", { tipoEntidad: "editorial" as const }],
    ["zese", { tipoEntidad: "zese" as const, anosZESE: 3 }],
    ["zomac_micro", { tipoEntidad: "zomac_micro_pequena" as const }],
    ["zomac_grande", { tipoEntidad: "zomac_mediana_grande" as const }],
    ["mega_inversion", { tipoEntidad: "mega_inversion" as const }],
    ["regimen_especial", { tipoEntidad: "regimen_especial" as const }],
    ["extractivo", { tipoEntidad: "extractivo" as const }],
  ];

  for (const [label, perfilOverrides] of tipos) {
    s = makeState({
      perfil: { ...DEFAULT_PERFIL_JURIDICO, ...perfilOverrides },
      ingresos: { ...DEFAULT_INGRESOS_JURIDICOS, ingresosOperacionales: 1_000_000_000 },
    });
    r = calcularDeclaracionJuridica(s);
    assert(isFinite(r.liquidacion.impuestoRentaLiquidaGravable), `T194: ${label} → finite`);
    assert(r.tarifaAplicada >= 0 && r.tarifaAplicada <= 0.50, `T195: ${label} tarifa valid`);
  }
}

// ══════════════════════════════════════════════════════════
// RUN ALL TESTS
// ══════════════════════════════════════════════════════════

console.log("═══════════════════════════════════════════════════");
console.log(" Declaración de Renta Jurídicas — Test Suite");
console.log("═══════════════════════════════════════════════════\n");

testInitialState();
testTarifas();
testPatrimonio();
testDepuracionRenta();
testCompensacionPerdidas();
testDescuentos();
testTTD();
testSobretasas();
testGananciasOcasionales();
testAnticipo();
testLiquidacion();
testCompleteProfiles();
testEdgeCases();

console.log("\n═══════════════════════════════════════════════════");
console.log(` RESULTS: ${passed} passed, ${failed} failed (${passed + failed} total)`);
console.log("═══════════════════════════════════════════════════");

if (failures.length > 0) {
  console.log("\nFAILURES:");
  for (const f of failures) {
    console.log(`  ${f}`);
  }
}

process.exit(failed > 0 ? 1 : 0);
