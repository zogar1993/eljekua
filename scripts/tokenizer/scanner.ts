import {assert} from "assert";

export class Scanner {
    readonly text: string
    private index = 0

    constructor(text: string) {
        if (text === "") throw Error("can't scan empty string")
        this.text = text.replaceAll(" ", "")
    }

    peek = () => this.text[this.index]

    next = () => {
        const char = this.text[this.index]
        this.index++
        return char
    }

    consume = (expectation: string) => {
        this.assert_peek(expectation)
        this.index++
    }

    get_text_while = (condition: (char: string) => boolean) => {
        this.assert_not_at_end()
        let value = ""
        while (condition(this.peek()))
            value += this.next()
        assert(value !== "", () => `While tokenizing ${this.text} fabricated an empty text from text_while`)
        return value
    }

    is_at_end = () => this.index >= this.text.length

    assert_peek = (expectation: string) => {
        this.assert_not_at_end()
        assert(expectation === this.peek(), () => `While tokenizing ${this.text} expected ${expectation} but found ${this.peek()} at index ${this.index}`)
    }

    assert_not_at_end = () => {
        assert(!this.is_at_end(), () => `While tokenizing ${this.text} found premature end of text`)
    }
}
