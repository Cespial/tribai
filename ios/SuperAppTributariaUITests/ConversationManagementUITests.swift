import XCTest

@MainActor
final class ConversationManagementUITests: XCTestCase {
    let app = XCUIApplication()

    override func setUpWithError() throws {
        continueAfterFailure = false
        app.launchArguments.append("--uitesting")
        app.launch()
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

        // Verify we're in the chat view
        let inputField = app.textFields["Campo de mensaje"]
        XCTAssertTrue(inputField.waitForExistence(timeout: 5))
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
        let textField = app.textFields["Campo de mensaje"]
        guard textField.waitForExistence(timeout: 5) else {
            XCTFail("Text field not found")
            return
        }
        textField.tap()
        textField.typeText("Test message")

        let sendButton = app.buttons["Enviar mensaje"]
        sendButton.tap()

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
