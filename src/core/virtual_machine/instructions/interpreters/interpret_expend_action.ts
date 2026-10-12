import {expend_creature_action} from "core/battlegrid/creatures/Creature";
import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {AST} from "core/virtual_machine/expressions/AST_NODE";
import type {InstructionExpendAction} from "core/virtual_machine/instructions/instructions";

export const interpret_expend_action = ({
                                            instruction,
                                            game_queries,
                                            game_events,
                                        }: InterpretInstructionProps<InstructionExpendAction>) => {
    const owner = game_queries.evaluate_creature(AST.OWNER)
    expend_creature_action({creature: owner, action: instruction.action_type})
    game_events.on_creature_available_actions_changed.raise(owner)
}