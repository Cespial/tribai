"use client";

import { useDeclaracion } from "@/lib/declaracion-renta/declaracion-context";
import type { ResultadoDeclaracion } from "@/lib/declaracion-renta/types";
import { DeclaracionTextInput } from "../fields/DeclaracionTextInput";
import { DeclaracionSelect } from "../fields/DeclaracionSelect";
import { DeclaracionToggle } from "../fields/DeclaracionToggle";

const TIPO_DOC_OPTIONS = [
  { value: "CC", label: "Cédula de ciudadanía" },
  { value: "CE", label: "Cédula de extranjería" },
  { value: "NIT", label: "NIT" },
  { value: "TI", label: "Tarjeta de identidad" },
  { value: "PA", label: "Pasaporte" },
];

const TIPO_CONTRIBUYENTE_OPTIONS = [
  { value: "empleado", label: "Empleado asalariado" },
  { value: "independiente", label: "Trabajador independiente" },
  { value: "pensionado", label: "Pensionado" },
  { value: "rentista_capital", label: "Rentista de capital" },
  { value: "mixto", label: "Mixto (varias fuentes de ingreso)" },
];

const ACTIVIDAD_OPTIONS = [
  { value: "salarios", label: "Salarios" },
  { value: "honorarios", label: "Honorarios" },
  { value: "servicios", label: "Servicios" },
  { value: "comercial", label: "Comercial" },
  { value: "agropecuaria", label: "Agropecuaria" },
  { value: "industrial", label: "Industrial" },
  { value: "profesion_liberal", label: "Profesión liberal" },
  { value: "otro", label: "Otro" },
];

const ANO_GRAVABLE_OPTIONS = [
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
];

interface StepProps {
  resultado: ResultadoDeclaracion;
}

export function Step01Perfil(_props: StepProps) {
  const { state, dispatch } = useDeclaracion();
  const p = state.perfil;

  const update = (payload: Partial<typeof p>) =>
    dispatch({ type: "UPDATE_PERFIL", payload });

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <p className="text-sm text-foreground">
          Estos datos identifican al contribuyente. Si ya declaraste antes, usa los mismos datos
          de tu RUT.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DeclaracionTextInput
          id="perfil-nombres"
          label="Nombres"
          value={p.nombres}
          onChange={(v) => update({ nombres: v })}
          placeholder="Ej: Juan Carlos"
        />
        <DeclaracionTextInput
          id="perfil-apellidos"
          label="Apellidos"
          value={p.apellidos}
          onChange={(v) => update({ apellidos: v })}
          placeholder="Ej: García López"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <DeclaracionSelect
          id="perfil-tipo-doc"
          label="Tipo de documento"
          value={p.tipoDocumento}
          onChange={(v) => update({ tipoDocumento: v as typeof p.tipoDocumento })}
          options={TIPO_DOC_OPTIONS}
        />
        <DeclaracionTextInput
          id="perfil-num-doc"
          label="Número de documento"
          value={p.numeroDocumento}
          onChange={(v) => update({ numeroDocumento: v })}
          placeholder="Ej: 1234567890"
        />
        <DeclaracionTextInput
          id="perfil-dv"
          label="Dígito de verificación"
          value={p.digitoVerificacion}
          onChange={(v) => update({ digitoVerificacion: v })}
          placeholder="Ej: 5"
          helperText="Solo si aplica"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DeclaracionTextInput
          id="perfil-direccion"
          label="Dirección"
          value={p.direccion}
          onChange={(v) => update({ direccion: v })}
          placeholder="Ej: Cra 7 # 45-67"
        />
        <div className="grid grid-cols-2 gap-4">
          <DeclaracionTextInput
            id="perfil-municipio"
            label="Municipio"
            value={p.municipio}
            onChange={(v) => update({ municipio: v })}
            placeholder="Ej: Bogotá"
          />
          <DeclaracionTextInput
            id="perfil-departamento"
            label="Departamento"
            value={p.departamento}
            onChange={(v) => update({ departamento: v })}
            placeholder="Ej: Cundinamarca"
          />
        </div>
      </div>

      <hr className="border-border/40" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <DeclaracionSelect
          id="perfil-tipo-contribuyente"
          label="Tipo de contribuyente"
          value={p.tipoContribuyente}
          onChange={(v) => update({ tipoContribuyente: v as typeof p.tipoContribuyente })}
          options={TIPO_CONTRIBUYENTE_OPTIONS}
          helperText="Selecciona la categoría que mejor describe tu situación"
        />
        <DeclaracionSelect
          id="perfil-actividad"
          label="Actividad económica principal"
          value={p.actividadEconomica}
          onChange={(v) => update({ actividadEconomica: v as typeof p.actividadEconomica })}
          options={ACTIVIDAD_OPTIONS}
        />
        <DeclaracionSelect
          id="perfil-ano-gravable"
          label="Año gravable"
          value={String(p.anoGravable)}
          onChange={(v) => update({ anoGravable: Number(v) })}
          options={ANO_GRAVABLE_OPTIONS}
          helperText="Año fiscal sobre el que declaras"
        />
      </div>

      <div className="space-y-4">
        <DeclaracionToggle
          label="¿Es gran contribuyente?"
          pressed={p.esGranContribuyente}
          onToggle={(v) => update({ esGranContribuyente: v })}
          helperText="Designados por resolución de la DIAN"
        />
        <DeclaracionToggle
          label="¿Es responsable de IVA?"
          pressed={p.esResponsableIVA}
          onToggle={(v) => update({ esResponsableIVA: v })}
          helperText="Régimen común del IVA"
        />
        <DeclaracionSelect
          id="perfil-anos-declarando"
          label="¿Cuántos años lleva declarando renta?"
          value={String(p.anosDeclarando)}
          onChange={(v) => update({ anosDeclarando: Number(v) })}
          options={[
            { value: "1", label: "Primera vez (anticipo 25%)" },
            { value: "2", label: "Segundo año (anticipo 50%)" },
            { value: "3", label: "Tercer año o más (anticipo 75%)" },
          ]}
          helperText="Art. 807 ET: el % del anticipo varía según la experiencia declarando"
        />
      </div>
    </div>
  );
}
