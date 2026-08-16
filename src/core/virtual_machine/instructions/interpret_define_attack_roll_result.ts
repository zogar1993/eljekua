import {roll_d} from "core/randomness/dice";
import {
    InterpretInstructionProps
} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {add_numbers_resolved} from "core/virtual_machine/expressions/number_utils";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import {get_creature_defense} from "core/character_sheet/get_creature_defense";
import {HIT_STATUS, HitStatus} from "core/battlegrid/player_turn_handler/HitStatus";
import {InstructionAttackDiceRoll} from "core/virtual_machine/instructions/instructions";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import {is_flanking} from "core/battlegrid/queries/is_flanking";
import {Creature} from "core/battlegrid/creatures/Creature";

const COMBAT_ADVANTAGE: ExprNumberResolved = {
    type: "number_resolved",
    value: 2,
    description: "Combat Advantage"
}

export const interpret_define_attack_roll_result = (props: InterpretInstructionProps<InstructionAttackDiceRoll>) => {
    const settings = props.settings
    if (settings.attack_roll_resolution_is_random)
        handle_hit_status_with_dice_roll(props)
    else
        handle_hit_status_manually(props)
}


const handle_hit_status_manually = ({
                                        turn_state,
                                        player_turn_handler,
                                        instruction
                                    }: InterpretInstructionProps<InstructionAttackDiceRoll>) => {
    const defenders = EXPR.as_creatures(turn_state.get_variable(instruction.defender))
    const hit_statuses = new Map<Creature, HitStatus>(defenders.map(defender => [defender, HIT_STATUS.MISS]))
    turn_state.set_variable(SYSTEM_KEYWORD.HIT_STATUS, {type: "attack_rolls", value: hit_statuses})

    player_turn_handler.set_available_interactions({
        type: "hit_status_select",
        hit_statuses,
        on_status_change: (creature: Creature, status: HitStatus) => {
            hit_statuses.set(creature, status)
            turn_state.set_variable(SYSTEM_KEYWORD.HIT_STATUS, {type: "attack_rolls", value: hit_statuses})
        },
        on_confirm: () => {
        }
    })
}

const handle_hit_status_with_dice_roll = ({
                                              instruction,
                                              battle_grid,
                                              evaluate_ast,
                                              turn_state,
                                              game_events,
                                          }: InterpretInstructionProps<InstructionAttackDiceRoll>) => {
    const attacker = EXPR.as_creature(turn_state.get_variable(SYSTEM_KEYWORD.OWNER))
    const defenders = EXPR.as_creatures(turn_state.get_variable(instruction.defender))
    const power_name = EXPR.as_string(turn_state.get_variable(SYSTEM_KEYWORD.POWER_NAME))

    const roll_results = new Map<Creature, HitStatus>()

    defenders.forEach(defender => {
        const attack_parts: Array<ExprNumberResolved> = []
        attack_parts.push(EXPR.as_number_resolved_expr(evaluate_ast(instruction.attack)))
        const attack_roll = roll_d(20)
        attack_parts.push(attack_roll)

        for (const {effect} of attacker.statuses)
            if (effect.type === "gain_attack_bonus" && effect.against.includes(defender))
                attack_parts.push(effect.value)

        attacker.remove_statuses({type: "next_attack_roll_against_target", creature: defender})

        if (
            is_flanking({attacker, defender, battle_grid}) ||
            defender.statuses.some(({effect}) => effect.type === "grant_combat_advantage" && effect.against.includes(attacker))
        ) attack_parts.push(COMBAT_ADVANTAGE)

        const attack = add_numbers_resolved(attack_parts)
        const defense = get_creature_defense({creature: defender, defense_code: instruction.defense})
        const surpasses_defense = attack.value >= defense.value
        const is_critical_range = attack_roll.value === 20

        const hit_status: HitStatus = surpasses_defense
            ? is_critical_range ? HIT_STATUS.CRIT : HIT_STATUS.HIT
            : is_critical_range ? HIT_STATUS.HIT : HIT_STATUS.MISS

        roll_results.set(defender, hit_status)

        turn_state.set_variable(SYSTEM_KEYWORD.HIT_STATUS, {type: "attack_rolls", value: roll_results})

        game_events.on_creature_attacked.raise({creature: attacker, attack, hit_status, defender, defense, instruction, power_name})
    })
}