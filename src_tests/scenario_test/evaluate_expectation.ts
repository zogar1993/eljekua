import type {Creatures} from "core/creatures/Creatures";
import type {GameState} from "core/game_state/GameState";
import {
    EXPECTATION_TYPE,
    type AttackLogEntry,
    type ScenarioExpectation,
} from "scenario_test/ScenarioTest";

export type ExpectationContext = {
    game_state: GameState
    attack_log: Array<AttackLogEntry>
}

const get_creature_by_name = ({creatures, creature_name}: { creatures: Creatures, creature_name: string }) => {
    const creature = creatures.get_all().find(entry => entry.data.name === creature_name)
    if (!creature) throw Error(`creature name "${creature_name}" not found`)
    return creature
}

export const evaluate_expectation = ({
                                         expectation,
                                         context,
                                     }: {
    expectation: ScenarioExpectation
    context: ExpectationContext
}): { passed: boolean, message: string } => {
    const {game_state, attack_log} = context
    const {creatures, initiative_order} = game_state

    switch (expectation.type) {
        case EXPECTATION_TYPE.CREATURE_POSITION: {
            const creature = get_creature_by_name({creatures, creature_name: expectation.creature_name})
            const passed = JSON.stringify(creature.data.position) === JSON.stringify(expectation.position)
            return {
                passed,
                message: passed
                    ? `${expectation.creature_name} is at expected position`
                    : `expected ${expectation.creature_name} at ${JSON.stringify(expectation.position)}, got ${JSON.stringify(creature.data.position)}`,
            }
        }
        case EXPECTATION_TYPE.CREATURE_HP: {
            const creature = get_creature_by_name({creatures, creature_name: expectation.creature_name})
            const passed = creature.data.hp_current === expectation.hp_current
            return {
                passed,
                message: passed
                    ? `${expectation.creature_name} has expected hp`
                    : `expected ${expectation.creature_name} hp ${expectation.hp_current}, got ${creature.data.hp_current}`,
            }
        }
        case EXPECTATION_TYPE.CURRENT_TURN: {
            const current_creature = initiative_order.get_current_creature()
            const passed = current_creature.data.name === expectation.creature_name
            return {
                passed,
                message: passed
                    ? `${expectation.creature_name} is the current turn creature`
                    : `expected current turn ${expectation.creature_name}, got ${current_creature.data.name}`,
            }
        }
        case EXPECTATION_TYPE.ATTACK_LOG: {
            const passed = attack_log.some(entry =>
                entry.attacker === expectation.attacker
                && entry.target === expectation.target
                && entry.power_name === expectation.power_name
            )
            return {
                passed,
                message: passed
                    ? `attack log contains ${expectation.attacker} → ${expectation.target} (${expectation.power_name})`
                    : `attack log missing entry: ${expectation.attacker} → ${expectation.target} (${expectation.power_name})`,
            }
        }
    }
}
