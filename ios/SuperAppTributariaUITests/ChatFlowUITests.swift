import XCTest

@MainActor
final class ChatFlowUITests: XCTestCase {
    let app = XCUIApplication()

    override func setUpWithError() throws {
        continueAfterFailure = false
        app.launchArguments.append("--uitesting")
        app.launch()
    }

    func testNewConversationShowsEmptyState() throws {
        // Tap new conversation button
        let newButton = app.buttons["Nueva conversación"]
        if newButton.waitForExistence(timeout: 5) {
            newButton.tap()
        }

        // Verify empty state elements
        let title = app.staticTexts["Asistente Tributario Colombia"]
        XCTAssertTrue(title.waitForExistence(timeout: 5))

        // Verify suggested questions appear
        let suggestedQuestion = app.buttons.matching(
            NSPredicate(format: "label CONTAINS 'Pregunta sugerida'")
        )
        XCTAssertGreaterThan(suggestedQuestion.count, 0)
    }

    func testSendMessageShowsInChat() throws {
        // Navigate to new conversation
        let newButton = app.buttons["Nueva conversación"]
        if newButton.waitForExistence(timeout: 5) {
            newButton.tap()
        }

        // Type a message
        let textField = app.textFields["Campo de mensaje"]
        guard textField.waitForExistence(timeout: 5) else {
            XCTFail("Text field not found")
            return
        }
        textField.tap()
        textField.typeText("¿Debo declarar renta?")

        // Send
        let sendButton = app.buttons["Enviar mensaje"]
        XCTAssertTrue(sendButton.isEnabled)
        sendButton.tap()

        // Verify user message appears
        let userMessage = app.staticTexts["Tú: ¿Debo declarar renta?"]
        XCTAssertTrue(userMessage.waitForExistence(timeout: 3))
    }

    func testSuggestedQuestionSendsMessage() throws {
        let newButton = app.buttons["Nueva conversación"]
        if newButton.waitForExistence(timeout: 5) {
            newButton.tap()
        }

        // Tap a suggested question
        let question = app.buttons.matching(
            NSPredicate(format: "label CONTAINS 'declarar renta'")
        ).firstMatch

        guard question.waitForExistence(timeout: 5) else {
            XCTFail("Suggested question not found")
            return
        }
        question.tap()

        // Verify the message was sent (user bubble appears)
        let userBubble = app.staticTexts.matching(
            NSPredicate(format: "label CONTAINS 'declarar renta'")
        ).firstMatch
        XCTAssertTrue(userBubble.waitForExistence(timeout: 5))
    }
}
