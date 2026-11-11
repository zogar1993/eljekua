import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import {assert} from "stdlib/assert";

export const assert_parameters_amount_equals = (node: AstNodeFunction, amount: number) => {
    assert(node.parameters.length === amount, () => `expected '${amount}' parameters in ${node.name} function, got ${node.parameters.length}`)
}

export const assert_parameters_amount_is_at_least = (node: AstNodeFunction, amount: number) => {
    assert(node.parameters.length >= amount, () => `expected at least '${amount}' parameters in ${node.name} function, got ${node.parameters.length}`)
}
