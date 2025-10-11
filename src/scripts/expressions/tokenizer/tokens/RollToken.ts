import {Scanner} from "scripts/expressions/tokenizer/scanner";
import {assert} from "scripts/assert";
import {is_numeric_character} from "scripts/expressions/tokenizer/regexes";

export const tokenize_roll = (scanner: Scanner): DiceToken | WeaponToken => {
    scanner.consume("{")

    const amount = scanner.next()

    assert(is_numeric_character(amount), () => `expected number for amount, instead found '${amount}'`)

    const type = scanner.next()

    if (type === "d") {
        const number = scanner.get_text_while(is_numeric_character)

        assert(["4", "6", "8", "10", "12", "20"].includes(number), () => `dice value needs to be number in the following options [4, 6, 8, 10, 12, 20], found '${number}'.`)
        scanner.consume("}")

        const faces = Number(number) as DiceToken["faces"]

        return {
            type: "dice",
            amount: Number(amount),
            faces,
        }
    } else if (type === "W") {
        scanner.consume("}")
        return {
            type: "weapon",
            amount: Number(amount)
        }
    } else {
        throw Error(`type ${type} not permitted when tokenizing dice`)
    }
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