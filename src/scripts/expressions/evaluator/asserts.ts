import {AstNodeFunction} from "scripts/expressions/parser/nodes/AstNodeFunction";

export const assert_parameters_amount_equals = (node: AstNodeFunction, amount: number) => {
    if (node.parameters.length === amount) return
    throw Error(`expected '${amount}' parameters in ${node.name} function, got ${node.parameters.length}`)
}

export const assert_parameters_amount_is_at_least = (node: AstNodeFunction, amount: number) => {
    if (node.parameters.length >= amount) return
    throw Error(`expected at least '${amount}' parameters in ${node.name} function, got ${node.parameters.length}`)
}
