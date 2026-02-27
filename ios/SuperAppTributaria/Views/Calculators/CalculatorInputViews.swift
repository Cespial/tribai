import SwiftUI

// MARK: - Currency Input Field

struct CurrencyInputField: View {
    let label: String
    @Binding var value: Decimal
    var placeholder: String = "$0"

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
                    .keyboardType(.numberPad)
                    .focused($isFocused)
                    .onChange(of: textValue) { _, newValue in
                        let cleaned = newValue.replacingOccurrences(of: ".", with: "").replacingOccurrences(of: ",", with: "")
                        if let number = Decimal(string: cleaned) {
                            value = number
                        } else if cleaned.isEmpty {
                            value = 0
                        }
                    }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .background(Color.appMuted)
            .clipShape(RoundedRectangle(cornerRadius: AppRadius.input))
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

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(AppTypography.label)
                .foregroundStyle(Color.appMutedForeground)

            TextField(placeholder, value: $value, format: .number)
                .font(AppTypography.bodyDefault)
                .keyboardType(.numberPad)
                .padding(.horizontal, 12)
                .padding(.vertical, 10)
                .background(Color.appMuted)
                .clipShape(RoundedRectangle(cornerRadius: AppRadius.input))
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

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(AppTypography.label)
                .foregroundStyle(Color.appMutedForeground)

            HStack {
                TextField(placeholder, text: $textValue)
                    .font(AppTypography.bodyDefault)
                    .keyboardType(.decimalPad)
                    .onChange(of: textValue) { _, newValue in
                        if let number = Decimal(string: newValue) {
                            value = number
                        } else if newValue.isEmpty {
                            value = 0
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

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(AppTypography.label)
                .foregroundStyle(Color.appMutedForeground)

            HStack {
                TextField(placeholder, text: $textValue)
                    .font(AppTypography.bodyDefault)
                    .keyboardType(.decimalPad)
                    .onChange(of: textValue) { _, newValue in
                        if let number = Decimal(string: newValue) {
                            value = number
                        } else if newValue.isEmpty {
                            value = 0
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
    let action: () -> Void

    var body: some View {
        Button(action: {
            action()
            Haptics.success()
        }) {
            Text(title)
                .font(AppTypography.bodyDefault)
                .fontWeight(.semibold)
                .foregroundStyle(Color.appPrimaryForeground)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Color.appPrimary)
                .clipShape(RoundedRectangle(cornerRadius: AppRadius.button))
        }
        .buttonStyle(.plain)
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
    }
}
