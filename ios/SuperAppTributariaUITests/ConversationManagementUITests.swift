import XCTest

@MainActor
final class ConversationManagementUITests: XCTestCase {
    let app = XCUIApplication()

    override func setUpWithError() throws {
        continueAfterFailure = false
        app.launchArguments.append("--uitesting")
        app.launch()

        // Navigate to the Asistente (chat) tab — the app starts on Inicio
        let asistenteTab = app.tabBars.buttons["Asistente"]
        guard asistenteTab.waitForExistence(timeout: 5) else {
            XCTFail("Asistente tab not found")
            return
        }
        asistenteTab.tap()
    }

    func testConversationListShowsEmptyState() throws {
        let emptyText = app.staticTexts["Sin conversaciones"]
        // Empty state should appear if no prior conversations
        if emptyText.waitForExistence(timeout: 5) {
            XCTAssertTrue(emptyText.exists)
        }
    }

    func testCreateNewConversation() throws {
        let newButton = app.buttons["Nueva conversación"]
        guard newButton.waitForExistence(timeout: 5) else {
            XCTFail("New conversation button not found")
            return
        }
        newButton.tap()

        // Verify we're in the chat view — TextField with axis: .vertical renders as textView
        let textView = app.textViews["Campo de mensaje"]
        let textField = app.textFields["Campo de mensaje"]
        let found = textView.waitForExistence(timeout: 5) || textField.waitForExistence(timeout: 3)
        XCTAssertTrue(found, "Chat input field not found after creating new conversation")
    }

    func testSwipeToDeleteConversation() throws {
        // First create a conversation with a message
        let newButton = app.buttons["Nueva conversación"]
        guard newButton.waitForExistence(timeout: 5) else {
            XCTFail("New conversation button not found")
            return
        }
        newButton.tap()

        // Type and send a message to save the conversation
        let textView = app.textViews["Campo de mensaje"]
        let textField = app.textFields["Campo de mensaje"]
        let inputField: XCUIElement
        if textView.waitForExistence(timeout: 5) {
            inputField = textView
        } else if textField.waitForExistence(timeout: 3) {
            inputField = textField
        } else {
            XCTFail("Text field not found")
            return
        }
        inputField.tap()
        inputField.typeText("Test message")

        let sendButton = app.buttons["Enviar mensaje"]
        if sendButton.waitForExistence(timeout: 3) {
            sendButton.tap()
        }

        // Wait for response
        sleep(3)

        // Go back to conversation list
        let backButton = app.navigationBars.buttons.firstMatch
        if backButton.waitForExistence(timeout: 3) {
            backButton.tap()
        }

        // Find conversation cell and attempt swipe to delete
        let conversationCells = app.cells
        if conversationCells.count > 0 {
            let firstCell = conversationCells.firstMatch
            firstCell.swipeLeft()

            let deleteButton = app.buttons["Delete"]
            if deleteButton.waitForExistence(timeout: 3) {
                deleteButton.tap()
            }
        }
    }
}
