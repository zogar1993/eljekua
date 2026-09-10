import type {InstructionLoop} from "core/instruction_loop";
import type {Creatures} from "core/creatures/Creatures";
import {serialize_interaction_selection} from "scenario_test/serialize_interaction_selection";
import {
    SCENARIO_STEP_TYPE,
    type ScenarioCreatureSetup,
    type ScenarioTest,
} from "scenario_test/ScenarioTest";

export const create_step_recorder = ({
                                         get_scenario,
                                         set_scenario,
                                         get_creatures,
                                         on_scenario_changed,
                                     }: {
    get_scenario: () => ScenarioTest
    set_scenario: (scenario: ScenarioTest) => void
    get_creatures: () => Creatures
    on_scenario_changed: () => void
}) => {
    let is_recording = false

    const notify_scenario_changed = () => {
        on_scenario_changed()
    }

    const append_recorded_step = (step: ScenarioTest["steps"][number]) => {
        if (!is_recording) return
        const scenario = get_scenario()
        set_scenario({...scenario, steps: [...scenario.steps, step]})
        notify_scenario_changed()
    }

    const record_add_creature = (creature: ScenarioCreatureSetup) => {
        if (is_recording) return
        const scenario = get_scenario()
        set_scenario({
            ...scenario,
            level_setup: {
                ...scenario.level_setup,
                creatures: [...scenario.level_setup.creatures, creature],
            },
        })
        notify_scenario_changed()
    }

    const begin_recording_at_battle_start = () => {
        is_recording = true
        notify_scenario_changed()
    }

    const record_set_turn = (creature_name: string) => {
        append_recorded_step({type: SCENARIO_STEP_TYPE.SET_TURN, creature_name})
    }

    const is_battle_started = () => is_recording

    const mark_loaded_scenario = () => {
        is_recording = false
        notify_scenario_changed()
    }

    const wrap_instruction_loop = (instruction_loop: InstructionLoop) => {
        const original_select = instruction_loop.select.bind(instruction_loop)

        instruction_loop.select = (selection) => {
            append_recorded_step({
                type: SCENARIO_STEP_TYPE.INTERACTION,
                selection: serialize_interaction_selection({
                    creatures: get_creatures(),
                    selection,
                }),
            })
            original_select(selection)
        }
    }

    return {
        record_add_creature,
        begin_recording_at_battle_start,
        record_set_turn,
        is_battle_started,
        mark_loaded_scenario,
        wrap_instruction_loop,
    }
}
