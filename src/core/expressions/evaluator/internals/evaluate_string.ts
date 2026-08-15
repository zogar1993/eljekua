import type {ExprString} from "core/expressions/evaluator/types";
import type {AstNodeString} from "core/expressions/parser/nodes/AstNodeString";

export const evaluate_string = (node: AstNodeString): ExprString =>
    ({type: "string", value: node.value})
