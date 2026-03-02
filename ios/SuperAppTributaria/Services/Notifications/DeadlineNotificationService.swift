import Foundation
import UserNotifications

@MainActor
final class DeadlineNotificationService {

    static let shared = DeadlineNotificationService()
    private let center = UNUserNotificationCenter.current()
    private let reminderKey = "deadline_reminders"

    private init() {}

    // MARK: - Public API

    func scheduleReminder(
        obligacion: String,
        fecha: Date,
        deadlineId: String
    ) async {
        let settings = await center.notificationSettings()
        guard settings.authorizationStatus == .authorized else { return }

        // Schedule 1 day before
        guard let triggerDate = Calendar.current.date(byAdding: .day, value: -1, to: fecha),
              triggerDate > Date() else { return }

        let content = UNMutableNotificationContent()
        content.title = "Vencimiento manana"
        content.body = "\(obligacion) vence manana. No olvides cumplir con esta obligacion."
        content.sound = .default
        content.categoryIdentifier = "DEADLINE_REMINDER"

        let components = Calendar.current.dateComponents(
            [.year, .month, .day, .hour, .minute],
            from: triggerDate
        )
        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)

        let request = UNNotificationRequest(
            identifier: "deadline-\(deadlineId)",
            content: content,
            trigger: trigger
        )

        try? await center.add(request)
        saveReminder(deadlineId: deadlineId)
    }

    func cancelReminder(deadlineId: String) {
        center.removePendingNotificationRequests(withIdentifiers: ["deadline-\(deadlineId)"])
        removeReminder(deadlineId: deadlineId)
    }

    func isReminderSet(deadlineId: String) -> Bool {
        savedReminders.contains(deadlineId)
    }

    func toggleReminder(
        obligacion: String,
        fecha: Date,
        deadlineId: String
    ) async {
        if isReminderSet(deadlineId: deadlineId) {
            cancelReminder(deadlineId: deadlineId)
        } else {
            await scheduleReminder(obligacion: obligacion, fecha: fecha, deadlineId: deadlineId)
        }
    }

    // MARK: - Persistence

    private var savedReminders: Set<String> {
        Set(UserDefaults.standard.stringArray(forKey: reminderKey) ?? [])
    }

    private func saveReminder(deadlineId: String) {
        var reminders = savedReminders
        reminders.insert(deadlineId)
        UserDefaults.standard.set(Array(reminders), forKey: reminderKey)
    }

    private func removeReminder(deadlineId: String) {
        var reminders = savedReminders
        reminders.remove(deadlineId)
        UserDefaults.standard.set(Array(reminders), forKey: reminderKey)
    }
}
