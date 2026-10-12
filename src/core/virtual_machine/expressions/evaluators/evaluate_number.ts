import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import type {AstNodeNumber} from "core/expressions/parser/nodes/AstNodeNumber";
import type {EvaluateAstProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";

export const evaluate_number = ({node}: EvaluateAstProps<AstNodeNumber>): ExprNumberResolved =>
    ({type: "number_resolved", value: node.value, description: "hard number"})
