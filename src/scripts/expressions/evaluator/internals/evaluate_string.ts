import type {ExprString} from "scripts/expressions/evaluator/types";
import type {AstNodeString} from "scripts/expressions/parser/nodes/AstNodeString";

export const evaluate_string = (node: AstNodeString): ExprString =>
    ({type: "string", value: node.value, description: node.value})
