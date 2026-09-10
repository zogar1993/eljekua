import type {GameEvents} from "core/events/GameEvents";
import type {GameState} from "core/game_state/GameState";
import type {InstructionLoop} from "core/instruction_loop";
import type {IRPower} from "core/types";
import {apply_scenario_level_setup_to_game} from "scenario_test/apply_scenario_level_setup_to_game";
import {create_scenario_runner} from "scenario_test/create_scenario_runner";
import {resolve_creature_setup} from "scenario_test/resolve_creature_setup";
import {create_empty_scenario, type ScenarioTest} from "scenario_test/ScenarioTest";
import {create_creature_setup_form} from "web/visual_tests/create_creature_setup_form";
import {create_test_powers_panel} from "web/visual_tests/create_test_powers_panel";
import {create_scenario_dirty_state} from "web/visual_tests/create_scenario_dirty_state";
import {create_expectation_editor} from "web/visual_tests/create_expectation_editor";
import {create_field_group_title, create_labeled_field} from "web/visual_tests/create_labeled_field";
import {create_step_recorder} from "web/visual_tests/create_step_recorder";
import {create_scenario_test_tree} from "web/visual_tests/create_scenario_test_tree";
import {prompt_unsaved_changes} from "web/visual_tests/prompt_unsaved_changes";
import {
    list_scenario_tests,
    load_scenario_test_by_path,
    save_scenario_test,
} from "web/visual_tests/scenario_test_api";
import {read_scheduled_visual_test_reload, schedule_visual_test_reload} from "web/visual_tests/schedule_visual_test_reload";
import type {BattleGridVisual} from "web/core/battle_grid/BattleGridVisual";
import type {SquareVisual} from "web/core/battle_grid/squares/SquareVisual";
import {create_html_element} from "web/core/utils/create_html_element";
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
    let available_powers: Array<IRPower> = []
    const scenario_dirty_state = create_scenario_dirty_state()
    scenario_dirty_state.mark_clean(scenario)

    const html_panel = document.querySelector("#visual_tests")!
    html_panel.classList.add("visual-tests")

    const get_scenario = () => scenario
    const set_scenario = (next_scenario: ScenarioTest) => {
        scenario = next_scenario
        refresh_scenario_name_input()
    }

    const html_level_setup_list = create_html_element("ul", "visual-tests__level-setup-list")
    const html_steps_list = create_html_element("ol", "visual-tests__steps-list")

    const step_recorder = create_step_recorder({
        get_scenario,
        set_scenario,
        get_creatures: () => game_state.creatures,
        on_scenario_changed: () => {
            refresh_level_setup_list()
            refresh_steps_list()
        },
    })
    step_recorder.wrap_instruction_loop(instruction_loop)

    const html_header = create_html_element("div", "visual-tests__header")
    html_header.textContent = "Visual Tests"

    const html_name_input = create_html_element("input", "visual-tests__input") as HTMLInputElement
    html_name_input.value = scenario.name
    const get_current_scenario = () => ({...scenario, name: html_name_input.value.trim() || "untitled_scenario"})

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
        on_test_click: (path) => {
            void handle_test_tree_click(path)
        },
    })

    const html_saved_tests_title = create_field_group_title("Saved tests")

    const html_controls_title = create_field_group_title("Run")
    const html_level_setup_title = create_field_group_title("Level setup")
    const html_result_title = create_field_group_title("Result")
    const html_steps_title = create_field_group_title("Steps")

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

    const refresh_level_setup_list = () => {
        html_level_setup_list.replaceChildren()
        for (const creature of scenario.level_setup.creatures) {
            const html_creature = create_html_element("li", "visual-tests__level-setup-item")
            html_creature.textContent = `${creature.name} @ (${creature.position.x}, ${creature.position.y})`
            html_level_setup_list.append(html_creature)
        }
    }

    const refresh_steps_list = () => {
        html_steps_list.replaceChildren()
        if (!step_recorder.is_battle_started()) {
            refresh_expectation_controls()
            return
        }

        scenario.steps.forEach((step, index) => {
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

    const save_current_scenario = async () => {
        const scenario_to_save = get_current_scenario()
        const saved = await save_scenario_test(scenario_to_save)
        const saved_path = saved.replace(/\.json$/, "").replace(/\\/g, "/")
        const saved_scenario = {...scenario_to_save, name: saved_path}
        set_scenario(saved_scenario)
        html_name_input.value = saved_path
        scenario_dirty_state.mark_clean(saved_scenario)
        await refresh_saved_scenarios_list()
        scenario_test_tree.set_selected_path(saved_path)
        void test_powers_panel.load_powers_for_test(saved_path)
        return saved_path
    }

    const {html_form: html_creature_form, cancel_placement: cancel_creature_placement, refresh_power_options: refresh_creature_power_options} = create_creature_setup_form({
        click_overlay,
        board,
        game_state,
        can_place_creature: () => !step_recorder.is_battle_started(),
        get_available_powers: () => available_powers,
        on_add_creature: (creature_setup) => {
            add_creature_to_game({data: resolve_creature_setup(creature_setup)})
            step_recorder.record_add_creature(creature_setup)
        },
    })

    const test_powers_panel = create_test_powers_panel({
        get_test_path: () => get_current_scenario().name,
        on_powers_changed: (powers) => {
            available_powers = powers
            refresh_creature_power_options()
        },
    })

    html_name_input.addEventListener("change", () => {
        void test_powers_panel.load_powers_for_test(get_current_scenario().name)
    })

    const apply_loaded_scenario = (loaded: ScenarioTest) => {
        cancel_creature_placement()
        set_scenario(loaded)
        html_name_input.value = loaded.name
        scenario_test_tree.set_selected_path(loaded.name)
        apply_scenario_level_setup_to_game({scenario: loaded, add_creature_to_game})
        step_recorder.mark_loaded_scenario()
        html_start_battle_button.disabled = false
        scenario_dirty_state.mark_clean(loaded)
        refresh_level_setup_list()
        refresh_steps_list()
        void test_powers_panel.load_powers_for_test(loaded.name)
    }

    const load_scenario_by_path = async (path: string) => {
        const loaded = await load_scenario_test_by_path(path)
        schedule_visual_test_reload(loaded)
    }

    const handle_test_tree_click = async (path: string) => {
        const current_scenario = get_current_scenario()
        if (scenario_dirty_state.is_dirty(current_scenario)) {
            const choice = await prompt_unsaved_changes()
            if (choice === "cancel")
                return
            if (choice === "save") {
                set_result("Saving...")
                try {
                    await save_current_scenario()
                } catch (error) {
                    set_result(error instanceof Error ? error.message : String(error), false)
                    return
                }
            }
        }

        set_result("Loading...")
        try {
            await load_scenario_by_path(path)
        } catch (error) {
            set_result(error instanceof Error ? error.message : String(error), false)
        }
    }

    html_clear_button.addEventListener("click", () => {
        schedule_visual_test_reload(create_empty_scenario({
            name: scenario.name,
            level_setup: {
                battle_grid_size: scenario.level_setup.battle_grid_size,
                creatures: [],
            },
        }))
    })

    html_start_battle_button.addEventListener("click", () => {
        cancel_creature_placement()
        step_recorder.begin_recording_at_battle_start()
        start_battle()
        html_start_battle_button.disabled = true
        refresh_steps_list()
    })

    html_run_button.addEventListener("click", async () => {
        set_result("Running...")
        const runner = create_scenario_runner()
        const result = await runner.run({scenario: get_current_scenario()})
        if (result.passed) {
            set_result("Scenario passed.", true)
            return
        }
        const first_failure = result.failures[0]
        set_result(`Scenario failed at step ${first_failure.step_index + 1}: ${first_failure.message}`, false)
    })

    html_replay_button.addEventListener("click", () => {
        sessionStorage.setItem(REPLAY_STORAGE_KEY, JSON.stringify({
            scenario: get_current_scenario(),
            step_delay_ms: REPLAY_STEP_DELAY_MS,
        }))
        window.location.reload()
    })

    html_save_button.addEventListener("click", async () => {
        set_result("Saving...")
        try {
            const saved_path = await save_current_scenario()
            set_result(`Saved to src_tests/scenarios/${saved_path}.json.`, true)
        } catch (error) {
            set_result(error instanceof Error ? error.message : String(error), false)
        }
    })

    html_panel.append(
        html_header,
        html_scenario_name_field,
        test_powers_panel.html_root,
        html_creature_form,
        html_controls_title,
        html_clear_button,
        html_start_battle_button,
        html_run_button,
        html_replay_button,
        html_save_button,
        html_saved_tests_title,
        scenario_test_tree.html_tree,
        html_level_setup_title,
        html_level_setup_list,
        html_expectations,
        html_result_title,
        html_result,
        html_steps_title,
        html_steps_list,
    )

    const scheduled_scenario = read_scheduled_visual_test_reload()
    if (scheduled_scenario) {
        apply_loaded_scenario(scheduled_scenario)
        set_result(`Loaded ${scheduled_scenario.name}.`, true)
    } else {
        refresh_level_setup_list()
        refresh_steps_list()
        void test_powers_panel.load_powers_for_test(scenario.name)
    }

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
            apply_loaded_scenario(replay_scenario)
            step_recorder.begin_recording_at_battle_start()
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
