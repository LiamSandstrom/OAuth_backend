import { describe, it, expect, vi, beforeEach } from "vitest"
import { APIConnectionError, APIError } from "@anthropic-ai/sdk"
import {
    FeedbackUnavailableError,
    feedbackInputHash,
    getDraftFeedback,
    getPublishedFeedback
} from "../../src/services/aiFeedback.js"

const { create } = vi.hoisted(() => ({ create: vi.fn() }))

vi.mock("@anthropic-ai/sdk", async importOriginal => ({
    ...(await importOriginal<typeof import("@anthropic-ai/sdk")>()),
    default: class {
        beta = { messages: { create } }
    }
}))

const post = { title: "Learning Docker", content: "# Docker\n\nContainers are neat." }

const reply = (text: string, stop_reason = "end_turn") => ({ content: [{ type: "text", text }], stop_reason })
const sent = () => create.mock.calls[0][0]

beforeEach(() => {
    create.mockReset()
})

describe("getDraftFeedback", () => {
    it("sends only the post with the draft prompt", async () => {
        create.mockResolvedValue(reply("Tighten the intro"))

        expect(await getDraftFeedback(post)).toBe("Tighten the intro")
        expect(sent().system).toContain("unpublished drafts")
        expect(sent().messages[0].content).toContain("<post>\n# Docker\n\nContainers are neat.\n</post>")
        expect(sent().messages[0].content).not.toContain("<likes>")
    })
})

describe("getPublishedFeedback", () => {
    it("sends likes and comments with the published prompt", async () => {
        create.mockResolvedValue(reply("Readers want more examples"))

        await getPublishedFeedback(post, 3, ["Great post", "Show a compose file"])
        expect(sent().system).toContain("how readers responded")
        expect(sent().messages[0].content).toContain("<likes>3</likes>")
        expect(sent().messages[0].content).toContain("<comment>Show a compose file</comment>")
    })

    it("sends at most 50 comments", async () => {
        create.mockResolvedValue(reply("ok"))

        await getPublishedFeedback(
            post,
            0,
            Array.from({ length: 60 }, (_, i) => `Comment ${i}`)
        )
        expect(sent().messages[0].content.match(/<comment>/g)).toHaveLength(50)
    })
})

describe("AI responses", () => {
    it("joins the text blocks and skips thinking", async () => {
        create.mockResolvedValue({
            content: [
                { type: "thinking", thinking: "" },
                { type: "text", text: "First. " },
                { type: "text", text: "Second." }
            ],
            stop_reason: "end_turn"
        })

        expect(await getDraftFeedback(post)).toBe("First. Second.")
    })

    it.each([
        ["a refusal", reply("", "refusal")],
        ["an empty answer", reply("")]
    ])("throws FeedbackUnavailableError on %s", async (_, response) => {
        create.mockResolvedValue(response)
        await expect(getDraftFeedback(post)).rejects.toBeInstanceOf(FeedbackUnavailableError)
    })

    it.each([
        ["a connection error", new APIConnectionError({ message: "down" })],
        ["a rate limit", new APIError(429, undefined, "slow down", undefined)],
        ["a server error", new APIError(529, undefined, "overloaded", undefined)]
    ])("throws FeedbackUnavailableError on %s", async (_, err) => {
        create.mockRejectedValue(err)
        await expect(getDraftFeedback(post)).rejects.toBeInstanceOf(FeedbackUnavailableError)
    })

    it("passes other API errors through", async () => {
        const err = new APIError(400, undefined, "bad request", undefined)
        create.mockRejectedValue(err)
        await expect(getDraftFeedback(post)).rejects.toBe(err)
    })
})

describe("feedbackInputHash", () => {
    it("is the same for the same post", () => {
        expect(feedbackInputHash("draft", post)).toBe(feedbackInputHash("draft", { ...post }))
    })

    it("changes with the title, the content and the prompt", () => {
        const hash = feedbackInputHash("draft", post)
        expect(feedbackInputHash("draft", { ...post, title: "Other" })).not.toBe(hash)
        expect(feedbackInputHash("draft", { ...post, content: "Other" })).not.toBe(hash)
        expect(feedbackInputHash("published", post)).not.toBe(hash)
    })
})
