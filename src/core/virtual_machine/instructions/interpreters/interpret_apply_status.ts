import type {GameQueries} from "core/game_state/GameQueries";
import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {
    add_creature_status,
    type Creature,
    type CreatureRule,
    type StatusDuration,
} from "core/battlegrid/creatures/Creature";
import type {InstructionApplyStatus} from "core/virtual_machine/instructions/instructions";

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
            status: interpret_status_effect({instruction, game_queries, power_owner})
        })
}

const interpret_status_effect = ({instruction, game_queries, power_owner}: {
    instruction: InstructionApplyStatus,
    power_owner: Creature,
    game_queries: GameQueries
}) => ({
    rule: interpret_creature_rule({status: instruction.status, game_queries}),
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
                throw Error(`duration '${duration}' not supported`)
        }
    })
}

const interpret_creature_rule = ({status, game_queries}: {
    status: InstructionApplyStatus["status"],
    game_queries: GameQueries
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
                against_creatures: status.against_creatures ? game_queries.evaluate_creatures(status.against_creatures) : null,
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
        default:
            throw Error(`could not interpret status '${JSON.stringify(status)}'`)
    }
}
