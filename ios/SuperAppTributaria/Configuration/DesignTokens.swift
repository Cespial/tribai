import SwiftUI

// MARK: - Colors

enum ColorPalette {
    // Light mode base colors
    enum Light {
        static let background = Color(hex: 0xFAFAF9)
        static let foreground = Color(hex: 0x0F0E0D)
        static let card = Color.white
        static let cardForeground = Color(hex: 0x0F0E0D)
        static let muted = Color(hex: 0xF2F1F0)
        static let mutedForeground = Color(hex: 0x706D66)
        static let border = Color(hex: 0xE5E5E3)
        static let borderSecondary = Color(hex: 0xCCCAC6)
        static let primary = Color(hex: 0x0F0E0D)
        static let primaryForeground = Color(hex: 0xFAFAF9)
        static let accent = Color(hex: 0xF2F1F0)
        static let accentForeground = Color(hex: 0x0F0E0D)
        static let destructive = Color(hex: 0xDC2626)
        static let success = Color(hex: 0x16A34A)
    }

    // Dark mode base colors
    enum Dark {
        static let background = Color(hex: 0x0F0E0D)
        static let foreground = Color(hex: 0xFAFAF9)
        static let card = Color(hex: 0x1F1D1A)
        static let cardForeground = Color(hex: 0xFAFAF9)
        static let muted = Color(hex: 0x1F1D1A)
        static let mutedForeground = Color(hex: 0x8F8B85)
        static let border = Color(hex: 0x33312C)
        static let borderSecondary = Color(hex: 0x524F49)
        static let primary = Color(hex: 0xFAFAF9)
        static let primaryForeground = Color(hex: 0x0F0E0D)
        static let accent = Color(hex: 0x1F1D1A)
        static let accentForeground = Color(hex: 0xFAFAF9)
        static let destructive = Color(hex: 0xEF4444)
        static let success = Color(hex: 0x22C55E)
    }

    // Status colors
    static let vigente = Color(hex: 0x16A34A)    // green
    static let modificado = Color(hex: 0xEAB308)  // yellow
    static let derogado = Color(hex: 0xDC2626)    // red
}

// MARK: - Adaptive Colors

extension Color {
    static let appBackground = Color("Background")
    static let appForeground = Color("Foreground")
    static let appCard = Color("Card")
    static let appCardForeground = Color("CardForeground")
    static let appMuted = Color("Muted")
    static let appMutedForeground = Color("MutedForeground")
    static let appBorder = Color("Border")
    static let appBorderSecondary = Color("BorderSecondary")
    static let appPrimary = Color("AppPrimary")
    static let appPrimaryForeground = Color("PrimaryForeground")
    static let appAccent = Color("AppAccent")
    static let appAccentForeground = Color("AccentForeground")
    static let appDestructive = Color("Destructive")
    static let appSuccess = Color("Success")
}

// MARK: - Typography

enum AppTypography {
    static let heroDisplay = Font.custom("PlayfairDisplay-Regular", size: 56)
    static let pageHeading = Font.custom("PlayfairDisplay-Bold", size: 32)
    static let sectionHeading = Font.custom("PlayfairDisplay-SemiBold", size: 24)
    static let cardHeading = Font.system(size: 20, weight: .semibold)
    static let bodyLarge = Font.system(size: 18)
    static let bodyDefault = Font.system(size: 16)
    static let bodySmall = Font.system(size: 14)
    static let label = Font.system(size: 12, weight: .medium)
    static let caption = Font.system(size: 11)
    static let metricValue = Font.system(size: 28, weight: .bold, design: .rounded)
}

// MARK: - Spacing

enum AppSpacing {
    static let xs: CGFloat = 8
    static let sm: CGFloat = 16
    static let md: CGFloat = 32
    static let lg: CGFloat = 56
    static let xl: CGFloat = 112
}

// MARK: - Border Radius

enum AppRadius {
    static let button: CGFloat = 4
    static let input: CGFloat = 4
    static let card: CGFloat = 8
    static let pill: CGFloat = 9999
    static let modal: CGFloat = 12
}

// MARK: - Color Hex Init

extension Color {
    init(hex: UInt, alpha: Double = 1) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: alpha
        )
    }
}
