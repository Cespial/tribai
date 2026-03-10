import XCTest

@MainActor
final class ChatFlowUITests: XCTestCase {
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

        // Find the input field (may appear as textField or textView depending on OS)
        let textField = app.textFields["Campo de mensaje"]
        let textView = app.textViews["Campo de mensaje"]
        let inputField: XCUIElement
        if textField.waitForExistence(timeout: 5) {
            inputField = textField
        } else if textView.waitForExistence(timeout: 3) {
            inputField = textView
        } else {
            XCTFail("Text field not found")
            return
        }
        inputField.tap()
        inputField.typeText("¿Debo declarar renta?")

        // Tap the send button
        let sendButton = app.buttons["Enviar mensaje"]
        guard sendButton.waitForExistence(timeout: 3) else {
            XCTFail("Send button not found")
            return
        }

        if sendButton.isHittable {
            sendButton.tap()
        } else {
            // If the button isn't directly hittable (e.g., keyboard overlap), tap via coordinate
            sendButton.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
        }

        // Verify user message appears — the MessageBubbleView has accessibilityLabel "Tú: <text>"
        let predicate = NSPredicate(format: "label CONTAINS '¿Debo declarar renta?'")
        let userMessage = app.descendants(matching: .any).matching(predicate).firstMatch
        XCTAssertTrue(userMessage.waitForExistence(timeout: 5))
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

        // Verify the message was sent (user bubble has accessibility label "Tú: <question text>")
        let predicate = NSPredicate(format: "label BEGINSWITH 'Tú:'")
        let userBubble = app.descendants(matching: .any).matching(predicate).firstMatch
        XCTAssertTrue(userBubble.waitForExistence(timeout: 5))
    }
}
