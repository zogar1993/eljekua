import type {GameEvents} from "core/events/GameEvents";
import type {GameState} from "core/game_state/GameState";
import type {InstructionLoop} from "core/instruction_loop";
import {create_scenario_runner} from "scenario_test/create_scenario_runner";
import {resolve_creature_setup} from "scenario_test/resolve_creature_setup";
import {create_empty_scenario, type ScenarioTest} from "scenario_test/ScenarioTest";
import {create_creature_setup_form} from "web/visual_tests/create_creature_setup_form";
import {create_expectation_editor} from "web/visual_tests/create_expectation_editor";
import {create_field_group_title, create_labeled_field} from "web/visual_tests/create_labeled_field";
import {create_step_recorder} from "web/visual_tests/create_step_recorder";
import {create_scenario_test_tree} from "web/visual_tests/create_scenario_test_tree";
import {
    list_scenario_tests,
    load_scenario_test_by_path,
    save_scenario_test,
} from "web/visual_tests/scenario_test_api";
import type {BattleGridVisual} from "web/battle_grid/BattleGridVisual";
import type {SquareVisual} from "web/battle_grid/squares/SquareVisual";
import {create_html_element} from "web/utils/create_html_element";
import type {ScenarioGame} from "scenario_test/create_scenario_game";

const REPLAY_STORAGE_KEY = "eljekua_scenario_replay"
const REPLAY_STEP_DELAY_MS = 400

