import {
    InterpretInstructionProps
} from "core/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {EXPR} from "core/expressions/evaluator/EXPR";
import {AST} from "core/expressions/parser/AST_NODE";
import {InstructionExpendAction} from "core/expressions/parser/instructions";

export const interpret_expend_action = ({
                                            instruction,
                                            evaluate_ast,
                                        }: InterpretInstructionProps<InstructionExpendAction>) => {
    const owner = EXPR.as_creature(evaluate_ast(AST.OWNER))
    owner.expend_action(instruction.action_type)
}