"use client";

import { useDeclaracionJuridica } from "@/lib/declaracion-renta-juridicas/declaracion-juridica-context";
import { UVT_VALUES } from "@/config/tax-data";
import type { ResultadoDeclaracionJuridica } from "@/lib/declaracion-renta-juridicas/types";
import { DeclaracionCurrencyInput } from "@/components/declaracion-renta/fields/DeclaracionCurrencyInput";

interface StepProps {
  resultado: ResultadoDeclaracionJuridica;
}

export function StepJ07RentasExentas({ resultado }: StepProps) {
  const { state, dispatch } = useDeclaracionJuridica();
  const re = state.rentasExentas;
  const uvt = UVT_VALUES[state.perfil.anoGravable] ?? 49_799;

  const update = (payload: Partial<typeof re>) =>
    dispatch({ type: "UPDATE_RENTAS_EXENTAS", payload });

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <p className="text-sm text-foreground">
          Rentas exentas aplicables según el régimen tributario de la empresa.
          Casilla 71 del Formulario 110. Si no tiene rentas exentas, puede saltar este paso.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DeclaracionCurrencyInput
          id="re-hotelero"
          label="Sector hotelero y turismo"
          value={re.hoteleroTurismo}
          onChange={(v) => update({ hoteleroTurismo: v })}
          uvtEquivalent={re.hoteleroTurismo / uvt}
          articuloET="207-2"
          tooltipText="Rentas exentas por servicios hoteleros. Art. 207-2 numerales 3-5 ET."
        />
        <DeclaracionCurrencyInput
          id="re-energia"
          label="Energía renovable"
          value={re.energiaRenovable}
          onChange={(v) => update({ energiaRenovable: v })}
          uvtEquivalent={re.energiaRenovable / uvt}
          articuloET="235-2"
          tooltipText="Rentas exentas por generación de energía con fuentes no convencionales. Art. 235-2 num. 3."
        />
        <DeclaracionCurrencyInput
          id="re-vivienda"
          label="Vivienda VIS/VIP"
          value={re.viviendaVISVIP}
          onChange={(v) => update({ viviendaVISVIP: v })}
          uvtEquivalent={re.viviendaVISVIP / uvt}
          articuloET="235-2"
          tooltipText="Rentas exentas por enajenación de predios con vivienda VIS/VIP. Art. 235-2 num. 4."
        />
        <DeclaracionCurrencyInput
          id="re-forestal"
          label="Plantaciones forestales"
          value={re.plantacionesForestales}
          onChange={(v) => update({ plantacionesForestales: v })}
          uvtEquivalent={re.plantacionesForestales / uvt}
          articuloET="235-2"
        />
        <DeclaracionCurrencyInput
          id="re-pensiones"
          label="Reservas para pensiones"
          value={re.reservasPensiones}
          onChange={(v) => update({ reservasPensiones: v })}
          uvtEquivalent={re.reservasPensiones / uvt}
          articuloET="235-2"
        />
        <DeclaracionCurrencyInput
          id="re-literarias"
          label="Creaciones literarias"
          value={re.creacionesLiterarias}
          onChange={(v) => update({ creacionesLiterarias: v })}
          uvtEquivalent={re.creacionesLiterarias / uvt}
          articuloET="235-2"
        />
        <DeclaracionCurrencyInput
          id="re-cine"
          label="Cinematografía"
          value={re.cinematografia}
          onChange={(v) => update({ cinematografia: v })}
          uvtEquivalent={re.cinematografia / uvt}
          tooltipText="Rentas exentas por producción cinematográfica. Ley 397/1997."
        />
        <DeclaracionCurrencyInput
          id="re-cdi"
          label="Convenios para evitar doble imposición"
          value={re.conveniosCDI}
          onChange={(v) => update({ conveniosCDI: v })}
          uvtEquivalent={re.conveniosCDI / uvt}
          tooltipText="Rentas exentas por aplicación de convenios de doble imposición (CDI)."
        />
        <DeclaracionCurrencyInput
          id="re-otras"
          label="Otras rentas exentas"
          value={re.otrasRentasExentas}
          onChange={(v) => update({ otrasRentasExentas: v })}
          uvtEquivalent={re.otrasRentasExentas / uvt}
        />
      </div>

      {resultado.depuracion.rentasExentas > 0 && (
        <div className="rounded-md border border-border/60 bg-muted/30 p-4 text-center">
          <p className="text-[11px] text-muted-foreground">Total rentas exentas (Cas 71)</p>
          <p className="font-values text-lg font-semibold text-foreground">
            ${resultado.depuracion.rentasExentas.toLocaleString("es-CO")}
          </p>
        </div>
      )}
    </div>
  );
}
