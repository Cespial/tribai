import Testing
import Foundation
@testable import SuperAppTributaria

struct CalendarioDataTests {

    // MARK: - Total Count

    @Test func totalObligacionesIs450() {
        #expect(CalendarioData.obligaciones.count == 450)
    }

    // MARK: - Obligation Names

    @Test func obligacionNamesIsNotEmpty() {
        #expect(!CalendarioData.obligacionNames.isEmpty)
    }

    @Test func obligacionNamesContainsRentaPN() {
        #expect(CalendarioData.obligacionNames.contains("Declaracion de Renta Personas Naturales"))
    }

    @Test func obligacionNamesContainsRentaPJ() {
        #expect(CalendarioData.obligacionNames.contains("Declaracion de Renta Personas Juridicas"))
    }

    @Test func obligacionNamesContainsRetencion() {
        #expect(CalendarioData.obligacionNames.contains("Retencion en la Fuente (mensual)"))
    }

    @Test func obligacionNamesContainsIVABimestral() {
        #expect(CalendarioData.obligacionNames.contains("IVA Bimestral"))
    }

    @Test func obligacionNamesAreUnique() {
        let names = CalendarioData.obligacionNames
        #expect(names.count == Set(names).count)
    }

    // MARK: - ID Uniqueness

    @Test func allIdsAreUnique() {
        let ids = CalendarioData.obligaciones.map(\.id)
        #expect(ids.count == Set(ids).count)
    }

    // MARK: - Date Format

    @Test func allDatesAreValidISO() {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        for deadline in CalendarioData.obligaciones {
            let date = formatter.date(from: deadline.fecha)
            #expect(date != nil, "Invalid date: \(deadline.fecha) for \(deadline.id)")
        }
    }

    // MARK: - Renta PN

    @Test func rentaPNHas50Entries() {
        let count = CalendarioData.obligaciones.filter {
            $0.obligacion == "Declaracion de Renta Personas Naturales"
        }.count
        #expect(count == 50)
    }

    @Test func rentaPNIsForNaturales() {
        let items = CalendarioData.obligaciones.filter {
            $0.obligacion == "Declaracion de Renta Personas Naturales"
        }
        for item in items {
            #expect(item.tipoContribuyente == .naturales)
        }
    }

    // MARK: - Renta PJ

    @Test func rentaPJHas10Entries() {
        let count = CalendarioData.obligaciones.filter {
            $0.obligacion == "Declaracion de Renta Personas Juridicas"
        }.count
        #expect(count == 10)
    }

    @Test func rentaPJIsForJuridicas() {
        let items = CalendarioData.obligaciones.filter {
            $0.obligacion == "Declaracion de Renta Personas Juridicas"
        }
        for item in items {
            #expect(item.tipoContribuyente == .juridicas)
        }
    }

    // MARK: - Retencion Mensual

    @Test func retencionMensualHas120Entries() {
        let count = CalendarioData.obligaciones.filter {
            $0.obligacion == "Retencion en la Fuente (mensual)"
        }.count
        #expect(count == 120)
    }

    // MARK: - CalendarDeadline computed props

    @Test func fechaDateParsesCorrectly() {
        let deadline = CalendarioData.obligaciones[0]
        #expect(deadline.fechaDate != nil)
    }

    @Test func mesNumeroDerived() {
        let augustDeadlines = CalendarioData.obligaciones.filter {
            $0.fecha.hasPrefix("2026-08")
        }
        for d in augustDeadlines {
            #expect(d.mesNumero == 8)
        }
    }

    // MARK: - Metadata

    @Test func disclaimerIsNotEmpty() {
        #expect(!CalendarioData.disclaimer.isEmpty)
    }

    @Test func lastUpdateIsSet() {
        #expect(!CalendarioData.lastUpdate.isEmpty)
    }

    // MARK: - Grandes Contribuyentes

    @Test func grandesContribuyentesExists() {
        let grandes = CalendarioData.obligaciones.filter {
            $0.tipoContribuyente == .grandes
        }
        #expect(!grandes.isEmpty)
    }
}
