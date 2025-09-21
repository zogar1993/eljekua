import {roll_d} from "randomness/dice";
import {interpret_token} from "interpreter/interpret_token";
import {AnimationQueue} from "AnimationQueue";
import {
    Instruction,
    InstructionAttackRoll,
    InstructionCopyVariable
} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {PowerContext} from "battlegrid/player_turn_handler/PowerContext";
import {Creature} from "battlegrid/creatures/Creature";
import {ActionLog} from "action_log/ActionLog";
import {add_numbers_resolved} from "interpreter/add_numbers";
import {NODE} from "interpreter/NODE";
import {AstNodeNumberResolved} from "interpreter/types";
import {preview_defense} from "interpreter/specific_interpreters/interpret_token_keyword";

export const interpret_attack_roll = ({
                                          instruction,
                                          context,
                                          action_log,
                                          player_turn_handler,
                                          battle_grid
                                      }: InterpretInstructionProps<InstructionAttackRoll>) => {
    const attacker = context.owner()
    const defenders = context.get_creatures(instruction.defender)

    const new_instructions: Array<Instruction> = []
    new_instructions.push(...instruction.before_instructions)
    context.set_creatures({name: `${instruction.defender}(all)`, value: defenders})

    defenders.forEach((defender, i) => {
        const attack_parts: Array<AstNodeNumberResolved> = []
        attack_parts.push(NODE.as_number_resolved(interpret_token({token: instruction.attack, player_turn_handler})))
        attack_parts.push(roll_d(20))
        if (battle_grid.is_flanking({attacker, defender})) attack_parts.push(COMBAT_ADVANTAGE)

        const attack = add_numbers_resolved(attack_parts)

        const defense = NODE.as_number_resolved(preview_defense({defender, defense_code: instruction.defense}))

        const is_hit = attack.value >= defense.value

        const defender_variable_name = `${instruction.defender}(${i + 1})`
        context.set_creature({name: defender_variable_name, value: defender})
        new_instructions.push(create_copy_variable_instruction(defender_variable_name, instruction.defender))

        if (is_hit) {
            context.status = "hit"
            new_instructions.push(...instruction.hit)
        } else {
            AnimationQueue.add_animation(defender.visual.display_miss)
            context.status = "miss"
            new_instructions.push(...instruction.miss)
        }
        new_instructions.push({type: "clean_context_status"})

        log_attack_roll({attacker, attack, is_hit, defender, defense, context, instruction, action_log})
    })

    new_instructions.push(create_copy_variable_instruction(`${instruction.defender}(all)`, instruction.defender))

    context.add_instructions(new_instructions)
}

const COMBAT_ADVANTAGE: AstNodeNumberResolved = {
    type: "number_resolved",
    value: 2,
    description: "Combat Advantage"
}

const create_copy_variable_instruction = (origin: string, destination: string): InstructionCopyVariable =>
    ({type: "copy_variable", origin, destination})

const log_attack_roll = (
    {context, attacker, attack, is_hit, defender, instruction, defense, action_log}: {
        context: PowerContext,
        attacker: Creature,
        attack: AstNodeNumberResolved,
        is_hit: boolean,
        defender: Creature,
        defense: AstNodeNumberResolved,
        instruction: InstructionAttackRoll
        action_log: ActionLog
    }) => action_log.add_new_action_log(
    `${attacker.data.name}'s ${context.power_name} (`,
    attack,
    `) ${is_hit ? "hits" : "misses"} against ${defender.data.name}'s ${instruction.defense} (`,
    defense,
    `).`
)
