import AppIntents

struct CalculatorShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: ConvertUVTIntent(),
            phrases: [
                "Convertir UVT a pesos en \(.applicationName)",
                "Cuanto es en UVT con \(.applicationName)",
                "Calcular UVT con \(.applicationName)",
            ],
            shortTitle: "Convertir UVT",
            systemImageName: "coloncurrencysign.arrow.trianglehead.counterclockwise.rotate.90"
        )
    }
}
