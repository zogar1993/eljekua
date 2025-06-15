import {assert} from "assert";

export const tokenize = (text: string): Array<Token> => {
    const scanner = new Scanner(text)
    const result: Array<Token> = []
    let sign = '+'
    while (!scanner.is_at_end()) {
        let char = scanner.peek()
        if (is_numeric_or_minus_character(char))
            result.push(tokenize_number(scanner))
        else if (is_non_numeric_character(char))
            result.push(tokenize_text(scanner))
        else
            assert(false, () => `unexpected character found while tokenizing ${text}, can't parse "${scanner.peek()}"`)

        if (sign === "-") result[result.length - 1].negative = true

        if (scanner.is_at_end()) break

        assert(is_binary_operator(scanner.peek()), () => `unexpected character found while tokenizing ${text}, expected a binary operator, found ${scanner.peek()}`)
        sign = scanner.next()

        assert(!scanner.is_at_end(), () => `unexpected character found while tokenizing ${text}, cannot end in binary operator ${sign}`)
    }
    return result
}

class Scanner {
    readonly text: string
    private index = 0

    constructor(text: string) {
        if (text === "") throw Error("can't scan empty string")
        this.text = text.replaceAll(" ", "")
    }

    peek = () => this.text[this.index]

    consume = () => {
        assert(!this.is_at_end(), () => `can't consume while at end, parsing: ${this.text}`)
        this.index++
    }

    next = () => {
        const char = this.text[this.index]
        this.index++
        return char
    }

    is_at_end = () => this.index >= this.text.length
}

const is_numeric_or_minus_character = (char: string) => /^(\d|-)$/.test(char)
const is_numeric_character = (char: string) => /^\d$/.test(char)
const is_non_numeric_character = (char: string) => /^[a-z.]$/.test(char)
const is_alpha_character = (char: string) => /^[a-z]$/.test(char)
const is_binary_operator = (char: string) => ["+", "-"].includes(char)

const is_numeric_token = (char: string) => /^-?\d+$/.test(char)
const is_non_numeric_token = (char: string) => /^[a-z]+$/.test(char)

const tokenize_number = (scanner: Scanner): NumberLiteralToken => {
    let value = scanner.next()
    while (is_numeric_character(scanner.peek()))
        value += scanner.next()

    assert(is_numeric_token(value), () => `tokenize_number() output value has incorrect format "${value}"`)

    return {type: "number", value: Number(value)}
}

const tokenize_text = (scanner: Scanner): KeywordToken => {
    let value = scanner.next()
    while (is_alpha_character(scanner.peek()))
        value += scanner.next()

    assert(is_non_numeric_token(value), () => `tokenize_text() output value has incorrect format "${value}"`)

    const keyword: KeywordToken = {type: "keyword", value}

    if (scanner.peek() === ".") {
        scanner.consume()

        //this is a bit ugly, make it better
        let value = scanner.next()
        while (is_alpha_character(scanner.peek()))
            value += scanner.next()
        assert(is_non_numeric_token(value), () => `tokenize_text() output value has incorrect format "${value}"`)
        keyword.property = value
    }

    return keyword
}

export type Token = NumberLiteralToken | KeywordToken

export type NumberLiteralToken = {
    type: "number"
    value: number
    negative?: boolean
}

export type KeywordToken = {
    type: "keyword"
    value: string
    property?: string
    negative?: boolean
}
