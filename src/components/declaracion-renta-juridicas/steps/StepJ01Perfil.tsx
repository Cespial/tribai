"use client";

import { useDeclaracionJuridica } from "@/lib/declaracion-renta-juridicas/declaracion-juridica-context";
import type { ResultadoDeclaracionJuridica } from "@/lib/declaracion-renta-juridicas/types";
import { DeclaracionTextInput } from "@/components/declaracion-renta/fields/DeclaracionTextInput";
import { DeclaracionSelect } from "@/components/declaracion-renta/fields/DeclaracionSelect";
import { DeclaracionNumberInput } from "@/components/declaracion-renta/fields/DeclaracionNumberInput";

interface StepProps {
  resultado: ResultadoDeclaracionJuridica;
}

const TIPO_ENTIDAD_OPTIONS = [
  { value: "sociedad_nacional", label: "Sociedad nacional (35%)" },
  { value: "entidad_financiera", label: "Entidad financiera (35% + sobretasa 5%)" },
  { value: "generador_hidroelectrico", label: "Generador hidroeléctrico (35% + sobretasa 3%)" },
  { value: "zona_franca_industrial", label: "Zona franca industrial (mixta)" },
  { value: "zona_franca_comercial", label: "Zona franca comercial (35%)" },
  { value: "zona_franca_pre2023", label: "Zona franca pre-2023 (20%)" },
  { value: "hotelero", label: "Sector hotelero (15%)" },
  { value: "editorial", label: "Sector editorial (15%)" },
  { value: "zese", label: "ZESE — Zona Económica Social Especial" },
  { value: "zomac_micro_pequena", label: "ZOMAC micro/pequeña (17.5%)" },
  { value: "zomac_mediana_grande", label: "ZOMAC mediana/grande (26.25%)" },
  { value: "mega_inversion", label: "Mega-inversión (27%)" },
  { value: "regimen_especial", label: "Régimen tributario especial (20%)" },
  { value: "extractivo", label: "Sector extractivo (35%)" },
];

const TAMANO_OPTIONS = [
  { value: "micro", label: "Microempresa" },
  { value: "pequena", label: "Pequeña empresa" },
  { value: "mediana", label: "Mediana empresa" },
  { value: "grande", label: "Gran empresa" },
];

const ANO_GRAVABLE_OPTIONS = [
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" },
  { value: "2026", label: "2026" },
];

const ANOS_DECLARANDO_OPTIONS = [
  { value: "1", label: "Primer año declarando (anticipo 25%)" },
  { value: "2", label: "Segundo año declarando (anticipo 50%)" },
  { value: "3", label: "Tercer año o más (anticipo 75%)" },
];

export function StepJ01Perfil({ resultado }: StepProps) {
  const { state, dispatch } = useDeclaracionJuridica();
  const p = state.perfil;

  const update = (payload: Partial<typeof p>) =>
    dispatch({ type: "UPDATE_PERFIL", payload });

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <p className="text-sm text-foreground">
          Configure el perfil tributario de la persona jurídica. El <strong>tipo de entidad</strong> determina
          la tarifa aplicable según el Art. 240 ET. Tarifa aplicada:{" "}
          <strong className="font-values">{(resultado.tarifaAplicada * 100).toFixed(2)}%</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <DeclaracionTextInput
            id="razon-social"
            label="Razón social"
            value={p.razonSocial}
            onChange={(v) => update({ razonSocial: v })}
          />
        </div>
        <DeclaracionTextInput
          id="nit"
          label="NIT"
          value={p.nit}
          onChange={(v) => update({ nit: v })}
        />
        <DeclaracionTextInput
          id="dv"
          label="Dígito de verificación"
          value={p.digitoVerificacion}
          onChange={(v) => update({ digitoVerificacion: v })}
        />
        <DeclaracionTextInput
          id="direccion-seccional"
          label="Código dirección seccional"
          value={p.codigoDireccionSeccional}
          onChange={(v) => update({ codigoDireccionSeccional: v })}
        />
        <DeclaracionTextInput
          id="actividad-economica"
          label="Actividad económica (código CIIU)"
          value={p.actividadEconomica}
          onChange={(v) => update({ actividadEconomica: v })}
        />
        <DeclaracionSelect
          id="tipo-entidad"
          label="Tipo de entidad"
          value={p.tipoEntidad}
          onChange={(v) => update({ tipoEntidad: v as typeof p.tipoEntidad })}
          options={TIPO_ENTIDAD_OPTIONS}
          helperText="Determina la tarifa de renta aplicable"
        />
        <DeclaracionSelect
          id="tamano"
          label="Tamaño de empresa"
          value={p.tamano}
          onChange={(v) => update({ tamano: v as typeof p.tamano })}
          options={TAMANO_OPTIONS}
        />
        <DeclaracionSelect
          id="ano-gravable"
          label="Año gravable"
          value={String(p.anoGravable)}
          onChange={(v) => update({ anoGravable: Number(v) })}
          options={ANO_GRAVABLE_OPTIONS}
        />
        <DeclaracionSelect
          id="anos-declarando"
          label="Años declarando"
          value={String(p.anosDeclarando)}
          onChange={(v) => update({ anosDeclarando: Number(v) })}
          options={ANOS_DECLARANDO_OPTIONS}
          helperText="Art. 807 ET — Porcentaje de anticipo"
        />
      </div>

      {p.tipoEntidad === "zona_franca_industrial" && (
        <div className="rounded-md border border-border/60 bg-muted/20 p-4">
          <DeclaracionNumberInput
            id="pct-exportacion"
            label="Porcentaje de ingresos por exportación"
            value={p.porcentajeExportacion}
            onChange={(v) => update({ porcentajeExportacion: v })}
            min={0}
            max={1}
            helperText="0 = 100% venta nacional (35%), 1 = 100% exportación (20%). Tarifa mixta post-2022."
          />
        </div>
      )}

      {p.tipoEntidad === "zese" && (
        <div className="rounded-md border border-border/60 bg-muted/20 p-4">
          <DeclaracionNumberInput
            id="anos-zese"
            label="Años en régimen ZESE"
            value={p.anosZESE}
            onChange={(v) => update({ anosZESE: v })}
            min={0}
            max={11}
            helperText="Años 1-5: tarifa 0%. Años 6-10: tarifa 17.5%. Año 11+: tarifa general 35%."
          />
        </div>
      )}
    </div>
  );
}
