import {AstNode, AstNodeNumber, AstNodeNumberResolved, AstNodeNumberUnresolved} from "interpreter/types";

export const add_numbers_resolved = (numbers: Array<AstNodeNumberResolved>): AstNodeNumberResolved => ({
    type: "number_resolved",
    value: numbers.reduce((accum, num) => accum + num.value, 0),
    params: numbers,
    description: "+"
})

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
