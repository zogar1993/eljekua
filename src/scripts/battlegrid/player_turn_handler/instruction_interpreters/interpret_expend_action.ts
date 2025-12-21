import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {AST} from "scripts/expressions/parser/AST_NODE";
import {InstructionExpendAction} from "scripts/expressions/parser/instructions";

export const interpret_expend_action = ({
                                            instruction,
                                            evaluate_ast,
                                        }: InterpretInstructionProps<InstructionExpendAction>) => {
    const owner = EXPR.as_creature(evaluate_ast(AST.OWNER))
    owner.expend_action(instruction.action_type)
}