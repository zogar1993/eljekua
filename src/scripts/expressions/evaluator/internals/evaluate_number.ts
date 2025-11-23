import type {ExprNumberResolved} from "scripts/expressions/evaluator/types";
import type {AstNodeNumber} from "scripts/expressions/parser/nodes/AstNodeNumber";

export const evaluate_number = (node: AstNodeNumber): ExprNumberResolved =>
    ({type: "number_resolved", value: node.value, description: "hard number"})

