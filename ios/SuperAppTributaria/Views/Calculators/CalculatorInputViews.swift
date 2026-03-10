import SwiftUI

// MARK: - Currency Input Field

struct CurrencyInputField: View {
    let label: String
    @Binding var value: Decimal
    var placeholder: String = "$0"
    var isInvalid: Bool = false

    @State private var textValue: String = ""
    @FocusState private var isFocused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(AppTypography.label)
                .foregroundStyle(Color.appMutedForeground)

            HStack {
                Text("$")
                    .font(AppTypography.bodyDefault)
                    .foregroundStyle(Color.appMutedForeground)

                TextField(placeholder, text: $textValue)
                    .font(AppTypography.bodyDefault)
                    .keyboardType(.decimalPad)
                    .focused($isFocused)
                    .accessibilityLabel(label)
                    .onChange(of: textValue) { _, newValue in
                        let cleaned = newValue.replacingOccurrences(of: ".", with: "").replacingOccurrences(of: ",", with: "").replacingOccurrences(of: "-", with: "")
                        if let number = Decimal(string: cleaned) {
                            value = max(number, 0)
                        } else if cleaned.isEmpty {
                            value = 0
                        }
                    }
                    .toolbar {
                        ToolbarItemGroup(placement: .keyboard) {
                            Spacer()
                            Button("Listo") {
                                isFocused = false
                            }
                            .fontWeight(.medium)
                        }
                    }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .background(Color.appMuted)
            .clipShape(RoundedRectangle(cornerRadius: AppRadius.input))
            .overlay(
                RoundedRectangle(cornerRadius: AppRadius.input)
                    .stroke(isInvalid ? Color.appDestructive : Color.clear, lineWidth: 1.5)
            )
        }
        .onAppear {
            if value > 0 {
                textValue = CurrencyFormatter.number(value)
            }
        }
    }
}

// MARK: - Number Input Field

struct NumberInputField: View {
    let label: String
    @Binding var value: Int
    var placeholder: String = "0"

    @FocusState private var isFocused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(AppTypography.label)
                .foregroundStyle(Color.appMutedForeground)

            TextField(placeholder, value: $value, format: .number)
                .font(AppTypography.bodyDefault)
                .keyboardType(.numberPad)
                .focused($isFocused)
                .accessibilityLabel(label)
                .onChange(of: value) { _, newValue in
                    if newValue < 0 { value = 0 }
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 10)
                .background(Color.appMuted)
                .clipShape(RoundedRectangle(cornerRadius: AppRadius.input))
                .toolbar {
                    ToolbarItemGroup(placement: .keyboard) {
                        Spacer()
                        Button("Listo") {
                            isFocused = false
                        }
                        .fontWeight(.medium)
                    }
                }
        }
    }
}

// MARK: - Decimal Input Field

struct DecimalInputField: View {
    let label: String
    @Binding var value: Decimal
    var suffix: String = ""
    var placeholder: String = "0"

    @State private var textValue: String = ""
    @FocusState private var isFocused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(AppTypography.label)
                .foregroundStyle(Color.appMutedForeground)

            HStack {
                TextField(placeholder, text: $textValue)
                    .font(AppTypography.bodyDefault)
                    .keyboardType(.decimalPad)
                    .focused($isFocused)
                    .accessibilityLabel(label)
                    .onChange(of: textValue) { _, newValue in
                        let cleaned = newValue.replacingOccurrences(of: "-", with: "")
                        if cleaned != newValue { textValue = cleaned }
                        if let number = Decimal(string: cleaned) {
                            value = max(number, 0)
                        } else if cleaned.isEmpty {
                            value = 0
                        }
                    }
                    .toolbar {
                        ToolbarItemGroup(placement: .keyboard) {
                            Spacer()
                            Button("Listo") {
                                isFocused = false
                            }
                            .fontWeight(.medium)
                        }
                    }

                if !suffix.isEmpty {
                    Text(suffix)
                        .font(AppTypography.bodySmall)
                        .foregroundStyle(Color.appMutedForeground)
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .background(Color.appMuted)
            .clipShape(RoundedRectangle(cornerRadius: AppRadius.input))
        }
        .onAppear {
            if value > 0 {
                textValue = "\(value)"
            }
        }
    }
}

// MARK: - Percentage Input Field

struct PercentageInputField: View {
    let label: String
    @Binding var value: Decimal
    var placeholder: String = "0"

    @State private var textValue: String = ""
    @FocusState private var isFocused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(AppTypography.label)
                .foregroundStyle(Color.appMutedForeground)

            HStack {
                TextField(placeholder, text: $textValue)
                    .font(AppTypography.bodyDefault)
                    .keyboardType(.decimalPad)
                    .focused($isFocused)
                    .accessibilityLabel(label)
                    .onChange(of: textValue) { _, newValue in
                        let cleaned = newValue.replacingOccurrences(of: "-", with: "")
                        if cleaned != newValue { textValue = cleaned }
                        if let number = Decimal(string: cleaned) {
                            value = max(number, 0)
                        } else if newValue.isEmpty {
                            value = 0
                        }
                    }
                    .toolbar {
                        ToolbarItemGroup(placement: .keyboard) {
                            Spacer()
                            Button("Listo") {
                                isFocused = false
                            }
                            .fontWeight(.medium)
                        }
                    }
                Text("%")
                    .font(AppTypography.bodyDefault)
                    .foregroundStyle(Color.appMutedForeground)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .background(Color.appMuted)
            .clipShape(RoundedRectangle(cornerRadius: AppRadius.input))
        }
        .onAppear {
            if value > 0 {
                textValue = "\(value)"
            }
        }
    }
}

// MARK: - Calculate Button

struct CalculateButton: View {
    let title: String
    var isEnabled: Bool = true
    let action: () -> Void

    var body: some View {
        Button(action: {
            action()
            Haptics.success()
        }) {
            Text(title)
                .font(AppTypography.bodyDefault)
                .fontWeight(.semibold)
                .foregroundStyle(isEnabled ? Color.appPrimaryForeground : Color.appMutedForeground)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(isEnabled ? Color.appPrimary : Color.appMuted)
                .clipShape(RoundedRectangle(cornerRadius: AppRadius.button))
        }
        .buttonStyle(.plain)
        .disabled(!isEnabled)
        .accessibilityHint(isEnabled ? "Toca para realizar el calculo" : "Ingresa valores para calcular")
    }
}

// MARK: - Result Row

struct ResultRow: View {
    let label: String
    let value: String
    var isHighlighted: Bool = false

    var body: some View {
        HStack {
            Text(label)
                .font(isHighlighted ? AppTypography.bodyDefault : AppTypography.bodySmall)
                .fontWeight(isHighlighted ? .semibold : .regular)
                .foregroundStyle(Color.appForeground)
            Spacer()
            Text(value)
                .font(isHighlighted ? AppTypography.bodyDefault : AppTypography.bodySmall)
                .fontWeight(isHighlighted ? .bold : .medium)
                .foregroundStyle(isHighlighted ? Color.appForeground : Color.appMutedForeground)
        }
        .padding(.vertical, 4)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(label): \(value)")
    }
}
