import Testing
@testable import SuperAppTributaria

struct SSEParserTests {
    // MARK: - Valid Lines

    @Test func parsesStartEvent() {
        let line = #"data: {"type":"start","messageId":"msg-123"}"#
        let event = SSEParser.parse(line: line)

        guard case .started(let messageId) = event else {
            Issue.record("Expected .started, got \(String(describing: event))")
            return
        }
        #expect(messageId == "msg-123")
    }

    @Test func parsesTextDeltaEvent() {
        let line = #"data: {"type":"text-delta","id":"text-001","delta":"El artículo"}"#
        let event = SSEParser.parse(line: line)

        guard case .textDelta(let id, let delta) = event else {
            Issue.record("Expected .textDelta, got \(String(describing: event))")
            return
        }
        #expect(id == "text-001")
        #expect(delta == "El artículo")
    }

    @Test func parsesTextStartEvent() {
        let line = #"data: {"type":"text-start","id":"text-001"}"#
        let event = SSEParser.parse(line: line)

        guard case .textStarted(let id) = event else {
            Issue.record("Expected .textStarted, got \(String(describing: event))")
            return
        }
        #expect(id == "text-001")
    }

    @Test func parsesTextEndEvent() {
        let line = #"data: {"type":"text-end","id":"text-001"}"#
        let event = SSEParser.parse(line: line)

        guard case .textEnded(let id) = event else {
            Issue.record("Expected .textEnded, got \(String(describing: event))")
            return
        }
        #expect(id == "text-001")
    }

    @Test func parsesFinishEvent() {
        let line = #"data: {"type":"finish","finishReason":"stop","messageMetadata":{"sources":[{"idArticulo":"Art. 240","titulo":"Tarifa general","slug":"art-240","contenido_texto":"La tarifa...","libro":"Libro I","estado":"vigente"}],"ragMetadata":{"confidenceLevel":"high","pipelineMs":1094,"uniqueArticles":3}}}"#
        let event = SSEParser.parse(line: line)

        guard case .finished(let reason, let metadata) = event else {
            Issue.record("Expected .finished, got \(String(describing: event))")
            return
        }
        #expect(reason == "stop")
        #expect(metadata?.sources?.count == 1)
        #expect(metadata?.sources?.first?.idArticulo == "Art. 240")
        #expect(metadata?.sources?.first?.estado == .vigente)
        #expect(metadata?.ragMetadata?.confidenceLevel == .high)
        #expect(metadata?.ragMetadata?.pipelineMs == 1094)
        #expect(metadata?.ragMetadata?.uniqueArticles == 3)
    }

    @Test func parsesErrorEvent() {
        let line = #"data: {"type":"error","errorText":"Rate limit exceeded"}"#
        let event = SSEParser.parse(line: line)

        guard case .error(let apiError) = event else {
            Issue.record("Expected .error, got \(String(describing: event))")
            return
        }
        #expect(apiError.errorDescription?.contains("Rate limit") == true)
    }

    @Test func parsesAbortEvent() {
        let line = #"data: {"type":"abort","reason":"User cancelled"}"#
        let event = SSEParser.parse(line: line)

        guard case .error = event else {
            Issue.record("Expected .error from abort, got \(String(describing: event))")
            return
        }
    }

    // MARK: - Done Signal

    @Test func parsesDoneSignal() {
        let line = "data: [DONE]"
        let event = SSEParser.parse(line: line)

        guard case .done = event else {
            Issue.record("Expected .done, got \(String(describing: event))")
            return
        }
    }

    @Test func parsesDoneSignalWithTrailingWhitespace() {
        let line = "data: [DONE]  \n"
        let event = SSEParser.parse(line: line)

        guard case .done = event else {
            Issue.record("Expected .done, got \(String(describing: event))")
            return
        }
    }

    // MARK: - Edge Cases

    @Test func returnsNilForEmptyLine() {
        let event = SSEParser.parse(line: "")
        #expect(event == nil)
    }

    @Test func returnsNilForWhitespaceLine() {
        let event = SSEParser.parse(line: "   \n")
        #expect(event == nil)
    }

    @Test func returnsNilForCommentLine() {
        let event = SSEParser.parse(line: ": this is a comment")
        #expect(event == nil)
    }

    @Test func returnsNilForEventTypeLine() {
        let event = SSEParser.parse(line: "event: message")
        #expect(event == nil)
    }

    @Test func handlesDataPrefixWithoutSpace() {
        let line = #"data:{"type":"text-delta","id":"t1","delta":"hello"}"#
        let event = SSEParser.parse(line: line)

        guard case .textDelta(_, let delta) = event else {
            Issue.record("Expected .textDelta, got \(String(describing: event))")
            return
        }
        #expect(delta == "hello")
    }

    @Test func skipMalformedJSON() {
        let line = "data: {not valid json}"
        let event = SSEParser.parse(line: line)
        #expect(event == nil, "Malformed JSON should be skipped (nil), not error")
    }

    @Test func parsesUnknownChunkType() {
        let line = #"data: {"type":"tool-input-start","toolCallId":"tc-1","toolName":"calc"}"#
        let event = SSEParser.parse(line: line)

        guard case .unknown(let type) = event else {
            Issue.record("Expected .unknown, got \(String(describing: event))")
            return
        }
        #expect(type == "tool-input-start")
    }

    @Test func parsesStepEvents() {
        let startLine = #"data: {"type":"start-step"}"#
        let endLine = #"data: {"type":"finish-step"}"#

        guard case .stepStarted = SSEParser.parse(line: startLine) else {
            Issue.record("Expected .stepStarted")
            return
        }
        guard case .stepFinished = SSEParser.parse(line: endLine) else {
            Issue.record("Expected .stepFinished")
            return
        }
    }

    // MARK: - Streaming Sequence Simulation

    @Test func parsesFullStreamSequence() {
        let lines = [
            #"data: {"type":"start","messageId":"msg-001"}"#,
            #"data: {"type":"text-start","id":"text-001"}"#,
            #"data: {"type":"text-delta","id":"text-001","delta":"El "}"#,
            #"data: {"type":"text-delta","id":"text-001","delta":"artículo "}"#,
            #"data: {"type":"text-delta","id":"text-001","delta":"240..."}"#,
            #"data: {"type":"text-end","id":"text-001"}"#,
            #"data: {"type":"finish","finishReason":"stop"}"#,
            "data: [DONE]",
        ]

        var accumulatedText = ""
        var gotStart = false
        var gotFinish = false
        var gotDone = false

        for line in lines {
            guard let event = SSEParser.parse(line: line) else { continue }
            switch event {
            case .started: gotStart = true
            case .textDelta(_, let delta): accumulatedText += delta
            case .finished: gotFinish = true
            case .done: gotDone = true
            default: break
            }
        }

        #expect(gotStart)
        #expect(accumulatedText == "El artículo 240...")
        #expect(gotFinish)
        #expect(gotDone)
    }
}
