import {assert} from "assert";
import {AstNodeNumberResolved} from "expression_parsers/preview_expression";

export const roll_d = (faces: number): AstNodeNumberResolved => {
    return {
        type: "number_resolved",
        value: get_random_number({min: 1, max: faces}),
        description: `d${faces}`
    }
}

export const get_random_number = ({min, max}: {min: number, max: number}) => {
    assert(min <= max, () => "min can not be lower than max")
    const result = Math.floor(Math.random() * (max - min + 1)) + min
    assert(min <= result && result <= max, () => `result of random needs to be bewteen mind and max, was ${result}`)
    return result
}