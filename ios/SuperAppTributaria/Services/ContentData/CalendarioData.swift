import Foundation

// MARK: - CalendarioData — Calendario Tributario Colombia 2026

enum CalendarioData {

    // MARK: - Metadata

    static let disclaimer = "Fechas basadas en patrones historicos de la DIAN. Verifique contra la Resolucion oficial de la DIAN para 2026."
    static let lastUpdate = "2026-02-15"

    // MARK: - Unique Obligation Names

    static let obligacionNames: [String] = {
        var seen = Set<String>()
        var names: [String] = []
        for d in obligaciones {
            if seen.insert(d.obligacion).inserted {
                names.append(d.obligacion)
            }
        }
        return names
    }()

    // MARK: - ID Helper

    private static func makeId(obligacion: String, periodo: String, ultimoDigito: String) -> String {
        let slug = obligacion.lowercased().replacingOccurrences(of: " ", with: "-")
        return "\(slug)-\(periodo)-\(ultimoDigito)"
    }

    // MARK: - All Deadlines (430 entries)

    static let obligaciones: [CalendarDeadline] = {
        var all: [CalendarDeadline] = []

        // ──────────────────────────────────────────
        // 1. Declaracion de Renta Personas Naturales — 50 entries
        // ──────────────────────────────────────────

        let rentaPN = "Declaracion de Renta Personas Naturales"
        let rentaPNDesc = "Declaracion anual del impuesto sobre la renta y complementarios"
        let rentaPNData: [(String, String)] = [
            ("01-02", "2026-08-12"), ("03-04", "2026-08-13"), ("05-06", "2026-08-14"),
            ("07-08", "2026-08-18"), ("09-10", "2026-08-19"), ("11-12", "2026-08-20"),
            ("13-14", "2026-08-21"), ("15-16", "2026-08-25"), ("17-18", "2026-08-26"),
            ("19-20", "2026-08-27"), ("21-22", "2026-08-28"), ("23-24", "2026-09-01"),
            ("25-26", "2026-09-02"), ("27-28", "2026-09-03"), ("29-30", "2026-09-04"),
            ("31-32", "2026-09-08"), ("33-34", "2026-09-09"), ("35-36", "2026-09-10"),
            ("37-38", "2026-09-11"), ("39-40", "2026-09-15"), ("41-42", "2026-09-16"),
            ("43-44", "2026-09-17"), ("45-46", "2026-09-18"), ("47-48", "2026-09-22"),
            ("49-50", "2026-09-23"), ("51-52", "2026-09-24"), ("53-54", "2026-09-25"),
            ("55-56", "2026-09-29"), ("57-58", "2026-09-30"), ("59-60", "2026-10-01"),
            ("61-62", "2026-10-02"), ("63-64", "2026-10-06"), ("65-66", "2026-10-07"),
            ("67-68", "2026-10-08"), ("69-70", "2026-10-09"), ("71-72", "2026-10-14"),
            ("73-74", "2026-10-15"), ("75-76", "2026-10-16"), ("77-78", "2026-10-20"),
            ("79-80", "2026-10-21"), ("81-82", "2026-10-22"), ("83-84", "2026-10-23"),
            ("85-86", "2026-10-27"), ("87-88", "2026-10-28"), ("89-90", "2026-10-29"),
            ("91-92", "2026-10-30"), ("93-94", "2026-11-03"), ("95-96", "2026-11-04"),
            ("97-98", "2026-11-05"), ("99-00", "2026-11-06"),
        ]
        for (digito, fecha) in rentaPNData {
            all.append(CalendarDeadline(
                id: makeId(obligacion: rentaPN, periodo: "AG 2025", ultimoDigito: digito),
                obligacion: rentaPN,
                descripcion: rentaPNDesc,
                tipoContribuyente: .naturales,
                periodicidad: "anual",
                periodo: "AG 2025",
                ultimoDigito: digito,
                fecha: fecha
            ))
        }

        // ──────────────────────────────────────────
        // 2. Declaracion de Renta Personas Juridicas — 10 entries
        // ──────────────────────────────────────────

        let rentaPJ = "Declaracion de Renta Personas Juridicas"
        let rentaPJDesc = "Declaracion anual del impuesto sobre la renta sociedades"
        let rentaPJData: [(String, String)] = [
            ("1", "2026-04-14"), ("2", "2026-04-15"), ("3", "2026-04-16"),
            ("4", "2026-04-17"), ("5", "2026-04-20"), ("6", "2026-04-21"),
            ("7", "2026-04-22"), ("8", "2026-04-23"), ("9", "2026-04-24"),
            ("0", "2026-04-27"),
        ]
        for (digito, fecha) in rentaPJData {
            all.append(CalendarDeadline(
                id: makeId(obligacion: rentaPJ, periodo: "AG 2025", ultimoDigito: digito),
                obligacion: rentaPJ,
                descripcion: rentaPJDesc,
                tipoContribuyente: .juridicas,
                periodicidad: "anual",
                periodo: "AG 2025",
                ultimoDigito: digito,
                fecha: fecha
            ))
        }

        // ──────────────────────────────────────────
        // 3. Retencion en la Fuente (mensual) — 120 entries
        // ──────────────────────────────────────────

        let retencion = "Retencion en la Fuente (mensual)"
        let retencionDesc = "Declaracion y pago mensual de retenciones practicadas"

        // Enero 2026
        let retencionEnero: [(String, String)] = [
            ("1", "2026-02-11"), ("2", "2026-02-11"), ("3", "2026-02-12"),
            ("4", "2026-02-12"), ("5", "2026-02-13"), ("6", "2026-02-13"),
            ("7", "2026-02-16"), ("8", "2026-02-16"), ("9", "2026-02-17"),
            ("0", "2026-02-17"),
        ]
        for (digito, fecha) in retencionEnero {
            all.append(CalendarDeadline(
                id: makeId(obligacion: retencion, periodo: "Enero 2026", ultimoDigito: digito),
                obligacion: retencion,
                descripcion: retencionDesc,
                tipoContribuyente: .todos,
                periodicidad: "mensual",
                periodo: "Enero 2026",
                ultimoDigito: digito,
                fecha: fecha
            ))
        }

        // Febrero 2026
        let retencionFebrero: [(String, String)] = [
            ("1", "2026-03-11"), ("2", "2026-03-11"), ("3", "2026-03-12"),
            ("4", "2026-03-12"), ("5", "2026-03-13"), ("6", "2026-03-13"),
            ("7", "2026-03-16"), ("8", "2026-03-16"), ("9", "2026-03-17"),
            ("0", "2026-03-17"),
        ]
        for (digito, fecha) in retencionFebrero {
            all.append(CalendarDeadline(
                id: makeId(obligacion: retencion, periodo: "Febrero 2026", ultimoDigito: digito),
                obligacion: retencion,
                descripcion: retencionDesc,
                tipoContribuyente: .todos,
                periodicidad: "mensual",
                periodo: "Febrero 2026",
                ultimoDigito: digito,
                fecha: fecha
            ))
        }

        // Marzo 2026
        let retencionMarzo: [(String, String)] = [
            ("1", "2026-04-08"), ("2", "2026-04-08"), ("3", "2026-04-09"),
            ("4", "2026-04-09"), ("5", "2026-04-10"), ("6", "2026-04-10"),
            ("7", "2026-04-13"), ("8", "2026-04-13"), ("9", "2026-04-14"),
            ("0", "2026-04-14"),
        ]
        for (digito, fecha) in retencionMarzo {
            all.append(CalendarDeadline(
                id: makeId(obligacion: retencion, periodo: "Marzo 2026", ultimoDigito: digito),
                obligacion: retencion,
                descripcion: retencionDesc,
                tipoContribuyente: .todos,
                periodicidad: "mensual",
                periodo: "Marzo 2026",
                ultimoDigito: digito,
                fecha: fecha
            ))
        }

        // Abril 2026
        let retencionAbril: [(String, String)] = [
            ("1", "2026-05-12"), ("2", "2026-05-12"), ("3", "2026-05-13"),
            ("4", "2026-05-13"), ("5", "2026-05-14"), ("6", "2026-05-14"),
            ("7", "2026-05-15"), ("8", "2026-05-15"), ("9", "2026-05-18"),
            ("0", "2026-05-18"),
        ]
        for (digito, fecha) in retencionAbril {
            all.append(CalendarDeadline(
                id: makeId(obligacion: retencion, periodo: "Abril 2026", ultimoDigito: digito),
                obligacion: retencion,
                descripcion: retencionDesc,
                tipoContribuyente: .todos,
                periodicidad: "mensual",
                periodo: "Abril 2026",
                ultimoDigito: digito,
                fecha: fecha
            ))
        }

        // Mayo 2026
        let retencionMayo: [(String, String)] = [
            ("1", "2026-06-10"), ("2", "2026-06-10"), ("3", "2026-06-11"),
            ("4", "2026-06-11"), ("5", "2026-06-12"), ("6", "2026-06-12"),
            ("7", "2026-06-15"), ("8", "2026-06-15"), ("9", "2026-06-16"),
            ("0", "2026-06-16"),
        ]
        for (digito, fecha) in retencionMayo {
            all.append(CalendarDeadline(
                id: makeId(obligacion: retencion, periodo: "Mayo 2026", ultimoDigito: digito),
                obligacion: retencion,
                descripcion: retencionDesc,
                tipoContribuyente: .todos,
                periodicidad: "mensual",
                periodo: "Mayo 2026",
                ultimoDigito: digito,
                fecha: fecha
            ))
        }

        // Junio 2026
        let retencionJunio: [(String, String)] = [
            ("1", "2026-07-09"), ("2", "2026-07-09"), ("3", "2026-07-10"),
            ("4", "2026-07-10"), ("5", "2026-07-13"), ("6", "2026-07-13"),
            ("7", "2026-07-14"), ("8", "2026-07-14"), ("9", "2026-07-15"),
            ("0", "2026-07-15"),
        ]
        for (digito, fecha) in retencionJunio {
            all.append(CalendarDeadline(
                id: makeId(obligacion: retencion, periodo: "Junio 2026", ultimoDigito: digito),
                obligacion: retencion,
                descripcion: retencionDesc,
                tipoContribuyente: .todos,
                periodicidad: "mensual",
                periodo: "Junio 2026",
                ultimoDigito: digito,
                fecha: fecha
            ))
        }

        // Julio 2026
        let retencionJulio: [(String, String)] = [
            ("1", "2026-08-11"), ("2", "2026-08-11"), ("3", "2026-08-12"),
            ("4", "2026-08-12"), ("5", "2026-08-13"), ("6", "2026-08-13"),
            ("7", "2026-08-14"), ("8", "2026-08-14"), ("9", "2026-08-17"),
            ("0", "2026-08-17"),
        ]
        for (digito, fecha) in retencionJulio {
            all.append(CalendarDeadline(
                id: makeId(obligacion: retencion, periodo: "Julio 2026", ultimoDigito: digito),
                obligacion: retencion,
                descripcion: retencionDesc,
                tipoContribuyente: .todos,
                periodicidad: "mensual",
                periodo: "Julio 2026",
                ultimoDigito: digito,
                fecha: fecha
            ))
        }

        // Agosto 2026
        let retencionAgosto: [(String, String)] = [
            ("1", "2026-09-09"), ("2", "2026-09-09"), ("3", "2026-09-10"),
            ("4", "2026-09-10"), ("5", "2026-09-11"), ("6", "2026-09-11"),
            ("7", "2026-09-14"), ("8", "2026-09-14"), ("9", "2026-09-15"),
            ("0", "2026-09-15"),
        ]
        for (digito, fecha) in retencionAgosto {
            all.append(CalendarDeadline(
                id: makeId(obligacion: retencion, periodo: "Agosto 2026", ultimoDigito: digito),
                obligacion: retencion,
                descripcion: retencionDesc,
                tipoContribuyente: .todos,
                periodicidad: "mensual",
                periodo: "Agosto 2026",
                ultimoDigito: digito,
                fecha: fecha
            ))
        }

        // Septiembre 2026
        let retencionSeptiembre: [(String, String)] = [
            ("1", "2026-10-09"), ("2", "2026-10-09"), ("3", "2026-10-13"),
            ("4", "2026-10-13"), ("5", "2026-10-14"), ("6", "2026-10-14"),
            ("7", "2026-10-15"), ("8", "2026-10-15"), ("9", "2026-10-16"),
            ("0", "2026-10-16"),
        ]
        for (digito, fecha) in retencionSeptiembre {
            all.append(CalendarDeadline(
                id: makeId(obligacion: retencion, periodo: "Septiembre 2026", ultimoDigito: digito),
                obligacion: retencion,
                descripcion: retencionDesc,
                tipoContribuyente: .todos,
                periodicidad: "mensual",
                periodo: "Septiembre 2026",
                ultimoDigito: digito,
                fecha: fecha
            ))
        }

        // Octubre 2026
        let retencionOctubre: [(String, String)] = [
            ("1", "2026-11-10"), ("2", "2026-11-10"), ("3", "2026-11-11"),
            ("4", "2026-11-11"), ("5", "2026-11-12"), ("6", "2026-11-12"),
            ("7", "2026-11-13"), ("8", "2026-11-13"), ("9", "2026-11-16"),
            ("0", "2026-11-16"),
        ]
        for (digito, fecha) in retencionOctubre {
            all.append(CalendarDeadline(
                id: makeId(obligacion: retencion, periodo: "Octubre 2026", ultimoDigito: digito),
                obligacion: retencion,
                descripcion: retencionDesc,
                tipoContribuyente: .todos,
                periodicidad: "mensual",
                periodo: "Octubre 2026",
                ultimoDigito: digito,
                fecha: fecha
            ))
        }

        // Noviembre 2026
        let retencionNoviembre: [(String, String)] = [
            ("1", "2026-12-09"), ("2", "2026-12-09"), ("3", "2026-12-10"),
            ("4", "2026-12-10"), ("5", "2026-12-11"), ("6", "2026-12-11"),
            ("7", "2026-12-14"), ("8", "2026-12-14"), ("9", "2026-12-15"),
            ("0", "2026-12-15"),
        ]
        for (digito, fecha) in retencionNoviembre {
            all.append(CalendarDeadline(
                id: makeId(obligacion: retencion, periodo: "Noviembre 2026", ultimoDigito: digito),
                obligacion: retencion,
                descripcion: retencionDesc,
                tipoContribuyente: .todos,
                periodicidad: "mensual",
                periodo: "Noviembre 2026",
                ultimoDigito: digito,
                fecha: fecha
            ))
        }

        // Diciembre 2026
        let retencionDiciembre: [(String, String)] = [
            ("1", "2027-01-12"), ("2", "2027-01-12"), ("3", "2027-01-13"),
            ("4", "2027-01-13"), ("5", "2027-01-14"), ("6", "2027-01-14"),
            ("7", "2027-01-15"), ("8", "2027-01-15"), ("9", "2027-01-19"),
            ("0", "2027-01-19"),
        ]
        for (digito, fecha) in retencionDiciembre {
            all.append(CalendarDeadline(
                id: makeId(obligacion: retencion, periodo: "Diciembre 2026", ultimoDigito: digito),
                obligacion: retencion,
                descripcion: retencionDesc,
                tipoContribuyente: .todos,
                periodicidad: "mensual",
                periodo: "Diciembre 2026",
                ultimoDigito: digito,
                fecha: fecha
            ))
        }

        // ──────────────────────────────────────────
        // 4. IVA Bimestral — 60 entries
        // ──────────────────────────────────────────

        let ivaBim = "IVA Bimestral"
        let ivaBimDesc = "Declaracion bimestral del impuesto sobre las ventas"

        let ivaBimPeriodos: [(String, [(String, String)])] = [
            ("Ene-Feb 2026", [
                ("1", "2026-03-11"), ("2", "2026-03-11"), ("3", "2026-03-12"),
                ("4", "2026-03-12"), ("5", "2026-03-13"), ("6", "2026-03-13"),
                ("7", "2026-03-16"), ("8", "2026-03-16"), ("9", "2026-03-17"),
                ("0", "2026-03-17"),
            ]),
            ("Mar-Abr 2026", [
                ("1", "2026-05-12"), ("2", "2026-05-12"), ("3", "2026-05-13"),
                ("4", "2026-05-13"), ("5", "2026-05-14"), ("6", "2026-05-14"),
                ("7", "2026-05-15"), ("8", "2026-05-15"), ("9", "2026-05-18"),
                ("0", "2026-05-18"),
            ]),
            ("May-Jun 2026", [
                ("1", "2026-07-09"), ("2", "2026-07-09"), ("3", "2026-07-10"),
                ("4", "2026-07-10"), ("5", "2026-07-13"), ("6", "2026-07-13"),
                ("7", "2026-07-14"), ("8", "2026-07-14"), ("9", "2026-07-15"),
                ("0", "2026-07-15"),
            ]),
            ("Jul-Ago 2026", [
                ("1", "2026-09-09"), ("2", "2026-09-09"), ("3", "2026-09-10"),
                ("4", "2026-09-10"), ("5", "2026-09-11"), ("6", "2026-09-11"),
                ("7", "2026-09-14"), ("8", "2026-09-14"), ("9", "2026-09-15"),
                ("0", "2026-09-15"),
            ]),
            ("Sep-Oct 2026", [
                ("1", "2026-11-10"), ("2", "2026-11-10"), ("3", "2026-11-11"),
                ("4", "2026-11-11"), ("5", "2026-11-12"), ("6", "2026-11-12"),
                ("7", "2026-11-13"), ("8", "2026-11-13"), ("9", "2026-11-16"),
                ("0", "2026-11-16"),
            ]),
            ("Nov-Dic 2026", [
                ("1", "2027-01-12"), ("2", "2027-01-12"), ("3", "2027-01-13"),
                ("4", "2027-01-13"), ("5", "2027-01-14"), ("6", "2027-01-14"),
                ("7", "2027-01-15"), ("8", "2027-01-15"), ("9", "2027-01-19"),
                ("0", "2027-01-19"),
            ]),
        ]
        for (periodo, entries) in ivaBimPeriodos {
            for (digito, fecha) in entries {
                all.append(CalendarDeadline(
                    id: makeId(obligacion: ivaBim, periodo: periodo, ultimoDigito: digito),
                    obligacion: ivaBim,
                    descripcion: ivaBimDesc,
                    tipoContribuyente: .todos,
                    periodicidad: "bimestral",
                    periodo: periodo,
                    ultimoDigito: digito,
                    fecha: fecha
                ))
            }
        }

        // ──────────────────────────────────────────
        // 5. IVA Cuatrimestral — 30 entries
        // ──────────────────────────────────────────

        let ivaCuat = "IVA Cuatrimestral"
        let ivaCuatDesc = "Declaracion cuatrimestral del impuesto sobre las ventas para contribuyentes con menores ingresos"

        let ivaCuatPeriodos: [(String, [(String, String)])] = [
            ("Ene-Abr 2026", [
                ("1", "2026-05-12"), ("2", "2026-05-12"), ("3", "2026-05-13"),
                ("4", "2026-05-13"), ("5", "2026-05-14"), ("6", "2026-05-14"),
                ("7", "2026-05-15"), ("8", "2026-05-15"), ("9", "2026-05-18"),
                ("0", "2026-05-18"),
            ]),
            ("May-Ago 2026", [
                ("1", "2026-09-09"), ("2", "2026-09-09"), ("3", "2026-09-10"),
                ("4", "2026-09-10"), ("5", "2026-09-11"), ("6", "2026-09-11"),
                ("7", "2026-09-14"), ("8", "2026-09-14"), ("9", "2026-09-15"),
                ("0", "2026-09-15"),
            ]),
            ("Sep-Dic 2026", [
                ("1", "2027-01-12"), ("2", "2027-01-12"), ("3", "2027-01-13"),
                ("4", "2027-01-13"), ("5", "2027-01-14"), ("6", "2027-01-14"),
                ("7", "2027-01-15"), ("8", "2027-01-15"), ("9", "2027-01-19"),
                ("0", "2027-01-19"),
            ]),
        ]
        for (periodo, entries) in ivaCuatPeriodos {
            for (digito, fecha) in entries {
                all.append(CalendarDeadline(
                    id: makeId(obligacion: ivaCuat, periodo: periodo, ultimoDigito: digito),
                    obligacion: ivaCuat,
                    descripcion: ivaCuatDesc,
                    tipoContribuyente: .todos,
                    periodicidad: "cuatrimestral",
                    periodo: periodo,
                    ultimoDigito: digito,
                    fecha: fecha
                ))
            }
        }

        // ──────────────────────────────────────────
        // 6. SIMPLE Anticipo Bimestral — 60 entries
        // ──────────────────────────────────────────

        let simpleBim = "SIMPLE Anticipo Bimestral"
        let simpleBimDesc = "Anticipo bimestral del Regimen Simple de Tributacion (RST)"

        let simpleBimPeriodos: [(String, [(String, String)])] = [
            ("Ene-Feb 2026", [
                ("1", "2026-03-18"), ("2", "2026-03-18"), ("3", "2026-03-19"),
                ("4", "2026-03-19"), ("5", "2026-03-20"), ("6", "2026-03-20"),
                ("7", "2026-03-23"), ("8", "2026-03-23"), ("9", "2026-03-24"),
                ("0", "2026-03-24"),
            ]),
            ("Mar-Abr 2026", [
                ("1", "2026-05-19"), ("2", "2026-05-19"), ("3", "2026-05-20"),
                ("4", "2026-05-20"), ("5", "2026-05-21"), ("6", "2026-05-21"),
                ("7", "2026-05-22"), ("8", "2026-05-22"), ("9", "2026-05-25"),
                ("0", "2026-05-25"),
            ]),
            ("May-Jun 2026", [
                ("1", "2026-07-16"), ("2", "2026-07-16"), ("3", "2026-07-17"),
                ("4", "2026-07-17"), ("5", "2026-07-20"), ("6", "2026-07-20"),
                ("7", "2026-07-21"), ("8", "2026-07-21"), ("9", "2026-07-22"),
                ("0", "2026-07-22"),
            ]),
            ("Jul-Ago 2026", [
                ("1", "2026-09-16"), ("2", "2026-09-16"), ("3", "2026-09-17"),
                ("4", "2026-09-17"), ("5", "2026-09-18"), ("6", "2026-09-18"),
                ("7", "2026-09-21"), ("8", "2026-09-21"), ("9", "2026-09-22"),
                ("0", "2026-09-22"),
            ]),
            ("Sep-Oct 2026", [
                ("1", "2026-11-17"), ("2", "2026-11-17"), ("3", "2026-11-18"),
                ("4", "2026-11-18"), ("5", "2026-11-19"), ("6", "2026-11-19"),
                ("7", "2026-11-20"), ("8", "2026-11-20"), ("9", "2026-11-23"),
                ("0", "2026-11-23"),
            ]),
            ("Nov-Dic 2026", [
                ("1", "2027-01-20"), ("2", "2027-01-20"), ("3", "2027-01-21"),
                ("4", "2027-01-21"), ("5", "2027-01-22"), ("6", "2027-01-22"),
                ("7", "2027-01-23"), ("8", "2027-01-23"), ("9", "2027-01-26"),
                ("0", "2027-01-26"),
            ]),
        ]
        for (periodo, entries) in simpleBimPeriodos {
            for (digito, fecha) in entries {
                all.append(CalendarDeadline(
                    id: makeId(obligacion: simpleBim, periodo: periodo, ultimoDigito: digito),
                    obligacion: simpleBim,
                    descripcion: simpleBimDesc,
                    tipoContribuyente: .todos,
                    periodicidad: "bimestral",
                    periodo: periodo,
                    ultimoDigito: digito,
                    fecha: fecha
                ))
            }
        }

        // ──────────────────────────────────────────
        // 7. SIMPLE Declaracion Anual — 10 entries
        // ──────────────────────────────────────────

        let simpleAnual = "SIMPLE Declaracion Anual"
        let simpleAnualDesc = "Declaracion anual consolidada del Regimen Simple de Tributacion (RST)"
        let simpleAnualData: [(String, String)] = [
            ("1", "2026-10-13"), ("2", "2026-10-13"), ("3", "2026-10-14"),
            ("4", "2026-10-14"), ("5", "2026-10-15"), ("6", "2026-10-15"),
            ("7", "2026-10-16"), ("8", "2026-10-16"), ("9", "2026-10-19"),
            ("0", "2026-10-19"),
        ]
        for (digito, fecha) in simpleAnualData {
            all.append(CalendarDeadline(
                id: makeId(obligacion: simpleAnual, periodo: "AG 2025", ultimoDigito: digito),
                obligacion: simpleAnual,
                descripcion: simpleAnualDesc,
                tipoContribuyente: .todos,
                periodicidad: "anual",
                periodo: "AG 2025",
                ultimoDigito: digito,
                fecha: fecha
            ))
        }

        // ──────────────────────────────────────────
        // 8. ICA Bogota Bimestral — 60 entries
        // ──────────────────────────────────────────

        let icaBog = "ICA Bogota Bimestral"
        let icaBogDesc = "Impuesto de Industria y Comercio, Avisos y Tableros - Bogota D.C."

        let icaBogPeriodos: [(String, [(String, String)])] = [
            ("Ene-Feb 2026", [
                ("1", "2026-03-18"), ("2", "2026-03-19"), ("3", "2026-03-20"),
                ("4", "2026-03-23"), ("5", "2026-03-24"), ("6", "2026-03-25"),
                ("7", "2026-03-26"), ("8", "2026-03-27"), ("9", "2026-03-30"),
                ("0", "2026-03-31"),
            ]),
            ("Mar-Abr 2026", [
                ("1", "2026-05-19"), ("2", "2026-05-20"), ("3", "2026-05-21"),
                ("4", "2026-05-22"), ("5", "2026-05-25"), ("6", "2026-05-26"),
                ("7", "2026-05-27"), ("8", "2026-05-28"), ("9", "2026-05-29"),
                ("0", "2026-06-01"),
            ]),
            ("May-Jun 2026", [
                ("1", "2026-07-16"), ("2", "2026-07-17"), ("3", "2026-07-20"),
                ("4", "2026-07-21"), ("5", "2026-07-22"), ("6", "2026-07-23"),
                ("7", "2026-07-24"), ("8", "2026-07-27"), ("9", "2026-07-28"),
                ("0", "2026-07-29"),
            ]),
            ("Jul-Ago 2026", [
                ("1", "2026-09-16"), ("2", "2026-09-17"), ("3", "2026-09-18"),
                ("4", "2026-09-21"), ("5", "2026-09-22"), ("6", "2026-09-23"),
                ("7", "2026-09-24"), ("8", "2026-09-25"), ("9", "2026-09-28"),
                ("0", "2026-09-29"),
            ]),
            ("Sep-Oct 2026", [
                ("1", "2026-11-17"), ("2", "2026-11-18"), ("3", "2026-11-19"),
                ("4", "2026-11-20"), ("5", "2026-11-23"), ("6", "2026-11-24"),
                ("7", "2026-11-25"), ("8", "2026-11-26"), ("9", "2026-11-27"),
                ("0", "2026-11-30"),
            ]),
            ("Nov-Dic 2026", [
                ("1", "2027-01-20"), ("2", "2027-01-21"), ("3", "2027-01-22"),
                ("4", "2027-01-23"), ("5", "2027-01-26"), ("6", "2027-01-27"),
                ("7", "2027-01-28"), ("8", "2027-01-29"), ("9", "2027-01-30"),
                ("0", "2027-02-02"),
            ]),
        ]
        for (periodo, entries) in icaBogPeriodos {
            for (digito, fecha) in entries {
                all.append(CalendarDeadline(
                    id: makeId(obligacion: icaBog, periodo: periodo, ultimoDigito: digito),
                    obligacion: icaBog,
                    descripcion: icaBogDesc,
                    tipoContribuyente: .todos,
                    periodicidad: "bimestral",
                    periodo: periodo,
                    ultimoDigito: digito,
                    fecha: fecha
                ))
            }
        }

        // ──────────────────────────────────────────
        // 9. Impuesto al Patrimonio — 10 entries
        // ──────────────────────────────────────────

        let patrimonio = "Impuesto al Patrimonio"
        let patrimonioDesc = "Declaracion y pago del impuesto al patrimonio para patrimonios superiores a 72.000 UVT"
        let patrimonioData: [(String, String)] = [
            ("1", "2026-05-12"), ("2", "2026-05-12"), ("3", "2026-05-13"),
            ("4", "2026-05-13"), ("5", "2026-05-14"), ("6", "2026-05-14"),
            ("7", "2026-05-15"), ("8", "2026-05-15"), ("9", "2026-05-18"),
            ("0", "2026-05-18"),
        ]
        for (digito, fecha) in patrimonioData {
            all.append(CalendarDeadline(
                id: makeId(obligacion: patrimonio, periodo: "AG 2025", ultimoDigito: digito),
                obligacion: patrimonio,
                descripcion: patrimonioDesc,
                tipoContribuyente: .todos,
                periodicidad: "anual",
                periodo: "AG 2025",
                ultimoDigito: digito,
                fecha: fecha
            ))
        }

        // ──────────────────────────────────────────
        // 10. Activos en el Exterior — 10 entries
        // ──────────────────────────────────────────

        let activos = "Activos en el Exterior"
        let activosDesc = "Declaracion informativa de activos en el exterior (formulario 160)"
        let activosData: [(String, String)] = [
            ("1", "2026-05-12"), ("2", "2026-05-12"), ("3", "2026-05-13"),
            ("4", "2026-05-13"), ("5", "2026-05-14"), ("6", "2026-05-14"),
            ("7", "2026-05-15"), ("8", "2026-05-15"), ("9", "2026-05-18"),
            ("0", "2026-05-18"),
        ]
        for (digito, fecha) in activosData {
            all.append(CalendarDeadline(
                id: makeId(obligacion: activos, periodo: "AG 2025", ultimoDigito: digito),
                obligacion: activos,
                descripcion: activosDesc,
                tipoContribuyente: .todos,
                periodicidad: "anual",
                periodo: "AG 2025",
                ultimoDigito: digito,
                fecha: fecha
            ))
        }

        // ──────────────────────────────────────────
        // 11. Grandes Contribuyentes Renta - Primera Cuota — 10 entries
        // ──────────────────────────────────────────

        let grandesCuota1 = "Grandes Contribuyentes Renta - Primera Cuota"
        let grandesCuota1Desc = "Primera cuota del impuesto sobre la renta para grandes contribuyentes"
        let grandesCuota1Data: [(String, String)] = [
            ("1", "2026-02-11"), ("2", "2026-02-11"), ("3", "2026-02-12"),
            ("4", "2026-02-12"), ("5", "2026-02-13"), ("6", "2026-02-13"),
            ("7", "2026-02-16"), ("8", "2026-02-16"), ("9", "2026-02-17"),
            ("0", "2026-02-17"),
        ]
        for (digito, fecha) in grandesCuota1Data {
            all.append(CalendarDeadline(
                id: makeId(obligacion: grandesCuota1, periodo: "AG 2025 - Cuota 1", ultimoDigito: digito),
                obligacion: grandesCuota1,
                descripcion: grandesCuota1Desc,
                tipoContribuyente: .grandes,
                periodicidad: "anual",
                periodo: "AG 2025 - Cuota 1",
                ultimoDigito: digito,
                fecha: fecha
            ))
        }

        // ──────────────────────────────────────────
        // 12. Grandes Contribuyentes Renta - Segunda Cuota — 10 entries
        // ──────────────────────────────────────────

        let grandesCuota2 = "Grandes Contribuyentes Renta - Segunda Cuota"
        let grandesCuota2Desc = "Segunda cuota del impuesto sobre la renta para grandes contribuyentes"
        let grandesCuota2Data: [(String, String)] = [
            ("1", "2026-04-14"), ("2", "2026-04-14"), ("3", "2026-04-15"),
            ("4", "2026-04-15"), ("5", "2026-04-16"), ("6", "2026-04-16"),
            ("7", "2026-04-17"), ("8", "2026-04-17"), ("9", "2026-04-20"),
            ("0", "2026-04-20"),
        ]
        for (digito, fecha) in grandesCuota2Data {
            all.append(CalendarDeadline(
                id: makeId(obligacion: grandesCuota2, periodo: "AG 2025 - Cuota 2", ultimoDigito: digito),
                obligacion: grandesCuota2,
                descripcion: grandesCuota2Desc,
                tipoContribuyente: .grandes,
                periodicidad: "anual",
                periodo: "AG 2025 - Cuota 2",
                ultimoDigito: digito,
                fecha: fecha
            ))
        }

        // ──────────────────────────────────────────
        // 13. GMF Declaracion Informativa — 10 entries
        // ──────────────────────────────────────────

        let gmf = "GMF Declaracion Informativa"
        let gmfDesc = "Declaracion anual informativa del Gravamen a los Movimientos Financieros (4x1000)"
        let gmfData: [(String, String)] = [
            ("1", "2026-03-18"), ("2", "2026-03-18"), ("3", "2026-03-19"),
            ("4", "2026-03-19"), ("5", "2026-03-20"), ("6", "2026-03-20"),
            ("7", "2026-03-23"), ("8", "2026-03-23"), ("9", "2026-03-24"),
            ("0", "2026-03-24"),
        ]
        for (digito, fecha) in gmfData {
            all.append(CalendarDeadline(
                id: makeId(obligacion: gmf, periodo: "AG 2025", ultimoDigito: digito),
                obligacion: gmf,
                descripcion: gmfDesc,
                tipoContribuyente: .todos,
                periodicidad: "anual",
                periodo: "AG 2025",
                ultimoDigito: digito,
                fecha: fecha
            ))
        }

        return all
    }()
}
