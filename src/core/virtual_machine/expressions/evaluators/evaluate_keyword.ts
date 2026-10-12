import type {Expr} from "core/virtual_machine/expressions/types";
import type {AstNodeKeyword} from "core/expressions/parser/nodes/AstNodeKeyword";
import type {EvaluateAstProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";

export const evaluate_keyword = ({node, game_state}: EvaluateAstProps<AstNodeKeyword>): Expr =>
    game_state.vm_state.get_variable(node.value)
