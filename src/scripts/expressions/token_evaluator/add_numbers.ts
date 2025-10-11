import {
    AstNode,
    AstNodeNumber,
    AstNodeNumberResolved,
    AstNodeNumberUnresolved
} from "scripts/expressions/token_evaluator/types";

export const add_numbers_resolved = (numbers: Array<AstNodeNumberResolved>): AstNodeNumberResolved => ({
    type: "number_resolved",
    value: numbers.reduce((accum, num) => accum + num.value, 0),
    params: numbers,
    description: "+"
})

export const subtract_numbers_resolved = (a: AstNodeNumberResolved, b: AstNodeNumberResolved): AstNodeNumberResolved => ({
    type: "number_resolved",
    value: a.value - b.value,
    params: [a, b],
    description: "-"
})

export const max_number_resolved = (numbers: Array<AstNodeNumberResolved>): AstNodeNumberResolved =>
    numbers.reduce((previous, current) => previous.value > current.value ? previous : current)

export const add_numbers = (numbers: Array<AstNodeNumber>): AstNodeNumberUnresolved => ({
    type: "number_unresolved",
    min: numbers.reduce((accum, num) => (is_number_resolved(num) ? num.value : num.min) + accum, 0),
    max: numbers.reduce((accum, num) => (is_number_resolved(num) ? num.value : num.max) + accum, 0),
    params: numbers,
    description: "+"
})

export const is_number_resolved = (value: AstNode): value is AstNodeNumberResolved =>
    value.type === "number_resolved"

export const is_number_unresolved = (value: AstNode): value is AstNodeNumberUnresolved =>
    value.type === "number_unresolved"

export const is_number = (value: AstNode): value is AstNodeNumber =>
    is_number_resolved(value) || is_number_unresolved(value)
