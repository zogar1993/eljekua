import type {GameQueries} from "core/game_state/GameQueries";
import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {
    add_creature_status,
    type Creature,
    type CreatureRule,
    type StatusDuration,
} from "core/battlegrid/creatures/Creature";
import type {InstructionApplyStatus} from "core/virtual_machine/instructions/instructions";
import type {VMState} from "core/virtual_machine/VMState";
import {assert_unreachable} from "stdlib/assert";
import {transform_record_values} from "stdlib/record";

export const interpret_apply_status = ({
                                           instruction,
                                           game_state,
                                           game_queries,
                                       }: InterpretInstructionProps<InstructionApplyStatus>) => {
    const {vm_state} = game_state
    const targets = game_queries.evaluate_creatures(instruction.target)
    const power_owner = vm_state.get_acting_creature()

    for (const target of targets)
        add_creature_status({
            creature: target,
            status: interpret_status_effect({instruction, game_queries, power_owner, vm_state})
        })
}

const interpret_status_effect = ({instruction, game_queries, power_owner, vm_state}: {
    instruction: InstructionApplyStatus,
    power_owner: Creature,
    game_queries: GameQueries,
    vm_state: VMState,
}) => ({
    rule: interpret_creature_rule({instruction, game_queries, vm_state}),
    durations: interpret_duration({duration: instruction.duration, power_owner})
})

const interpret_duration = ({duration, power_owner}: {
    duration: InstructionApplyStatus["duration"],
    power_owner: Creature
}): Array<StatusDuration> => {
    return duration.map(duration => {
        switch (duration) {
            case "until_start_of_your_next_turn":
                return {
                    until: "turn_start",
                    creature: power_owner
                }
            case "until_start_of_next_turn":
                return {
                    until: "turn_start"
                }
            case "until_end_of_your_next_turn":
                return {
                    until: "next_turn_end",
                    creature: power_owner
                }
            case "until_your_next_attack_roll_against_target":
                return {
                    until: "next_attack_roll_against_target",
                    creature: power_owner
                }
            case "until_end_of_encounter":
                return {
                    until: "encounter_end",
                }
            default:
                assert_unreachable(`duration '${duration}' not supported`)
        }
    })
}

const interpret_creature_rule = ({instruction: {status, variables}, game_queries, vm_state}: {
    instruction: InstructionApplyStatus,
    game_queries: GameQueries,
    vm_state: VMState,
}): CreatureRule => {
    switch (status.type) {
        case "grant_combat_advantage":
            return {
                type: "grant_combat_advantage",
                against_creatures: status.against_creatures ? game_queries.evaluate_creatures(status.against_creatures) : null,
            }
        case "gain_attack_bonus":
            return {
                type: "gain_attack_bonus",
                value: game_queries.evaluate_number_resolved_expr(status.value),
                conditions: status.conditions,
                variables: transform_record_values(variables, (key) => vm_state.get_variable(key)),
            }
        case "gain_defense_bonus":
            return {
                type: "gain_defense_bonus",
                against_creatures: status.against_creatures ? game_queries.evaluate_creatures(status.against_creatures) : null,
                defense: status.defense,
                value: game_queries.evaluate_number_resolved_expr(status.value)
            }
        case "gain_resistance":
            return {
                type: "gain_resistance",
                against_creatures: status.against_creatures ? game_queries.evaluate_creatures(status.against_creatures) : null,
                against_damage_types: status.against_damage_types,
                value: game_queries.evaluate_number_resolved_expr(status.value)
            }
        case "gain_vulnerability":
            return {
                type: "gain_vulnerability",
                against_creatures: status.against_creatures ? game_queries.evaluate_creatures(status.against_creatures) : null,
                against_damage_types: status.against_damage_types,
                value: game_queries.evaluate_number_resolved_expr(status.value)
            }
        case "slowed":
            return {type: "slowed"}
        default:
            assert_unreachable(`could not interpret status '${JSON.stringify(status)}'`)
    }
}
