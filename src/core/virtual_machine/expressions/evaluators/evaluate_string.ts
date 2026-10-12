import type {ExprString} from "core/virtual_machine/expressions/types";
import type {AstNodeString} from "core/expressions/parser/nodes/AstNodeString";
import type {EvaluateAstProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";

export const evaluate_string = ({node}: EvaluateAstProps<AstNodeString>): ExprString =>
    ({type: "string", value: node.value})
