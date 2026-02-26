import SwiftUI
import SwiftData

struct ContentView: View {
    @Environment(AppEnvironment.self) private var environment
    @Environment(\.modelContext) private var modelContext
    @Environment(\.horizontalSizeClass) private var sizeClass

    @State private var conversationListVM = ConversationListViewModel()
    @State private var chatVM: ChatViewModel?
    @State private var columnVisibility: NavigationSplitViewVisibility = .automatic
    @State private var selectedTab: AppTab = .chat

    enum AppTab: String {
        case chat, graph
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            chatTab
                .tabItem {
                    Label("Chat", systemImage: "bubble.left.and.text.bubble.right")
                }
                .tag(AppTab.chat)

            NavigationStack {
                GraphView()
            }
            .tabItem {
                Label("Grafo", systemImage: "point.3.connected.trianglepath.dotted")
            }
            .tag(AppTab.graph)
        }
        .task {
            setupRepository()
            await conversationListVM.loadConversations()
        }
    }

    // MARK: - Chat Tab

    private var chatTab: some View {
        Group {
            if sizeClass == .regular {
                NavigationSplitView(columnVisibility: $columnVisibility) {
                    conversationSidebar
                } detail: {
                    chatDetail
                }
            } else {
                NavigationStack {
                    conversationSidebar
                        .navigationDestination(isPresented: showingChat) {
                            chatDetail
                        }
                }
            }
        }
    }

    // MARK: - Sidebar

    private var conversationSidebar: some View {
        ConversationListView(
            viewModel: conversationListVM,
            onSelect: { conversation in
                openConversation(conversation)
            },
            onNewConversation: {
                createNewConversation()
            }
        )
    }

    // MARK: - Chat Detail

    @ViewBuilder
    private var chatDetail: some View {
        if let chatVM {
            VStack(spacing: 0) {
                StatusBanner(
                    status: environment.healthStatus,
                    isConnected: environment.networkMonitor.isConnected
                )

                ChatView(viewModel: chatVM)
            }
            .navigationTitle(currentTitle)
            .navigationBarTitleDisplayMode(.inline)
        } else {
            VStack {
                Text("Selecciona o crea una conversación")
                    .font(AppTypography.bodyDefault)
                    .foregroundStyle(Color.appMutedForeground)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color.appBackground)
        }
    }

    // MARK: - Helpers

    private var showingChat: Binding<Bool> {
        Binding(
            get: { chatVM != nil },
            set: { if !$0 { chatVM = nil } }
        )
    }

    private var currentTitle: String {
        conversationListVM.filteredConversations
            .first { $0.id == conversationListVM.selectedConversationId }?
            .title ?? "Nueva conversación"
    }

    private func setupRepository() {
        let repository = SwiftDataConversationRepository(modelContainer: modelContext.container)
        conversationListVM.setRepository(repository)
    }

    private func openConversation(_ conversation: Conversation) {
        let vm = ChatViewModel(
            chatService: environment.chatService,
            conversationId: conversation.id
        )
        vm.loadConversation(conversation)
        vm.onConversationUpdated = { [conversationListVM] updatedConversation in
            Task {
                await conversationListVM.saveConversation(updatedConversation)
            }
        }
        chatVM = vm
    }

    private func createNewConversation() {
        let conversation = conversationListVM.newConversation()
        let vm = ChatViewModel(
            chatService: environment.chatService,
            conversationId: conversation.id
        )
        vm.onConversationUpdated = { [conversationListVM] updatedConversation in
            Task {
                await conversationListVM.saveConversation(updatedConversation)
            }
        }
        chatVM = vm
    }
}

#Preview {
    ContentView()
        .environment(AppEnvironment())
        .modelContainer(for: ConversationEntity.self, inMemory: true)
}
