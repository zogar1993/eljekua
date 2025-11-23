import {
    Expr,
    ExprNumber,
    ExprNumberResolved,
    ExprNumberUnresolved
} from "scripts/expressions/evaluator/types";
import {roll_d} from "scripts/randomness/dice";

export const add_numbers_resolved = (numbers: Array<ExprNumberResolved>): ExprNumberResolved => ({
    type: "number_resolved",
    value: numbers.reduce((accum, num) => accum + num.value, 0),
    params: numbers,
    description: "+"
})

export const subtract_numbers_resolved = (a: ExprNumberResolved, b: ExprNumberResolved): ExprNumberResolved => ({
    type: "number_resolved",
    value: a.value - b.value,
    params: [a, b],
    description: "-"
})

export const max_number_resolved = (numbers: Array<ExprNumberResolved>): ExprNumberResolved =>
    numbers.reduce((previous, current) => previous.value > current.value ? previous : current)

export const number_utils = (numbers: Array<ExprNumber>): ExprNumberUnresolved => ({
    type: "number_unresolved",
    min: numbers.reduce((accum, num) => (is_number_resolved(num) ? num.value : num.min) + accum, 0),
    max: numbers.reduce((accum, num) => (is_number_resolved(num) ? num.value : num.max) + accum, 0),
    params: numbers,
    description: "+"
})

export const is_number_resolved = (value: Expr): value is ExprNumberResolved =>
    value.type === "number_resolved"

export const is_number_unresolved = (value: Expr): value is ExprNumberUnresolved =>
    value.type === "number_unresolved"

export const is_number = (value: Expr): value is ExprNumber =>
    is_number_resolved(value) || is_number_unresolved(value)

export const resolve_number = (number: ExprNumber): ExprNumberResolved => {
    if (is_number_resolved(number)) return number
    if (number.params === undefined)
        return roll_d(number.max) //TODO P4 this is to be enhanced when randomness apart from dice is added
    const resolved_parts = number.params.map(part => is_number(part) ? resolve_number(part) : part)
    return {
        type: "number_resolved",
        value: resolved_parts.reduce((result, part) => is_number(part) ? part.value + result : result, 0),
        description: number.description,
        params: resolved_parts
    }
}
