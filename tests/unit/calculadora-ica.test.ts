import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { MUNICIPIOS_ICA, type BalanceICA, type MunicipioICA } from "../../src/config/ica-data";
import { calcularICA, validarBalanceICA } from "../../src/lib/calculadora-ica";

function getMunicipio(id: string): MunicipioICA {
  const m = MUNICIPIOS_ICA.find((item) => item.id === id);
  if (!m) {
    throw new Error(`Municipio ${id} no encontrado`);
  }
  return m;
}

function makeBalance(overrides: Partial<BalanceICA>): BalanceICA {
  return {
    ingresosTotalesPais: 0,
    ingresosFueraMunicipio: 0,
    devoluciones: 0,
    exportacionesYActivosFijos: 0,
    actividadesExcluidasNoSujetas: 0,
    actividadesExentas: 0,
    ingresosPorActividad: [],
    retencionesPracticadas: 0,
    autorretenciones: 0,
    anticipoAnterior: 0,
    saldoFavorAnterior: 0,
    ...overrides,
  };
}

describe("calculadora-ica", () => {
  it("calcula ICA básico en Cisneros", () => {
    const municipio = getMunicipio("cisneros");
    const balance = makeBalance({
      ingresosTotalesPais: 100_000_000,
      ingresosPorActividad: [
        {
          codigoActividad: "8230",
          descripcion: "Eventos",
          tarifa: 10,
          ingresos: 100_000_000,
        },
      ],
    });

    const result = calcularICA(municipio, balance);

    assert.equal(result.renglon17, 1_000_000);
    assert.equal(result.renglon21, 150_000);
    assert.equal(result.renglon23, 30_000);
    assert.equal(result.renglon25, 1_180_000);
  });

  it("no permite base gravable negativa", () => {
    const municipio = getMunicipio("cisneros");
    const balance = makeBalance({
      ingresosTotalesPais: 50_000,
      devoluciones: 100_000,
      ingresosPorActividad: [
        {
          codigoActividad: "8230",
          descripcion: "Eventos",
          tarifa: 10,
          ingresos: 0,
        },
      ],
    });

    const result = calcularICA(municipio, balance);
    assert.equal(result.renglon15, 0);
  });

  it("aplica anticipo para municipio configurado", () => {
    const municipio: MunicipioICA = {
      id: "test",
      nombre: "Test",
      departamento: "Test",
      tarifas: {
        actividadPrincipal: {
          codigo: "TEST",
          descripcion: "Test",
          tarifa: 10,
          tipoActividad: "COMERCIAL",
        },
        actividadesAdicionales: [],
      },
      avisosYTableros: { aplica: false, porcentaje: 0 },
      sobretasaBomberil: { aplica: false, porcentaje: 0, base: "ICA" },
      sobretasaSeguridad: { aplica: false, porcentaje: 0 },
      anticipo: { aplica: true, porcentaje: 30 },
      descuentoProntoPago: { aplica: false, porcentaje: 0 },
    };

    const balance = makeBalance({
      ingresosTotalesPais: 100_000_000,
      ingresosPorActividad: [
        {
          codigoActividad: "TEST",
          descripcion: "Test",
          tarifa: 10,
          ingresos: 100_000_000,
        },
      ],
    });

    const result = calcularICA(municipio, balance);
    assert.equal(result.renglon30, Math.round(result.renglon25 * 0.3));
  });

  it("genera saldo a favor cuando retenciones superan impuesto", () => {
    const municipio = getMunicipio("cisneros");
    const balance = makeBalance({
      ingresosTotalesPais: 50_000_000,
      ingresosPorActividad: [
        {
          codigoActividad: "8230",
          descripcion: "Eventos",
          tarifa: 10,
          ingresos: 50_000_000,
        },
      ],
      retencionesPracticadas: 2_000_000,
    });

    const result = calcularICA(municipio, balance);
    assert.ok(result.renglon33 < 0);
    assert.ok(result.renglon34 > 0);
    assert.equal(result.renglon38, 0);
  });

  it("validarBalanceICA reporta errores esperados", () => {
    const balance = makeBalance({
      ingresosTotalesPais: 100,
      ingresosFueraMunicipio: 200,
      ingresosPorActividad: [],
    });

    const validation = validarBalanceICA(balance);

    assert.ok(validation.errores.some((e) => e.includes("fuera del municipio")));
    assert.ok(validation.errores.some((e) => e.includes("al menos una actividad")));
  });

  it("validarBalanceICA reporta warnings por tarifa alta y desbalance", () => {
    const balance = makeBalance({
      ingresosTotalesPais: 1_000_000,
      ingresosFueraMunicipio: 980_000,
      ingresosPorActividad: [
        {
          codigoActividad: "9999",
          descripcion: "Prueba",
          tarifa: 20,
          ingresos: 100_000,
        },
      ],
      retencionesPracticadas: 50_000,
    });

    const validation = validarBalanceICA(balance);

    assert.ok(validation.warnings.some((w) => w.includes("inusualmente alta")));
    assert.ok(validation.warnings.some((w) => w.includes("Más del 95%")));
    assert.ok(validation.warnings.some((w) => w.includes("Retenciones superan impuesto")));
  });
});
