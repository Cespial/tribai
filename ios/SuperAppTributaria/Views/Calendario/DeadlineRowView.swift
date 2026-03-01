import SwiftUI

struct DeadlineRowView: View {
    let deadline: CalendarDeadline
    let status: DeadlineStatus
    let formattedDate: String

    var body: some View {
        CardView {
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(formattedDate)
                        .font(AppTypography.bodySmall)
                        .fontWeight(.semibold)
                        .foregroundStyle(Color.appForeground)

                    Spacer()

                    StatusBadgeView.deadline(status)
                }

                Text(deadline.obligacion)
                    .font(AppTypography.bodySmall)
                    .foregroundStyle(Color.appForeground)
                    .lineLimit(2)

                HStack(spacing: 12) {
                    Label(deadline.periodo, systemImage: "calendar")
                        .font(AppTypography.caption)
                        .foregroundStyle(Color.appMutedForeground)

                    Label("Digito \(deadline.ultimoDigito)", systemImage: "number")
                        .font(AppTypography.caption)
                        .foregroundStyle(Color.appMutedForeground)

                    Spacer()

                    if deadline.tipoContribuyente != .todos {
                        Text(deadline.tipoContribuyente.label)
                            .font(AppTypography.caption)
                            .foregroundStyle(Color.appMutedForeground)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.appMuted)
                            .clipShape(Capsule())
                    }
                }
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(deadline.obligacion), \(formattedDate), digito \(deadline.ultimoDigito), \(status.label)")
    }
}
