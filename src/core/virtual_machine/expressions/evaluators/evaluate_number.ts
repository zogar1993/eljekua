import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import type {AstNodeNumber} from "core/expressions/parser/nodes/AstNodeNumber";

export const evaluate_number = (node: AstNodeNumber): ExprNumberResolved =>
    ({type: "number_resolved", value: node.value, description: "hard number"})

