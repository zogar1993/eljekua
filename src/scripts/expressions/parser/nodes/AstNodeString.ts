import {Scanner} from "scripts/expressions/parser/scanner";

export const parse_string = (scanner: Scanner): AstNodeString => {
    scanner.consume(`"`)

    const value = scanner.get_text_while((char: string) => char !== `"`)

    scanner.consume(`"`)

    return {
        type: "string",
        value: value
    }
}

export type AstNodeString = {
    type: "string"
    value: string
}