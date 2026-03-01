import SwiftUI

struct ChatView: View {
    @Bindable var viewModel: ChatViewModel
    @State private var showSourcesPanel = false
    @State private var selectedSource: SourceCitation?
    @State private var showCopiedFeedback = false

    var body: some View {
        VStack(spacing: 0) {
            if viewModel.messages.isEmpty {
                EmptyStateView { question in
                    viewModel.sendSuggestedQuestion(question)
                }
            } else {
                messageList
            }

            ChatInputBar(
                text: $viewModel.inputText,
                isStreaming: viewModel.isStreaming,
                characterCount: viewModel.characterCount,
                isOverLimit: viewModel.isOverCharacterLimit,
                canSend: viewModel.canSend,
                onSend: { viewModel.sendMessage() },
                onCancel: { viewModel.cancelStreaming() }
            )
        }
        .background(Color.appBackground)
        .alert("Error", isPresented: $viewModel.showError) {
            Button("Reintentar") { viewModel.retry() }
            Button("Cerrar", role: .cancel) {}
        } message: {
            Text(viewModel.error?.errorDescription ?? "Error desconocido")
        }
        .sheet(item: $selectedSource) { source in
            SourceCitationsPanel(sources: [source])
                .presentationDetents([.medium])
        }
        .overlay(alignment: .top) {
            if showCopiedFeedback {
                Text("Copiado")
                    .font(AppTypography.label)
                    .foregroundStyle(Color.appPrimaryForeground)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(Color.appPrimary)
                    .clipShape(Capsule())
                    .transition(.move(edge: .top).combined(with: .opacity))
                    .padding(.top, AppSpacing.sm)
            }
        }
    }

    private var messageList: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: AppSpacing.sm) {
                    ForEach(viewModel.messages) { message in
                        MessageBubbleView(
                            message: message,
                            isStreaming: viewModel.isStreaming && message == viewModel.messages.last,
                            onCopy: { showCopiedToast() },
                            onRetry: message == viewModel.messages.last && message.role == .assistant
                                ? { viewModel.retry() }
                                : nil,
                            onSourceTapped: { source in
                                selectedSource = source
                            }
                        )
                        .id(message.id)
                    }

                    if viewModel.isStreaming && viewModel.streamingText.isEmpty {
                        TypingIndicatorView(label: viewModel.typingLabel)
                    }
                }
                .padding(.vertical, AppSpacing.sm)
            }
            .onChange(of: viewModel.messages.count) {
                scrollToBottom(proxy: proxy)
            }
            .onChange(of: viewModel.streamingText) {
                scrollToBottom(proxy: proxy)
            }
        }
    }

    private func showCopiedToast() {
        withAnimation { showCopiedFeedback = true }
        Task {
            try? await Task.sleep(for: .seconds(1.5))
            withAnimation { showCopiedFeedback = false }
        }
    }

    private func scrollToBottom(proxy: ScrollViewProxy) {
        guard let lastId = viewModel.messages.last?.id else { return }
        withAnimation(.easeOut(duration: 0.2)) {
            proxy.scrollTo(lastId, anchor: .bottom)
        }
    }
}
