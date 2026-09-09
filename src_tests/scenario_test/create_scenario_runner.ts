import type {GameEvents} from "core/events/GameEvents";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {apply_scenario_level_setup_to_game} from "scenario_test/apply_scenario_level_setup_to_game";
import {create_scenario_game, type ScenarioGame} from "scenario_test/create_scenario_game";
import {evaluate_expectation} from "scenario_test/evaluate_expectation";
import {resolve_interaction_selection} from "scenario_test/resolve_interaction_selection";
import {
    SCENARIO_STEP_TYPE,
    type AttackLogEntry,
    type ScenarioRunResult,
    type ScenarioTest,
} from "scenario_test/ScenarioTest";

const create_attack_log = ({game_events, game}: { game_events: GameEvents, game: ScenarioGame }) => {
    const attack_log: Array<AttackLogEntry> = []
    const {vm_state} = game.game_state

    game_events.on_creature_attacked.add_handler(({creature, defender, power_name}) => {
        attack_log.push({
            attacker: creature.data.name,
            target: defender.data.name,
            power_name,
        })
    })

    game_events.on_creature_missed.add_handler((target) => {
        const attacker = EXPR.as_creature(vm_state.get_variable(SYSTEM_KEYWORD.OWNER))
        const power_name = EXPR.as_string(vm_state.get_variable(SYSTEM_KEYWORD.POWER_NAME))
        attack_log.push({
            attacker: attacker.data.name,
            target: target.data.name,
            power_name,
        })
    })

    return attack_log
}

export const create_scenario_runner = () => {
    const run = ({
                     scenario,
                     game,
                     step_delay_ms = 0,
                     on_step,
                 }: {
        scenario: ScenarioTest
        game?: ScenarioGame
        step_delay_ms?: number
        on_step?: (step_index: number) => void
    }): Promise<ScenarioRunResult> => {
        return run_scenario({scenario, game, step_delay_ms, on_step})
    }

    return {run}
}

const run_scenario = async ({
                                scenario,
                                game: existing_game,
                                step_delay_ms,
                                on_step,
                            }: {
    scenario: ScenarioTest
    game?: ScenarioGame
    step_delay_ms: number
    on_step?: (step_index: number) => void
}): Promise<ScenarioRunResult> => {
    const game = existing_game ?? create_scenario_game({battle_grid_size: scenario.level_setup.battle_grid_size})
    const {game_events, game_state, instruction_loop, add_creature_to_game, start_battle, set_current_turn_to_creature} = game
    const {creatures} = game_state
    const attack_log = create_attack_log({game_events, game})
    const failures: ScenarioRunResult["failures"] = []

    if (!existing_game)
        apply_scenario_level_setup_to_game({scenario, add_creature_to_game})

    start_battle()

    for (let step_index = 0; step_index < scenario.steps.length; step_index++) {
        const step = scenario.steps[step_index]
        on_step?.(step_index)

        try {
            switch (step.type) {
                case SCENARIO_STEP_TYPE.SET_TURN: {
                    const creature = creatures.get_all().find(entry => entry.data.name === step.creature_name)
                    if (!creature) throw Error(`creature name "${step.creature_name}" not found`)
                    set_current_turn_to_creature({creature})
                    instruction_loop.run()
                    break
                }
                case SCENARIO_STEP_TYPE.INTERACTION:
                    instruction_loop.select(resolve_interaction_selection({
                        creatures,
                        selection: step.selection,
                    }))
                    break
                case SCENARIO_STEP_TYPE.EXPECT: {
                    const result = evaluate_expectation({
                        expectation: step.expectation,
                        context: {game_state, attack_log},
                    })
                    if (!result.passed)
                        failures.push({step_index, message: result.message})
                    break
                }
            }
        } catch (error) {
            failures.push({
                step_index,
                message: error instanceof Error ? error.message : String(error),
            })
        }

        if (step_delay_ms > 0)
            await delay(step_delay_ms)
    }

    return {
        passed: failures.length === 0,
        failures,
    }
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export type ScenarioRunner = ReturnType<typeof create_scenario_runner>
