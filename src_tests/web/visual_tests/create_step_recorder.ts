import type {InstructionLoop} from "core/instruction_loop";
import type {Creatures} from "core/creatures/Creatures";
import {serialize_interaction_selection} from "scenario_test/serialize_interaction_selection";
import {
    SCENARIO_STEP_TYPE,
    type ScenarioCreatureSetup,
    type ScenarioStep,
    type ScenarioTest,
} from "scenario_test/ScenarioTest";

export const create_step_recorder = ({
                                         get_scenario,
                                         set_scenario,
                                         get_creatures,
                                         on_steps_changed,
                                     }: {
    get_scenario: () => ScenarioTest
    set_scenario: (scenario: ScenarioTest) => void
    get_creatures: () => Creatures
    on_steps_changed: () => void
}) => {
    let is_recording = false
    let pending_setup_steps: Array<ScenarioStep> = []

    const notify_steps_changed = () => {
        on_steps_changed()
    }

    const append_recorded_step = (step: ScenarioStep) => {
        if (!is_recording) return
        const scenario = get_scenario()
        set_scenario({...scenario, steps: [...scenario.steps, step]})
        notify_steps_changed()
    }

    const record_add_creature = (creature: ScenarioCreatureSetup) => {
        const step: ScenarioStep = {type: SCENARIO_STEP_TYPE.ADD_CREATURE, creature}
        if (is_recording) {
            append_recorded_step(step)
            return
        }
        pending_setup_steps = [...pending_setup_steps, step]
        notify_steps_changed()
    }

    const begin_recording_at_battle_start = () => {
        is_recording = true
        set_scenario({
            ...get_scenario(),
            steps: [
                ...pending_setup_steps,
                {type: SCENARIO_STEP_TYPE.START_BATTLE},
            ],
        })
        pending_setup_steps = []
        notify_steps_changed()
    }

    const record_set_turn = (creature_name: string) => {
        append_recorded_step({type: SCENARIO_STEP_TYPE.SET_TURN, creature_name})
    }

    const get_display_steps = (): Array<ScenarioStep> => {
        if (is_recording) return get_scenario().steps
        return pending_setup_steps
    }

    const is_battle_started = () => is_recording

    const reset = () => {
        is_recording = false
        pending_setup_steps = []
        notify_steps_changed()
    }

    const mark_loaded_scenario_as_recording = () => {
        is_recording = get_scenario().steps.some(step => step.type === SCENARIO_STEP_TYPE.START_BATTLE)
        pending_setup_steps = []
        notify_steps_changed()
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
        get_display_steps,
        is_battle_started,
        reset,
        mark_loaded_scenario_as_recording,
        wrap_instruction_loop,
    }
}

export type StepRecorder = ReturnType<typeof create_step_recorder>
