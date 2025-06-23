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

    is_at_end = () => this.index >= this.text.length

    assert_peek = (expectation: string) => {
        assert(!this.is_at_end(), () => `While tokenizing ${this.text} expected ${expectation} but found end of text at index ${this.index}`)
        assert(expectation === this.peek(), () => `While tokenizing ${this.text} expected ${expectation} but found ${this.peek()} at index ${this.index}`)
    }
}
