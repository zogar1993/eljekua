import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import type {InstructionAttackD20Roll} from "core/virtual_machine/instructions/instructions";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import type {Creature} from "core/battlegrid/creatures/Creature";
import {roll_d} from "core/randomness/dice";

export const interpret_attack_d20_roll = ({
                                              game_state,
                                              instruction,
                                              game_queries,
                                          }: InterpretInstructionProps<InstructionAttackD20Roll>) => {
    const {vm_state} = game_state
    const defenders = game_queries.evaluate_creatures(vm_state.get_variable(instruction.defender_label))

    const d20_rolls = new Map<Creature, number>()
    defenders.forEach(defender => d20_rolls.set(defender, roll_d(20).value))

    vm_state.set_variable(SYSTEM_KEYWORD.ATTACK_D20_ROLLS, {type: "attack_d20_rolls", value: d20_rolls})
}
