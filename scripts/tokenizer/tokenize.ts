import {assert} from "assert";
import {Scanner} from "tokenizer/scanner";

export const tokenize = (text: string): Token => {
    const scanner = new Scanner(text)
    const token = tokenize_any(scanner)
    assert(scanner.is_at_end(), () => `expected end of formula but found more text on ${text}`)
    return token

}

const is_numeric_character = (char: string) => /^\d$/.test(char)
const is_non_numeric_character = (char: string) => /^[(a-z._]$/.test(char)
const is_alpha_character = (char: string) => /^[a-z_]$/.test(char)

const is_numeric_token = (char: string) => /^\d+$/.test(char)
const is_non_numeric_token = (char: string) => /^[a-z_]+$/.test(char)

const tokenize_any = (scanner: Scanner): Token => {
    const char = scanner.peek()

    if (is_numeric_character(char))
        return tokenize_number(scanner)
    else if (char === "[")
        return tokenize_roll(scanner)
    else if (is_non_numeric_character(char))
        return tokenize_text(scanner)
    else if (char === "$")
        return tokenize_function(scanner)
    else
        throw Error(`unexpected character found while tokenizing ${scanner.text}, can't parse "${scanner.peek()}"`)
}

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

const tokenize_roll = (scanner: Scanner): DiceToken | WeaponToken => {
    assert(scanner.peek() === "[", () => `dice token must start with '[', instead found '${scanner.peek()}'`)
    scanner.consume()

    const amount = scanner.next()

    assert(is_numeric_character(amount), () => `expected number for amount, instead found '${amount}'`)

    const type = scanner.next()

    if (type === "d") {
        const number = scanner.next() + (is_numeric_character(scanner.peek()) ? scanner.next() : "")

        assert(["4", "6", "8", "10", "12", "20"].includes(number), () => `dice value needs to be number in the following options [4, 6, 8, 10, 12, 20], found '${number}'.`)
        assert(scanner.next() === "]", () => `dice token must start with ']', instead found '${scanner.peek()}'`)

        const faces = Number(number) as DiceToken["faces"]

        return {
            type: "dice",
            amount: Number(amount),
            faces,
        }
    } else if (type === "W") {
        assert(scanner.next() === "]", () => `dice token must end with ']', instead found '${scanner.peek()}'`)
        return {
            type: "weapon",
            amount: Number(amount)
        }
    } else {
        throw Error(`type ${type} not permitted when tokenizing dice`)
    }
}

const tokenize_function = (scanner: Scanner): FunctionToken => {
    let value = scanner.next()
    assert(value === '$', () => `Expected function to start with '$'`)

    let name = ""
    while (is_alpha_character(scanner.peek()))
        name += scanner.next()

    assert(["sum", "exists"].includes(name), () => `function name '${name}' does not exist. Tokenizing ${scanner.text}`)
    scanner.assert_consume("(")

    const parameters = []

    const MAX_PARAMS_ALLOWED = 8
    let current_params = 0
    while (current_params < MAX_PARAMS_ALLOWED) {
        current_params++
        const param = tokenize_any(scanner)
        parameters.push(param)
        if (scanner.peek() === ")") break
        scanner.assert_consume(",")
    }

    scanner.consume()

    return {
        type: "function",
        name,
        parameters
    }
}

export type Token = NumberLiteralToken | KeywordToken | DiceToken | WeaponToken | FunctionToken

export type NumberLiteralToken = {
    type: "number"
    value: number
}

export type KeywordToken = {
    type: "keyword"
    value: string
    property?: string
}

export type DiceToken = {
    type: "dice"
    amount: number
    faces: 4 | 6 | 8 | 10 | 12 | 20
}

export type WeaponToken = {
    type: "weapon"
    amount: number
}

export type FunctionToken = {
    type: "function"
    name: string
    parameters: Array<Token>
}
