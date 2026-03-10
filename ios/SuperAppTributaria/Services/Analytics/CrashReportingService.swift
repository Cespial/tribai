import Foundation
import Sentry

/// Lightweight wrapper around the Sentry SDK for crash reporting, breadcrumbs,
/// and error capture.
///
/// Usage:
/// ```swift
/// CrashReportingService.shared.initialize()
/// CrashReportingService.shared.captureError(someError)
/// ```
@MainActor
@Observable
final class CrashReportingService {

    static let shared = CrashReportingService()

    private(set) var isInitialized = false

    private init() {}

    // MARK: - Initialization

    /// Starts the Sentry SDK. Call once at launch (e.g. in `AppDelegate`).
    func initialize() {
        guard !isInitialized else { return }

        let dsn = APIConfig.Sentry.dsn
        guard !dsn.isEmpty, dsn != "https://examplePublicKey@o0.ingest.sentry.io/0" else {
            #if DEBUG
            print("[CrashReporting] Sentry DSN not configured — skipping initialization.")
            #endif
            return
        }

        SentrySDK.start { options in
            options.dsn = dsn
            options.environment = Self.currentEnvironment

            // Capture 20 % of transactions for performance monitoring
            options.tracesSampleRate = 0.2

            // Attach view hierarchy to crash reports
            options.attachViewHierarchy = true

            // Automatically track HTTP requests
            options.enableNetworkTracking = true

            #if DEBUG
            options.debug = true
            #endif
        }

        isInitialized = true
    }

    // MARK: - Error Capture

    /// Captures an `Error` and sends it to Sentry.
    func captureError(_ error: Error) {
        SentrySDK.capture(error: error)
    }

    /// Captures an `Error` with extra contextual key-value pairs.
    func captureError(_ error: Error, extras: [String: Any]) {
        SentrySDK.capture(error: error) { scope in
            for (key, value) in extras {
                scope.setExtra(value: value, key: key)
            }
        }
    }

    // MARK: - Breadcrumbs

    /// Records a breadcrumb so Sentry knows what happened leading up to a crash.
    func addBreadcrumb(category: String, message: String, level: SentryLevel = .info) {
        let crumb = Breadcrumb(level: level, category: category)
        crumb.message = message
        SentrySDK.addBreadcrumb(crumb)
    }

    // MARK: - User Context

    /// Associates the current user with future crash reports.
    func setUser(id: String, email: String? = nil) {
        let user = User()
        user.userId = id
        user.email = email
        SentrySDK.setUser(user)
    }

    /// Clears user context (e.g. on sign-out).
    func clearUser() {
        SentrySDK.setUser(nil)
    }

    // MARK: - Helpers

    private static var currentEnvironment: String {
        #if DEBUG
        return "development"
        #else
        return "production"
        #endif
    }
}
