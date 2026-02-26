import SwiftUI

struct ConversationListView: View {
    @Bindable var viewModel: ConversationListViewModel
    let onSelect: (Conversation) -> Void
    let onNewConversation: () -> Void

    var body: some View {
        List {
            if viewModel.filteredConversations.isEmpty {
                ContentUnavailableView(
                    "Sin conversaciones",
                    systemImage: "bubble.left.and.bubble.right",
                    description: Text("Inicia una nueva consulta tributaria")
                )
            } else {
                ForEach(viewModel.filteredConversations) { conversation in
                    ConversationRowView(
                        conversation: conversation,
                        isSelected: conversation.id == viewModel.selectedConversationId
                    )
                    .onTapGesture {
                        viewModel.selectConversation(conversation.id)
                        onSelect(conversation)
                    }
                }
                .onDelete { indexSet in
                    for index in indexSet {
                        let conversation = viewModel.filteredConversations[index]
                        Task {
                            await viewModel.deleteConversation(id: conversation.id)
                        }
                    }
                }
            }
        }
        .listStyle(.insetGrouped)
        .searchable(text: $viewModel.searchText, prompt: "Buscar conversaciones")
        .navigationTitle("Conversaciones")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button(action: onNewConversation) {
                    Image(systemName: "square.and.pencil")
                }
                .accessibilityLabel("Nueva conversación")
            }
        }
    }
}

struct ConversationRowView: View {
    let conversation: Conversation
    let isSelected: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(conversation.title)
                .font(AppTypography.bodyDefault)
                .fontWeight(isSelected ? .semibold : .regular)
                .foregroundStyle(Color.appForeground)
                .lineLimit(2)

            HStack {
                Text("\(conversation.messages.count) mensajes")
                    .font(AppTypography.caption)
                    .foregroundStyle(Color.appMutedForeground)

                Spacer()

                Text(conversation.updatedAt, style: .relative)
                    .font(AppTypography.caption)
                    .foregroundStyle(Color.appMutedForeground)
            }
        }
        .padding(.vertical, 4)
        .contentShape(Rectangle())
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(conversation.title), \(conversation.messages.count) mensajes")
    }
}