export const create_visual_tests_ui = ({
                                           game_events,
                                           game_state,
                                           instruction_loop,
                                           add_creature_to_game,
                                           start_battle,
                                           set_current_turn_to_creature,
                                           click_overlay,
                                           board,
                                       }: {
    game_events: GameEvents
    game_state: GameState
    instruction_loop: InstructionLoop
    add_creature_to_game: ScenarioGame["add_creature_to_game"]
    start_battle: ScenarioGame["start_battle"]
    set_current_turn_to_creature: ScenarioGame["set_current_turn_to_creature"]
    click_overlay: BattleGridVisual
    board: Array<Array<SquareVisual>>
}) => {
    let scenario = create_empty_scenario()

    const html_panel = document.querySelector("#visual_tests")!
    html_panel.classList.add("visual-tests")

    const get_scenario = () => scenario
    const set_scenario = (next_scenario: ScenarioTest) => {
        scenario = next_scenario
        refresh_scenario_name_input()
    }

    const html_steps_list = create_html_element("ol", "visual-tests__steps-list")

    const step_recorder = create_step_recorder({
        get_scenario,
        set_scenario,
        get_creatures: () => game_state.creatures,
        on_steps_changed: () => refresh_steps_list(),
    })
    step_recorder.wrap_instruction_loop(instruction_loop)

    const html_header = create_html_element("div", "visual-tests__header")
    html_header.textContent = "Visual Tests"

    const html_name_input = create_html_element("input", "visual-tests__input") as HTMLInputElement
    html_name_input.value = scenario.name
    const sync_scenario_name_from_input = () => {
        const name = html_name_input.value.trim() || "untitled_scenario"
        set_scenario({...scenario, name})
        return name
    }

    html_name_input.addEventListener("input", () => {
        sync_scenario_name_from_input()
    })
    const html_scenario_name_field = create_labeled_field({
        label: "Test path",
        control: html_name_input,
    })

    const create_button = (class_name: string, text: string) => {
        const button = document.createElement("button")
        button.className = class_name
        button.type = "button"
        button.textContent = text
        return button
    }

    const html_clear_button = create_button("visual-tests__button", "Clear scenario")
    const html_start_battle_button = create_button("visual-tests__button", "Start battle")
    const html_run_button = create_button("visual-tests__button", "Run scenario")
    const html_replay_button = create_button("visual-tests__button", "Visual replay")
    const html_save_button = create_button("visual-tests__button", "Save test")

    html_name_input.placeholder = "folder/test_name"

    const scenario_test_tree = create_scenario_test_tree({
        on_select: (path) => {
            html_name_input.value = path
            set_scenario({...scenario, name: path})
        },
    })

    const html_load_button = create_button("visual-tests__button", "Load test")
    const html_saved_tests_title = create_field_group_title("Saved tests")

    const html_controls_title = create_field_group_title("Run")
    const html_result_title = create_field_group_title("Result")
    const html_steps_title = create_field_group_title("Scenario steps")

    const html_result = create_html_element("div", "visual-tests__result")

    const refresh_scenario_name_input = () => {
        html_name_input.value = scenario.name
    }

    const {html_panel: html_expectations, refresh_controls: refresh_expectation_controls} = create_expectation_editor({
        get_scenario,
        set_scenario,
        get_game_state: () => game_state,
        is_battle_started: () => step_recorder.is_battle_started(),
        on_expectation_added: () => refresh_steps_list(),
    })

    const refresh_steps_list = () => {
        html_steps_list.replaceChildren()
        const steps = step_recorder.is_battle_started()
            ? scenario.steps
            : step_recorder.get_display_steps()

        steps.forEach((step, index) => {
            const html_step = create_html_element("li", "visual-tests__step")
            html_step.textContent = `${index + 1}. ${step.type}`
            html_steps_list.append(html_step)
        })
        refresh_expectation_controls()
    }

    const refresh_saved_scenarios_list = async () => {
        try {
            const paths = await list_scenario_tests()
            await scenario_test_tree.refresh(paths)
        } catch {
            scenario_test_tree.show_error("Scenario server unavailable")
        }
    }

    const set_result = (text: string, passed?: boolean) => {
        html_result.textContent = text
        html_result.classList.toggle("visual-tests__result--passed", passed === true)
        html_result.classList.toggle("visual-tests__result--failed", passed === false)
    }

    html_clear_button.addEventListener("click", () => {
        cancel_creature_placement()
        step_recorder.reset()
        set_scenario(create_empty_scenario({name: scenario.name, battle_grid_size: scenario.battle_grid_size}))
        html_start_battle_button.disabled = false
        refresh_steps_list()
        set_result("")
    })

    html_start_battle_button.addEventListener("click", () => {
        cancel_creature_placement()
        step_recorder.begin_recording_at_battle_start()
        start_battle()
        html_start_battle_button.disabled = true
    })

    html_run_button.addEventListener("click", async () => {
        set_result("Running...")
        const runner = create_scenario_runner()
        const result = await runner.run({scenario})
        if (result.passed) {
            set_result("Scenario passed.", true)
            return
        }
        const first_failure = result.failures[0]
        set_result(`Scenario failed at step ${first_failure.step_index + 1}: ${first_failure.message}`, false)
    })

    html_replay_button.addEventListener("click", () => {
        sessionStorage.setItem(REPLAY_STORAGE_KEY, JSON.stringify({
            scenario,
            step_delay_ms: REPLAY_STEP_DELAY_MS,
        }))
        window.location.reload()
    })

    html_save_button.addEventListener("click", async () => {
        set_result("Saving...")
        try {
            const scenario_to_save = {...scenario, name: sync_scenario_name_from_input()}
            const saved = await save_scenario_test(scenario_to_save)
            const saved_path = saved.replace(/\.json$/, "").replace(/\\/g, "/")
            set_scenario({...scenario_to_save, name: saved_path})
            html_name_input.value = saved_path
            await refresh_saved_scenarios_list()
            scenario_test_tree.set_selected_path(saved_path)
            set_result(`Saved to src_tests/scenarios/${saved}.`, true)
        } catch (error) {
            set_result(error instanceof Error ? error.message : String(error), false)
        }
    })

    html_load_button.addEventListener("click", async () => {
        const path = scenario_test_tree.get_selected_path()
        if (!path) {
            set_result("Select a saved test to load.", false)
            return
        }

        set_result("Loading...")
        try {
            const loaded = await load_scenario_test_by_path(path)
            set_scenario(loaded)
            html_name_input.value = loaded.name
            scenario_test_tree.set_selected_path(loaded.name)
            step_recorder.mark_loaded_scenario_as_recording()
            html_start_battle_button.disabled = step_recorder.is_battle_started()
            refresh_steps_list()
            set_result(`Loaded ${path}.`, true)
        } catch (error) {
            set_result(error instanceof Error ? error.message : String(error), false)
        }
    })

    const {html_form: html_creature_form, cancel_placement: cancel_creature_placement} = create_creature_setup_form({
        click_overlay,
        board,
        game_state,
        can_place_creature: () => !step_recorder.is_battle_started(),
        on_add_creature: (creature_setup) => {
            add_creature_to_game({data: resolve_creature_setup(creature_setup)})
            step_recorder.record_add_creature(creature_setup)
        },
    })

    html_panel.append(
        html_header,
        html_scenario_name_field,
        html_creature_form,
        html_controls_title,
        html_clear_button,
        html_start_battle_button,
        html_run_button,
        html_replay_button,
        html_save_button,
        html_saved_tests_title,
        scenario_test_tree.html_tree,
        html_load_button,
        html_expectations,
        html_result_title,
        html_result,
        html_steps_title,
        html_steps_list,
    )

    refresh_steps_list()
    void refresh_saved_scenarios_list()

    return {
        get_scenario,
        set_scenario,
        run_replay_if_scheduled: async () => {
            const raw = sessionStorage.getItem(REPLAY_STORAGE_KEY)
            if (!raw) return

            sessionStorage.removeItem(REPLAY_STORAGE_KEY)
            const {scenario: replay_scenario, step_delay_ms} = JSON.parse(raw) as {
                scenario: ScenarioTest
                step_delay_ms: number
            }
            set_scenario(replay_scenario)
            step_recorder.mark_loaded_scenario_as_recording()
            html_start_battle_button.disabled = true
            refresh_steps_list()
            set_result("Replaying...")

            const runner = create_scenario_runner()
            const result = await runner.run({
                scenario: replay_scenario,
                game: {
                    game_events,
                    game_state,
                    instruction_loop,
                    add_creature_to_game,
                    start_battle,
                    set_current_turn_to_creature,
                },
                step_delay_ms,
                on_step: (step_index) => {
                    html_steps_list.querySelectorAll(".visual-tests__step").forEach((element, index) => {
                        element.classList.toggle("visual-tests__step--active", index === step_index)
                    })
                },
            })

            if (result.passed)
                set_result("Replay finished. Scenario passed.", true)
            else {
                const first_failure = result.failures[0]
                set_result(`Replay failed at step ${first_failure.step_index + 1}: ${first_failure.message}`, false)
            }
        },
        expose_set_current_turn: (creature_name: string) => {
            step_recorder.record_set_turn(creature_name)
        },
    }
}
