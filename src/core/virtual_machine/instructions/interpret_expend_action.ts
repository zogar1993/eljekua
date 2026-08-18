import {
    InterpretInstructionProps
} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {AST} from "core/virtual_machine/expressions/AST_NODE";
import {InstructionExpendAction} from "core/virtual_machine/instructions/instructions";

export const interpret_expend_action = ({
                                            instruction,
                                            evaluate_ast,
                                            game_events,
                                        }: InterpretInstructionProps<InstructionExpendAction>) => {
    const owner = EXPR.as_creature(evaluate_ast(AST.OWNER))
    owner.expend_action(instruction.action_type)
    game_events.on_creature_available_actions_changed.raise(owner)
}