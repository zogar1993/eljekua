import type {GameEvents} from "core/events/GameEvents";
import type {GameState} from "core/game_state/GameState";
import type {InstructionLoop} from "core/instruction_loop";
import type {IRPower} from "core/types";
import {apply_scenario_level_setup_to_game} from "scenario_test/apply_scenario_level_setup_to_game";
import {create_scenario_runner} from "scenario_test/create_scenario_runner";
import {resolve_creature_setup} from "scenario_test/resolve_creature_setup";
import {sanitize_scenario_path} from "scenario_test/sanitize_scenario_path";
import {create_empty_scenario, type ScenarioTest} from "scenario_test/ScenarioTest";
import {
    create_content_button,
    CONTENT_EDITOR_BUTTON_SIZE,
    CONTENT_EDITOR_BUTTON_VARIANT,
} from "web/content_editor/create_content_button";
import {create_creature_setup_form} from "web/visual_tests/create_creature_setup_form";
import {create_test_powers_panel} from "web/visual_tests/create_test_powers_panel";
import {create_expectation_editor} from "web/visual_tests/create_expectation_editor";
import {format_scenario_step_label} from "scenario_test/format_scenario_step_label";
import {create_field_group_title} from "web/visual_tests/create_labeled_field";
import {create_step_recorder} from "web/visual_tests/create_step_recorder";
import {create_scenario_test_tree} from "web/visual_tests/create_scenario_test_tree";
import {create_auto_save_scheduler} from "web/visual_tests/create_auto_save_scheduler";
import {open_create_test_modal} from "web/visual_tests/open_create_test_modal";
import {
    delete_scenario_test,
    list_scenario_tests,
    load_scenario_test_by_path,
    save_scenario_test,
} from "web/visual_tests/scenario_test_api";
import {parse_scenario_test_json, serialize_scenario_test_json} from "scenario_test/load_scenario_test";
import type {BattleGridVisual} from "web/core/battle_grid/BattleGridVisual";
import type {SquareVisual} from "web/core/battle_grid/squares/SquareVisual";
import {create_html_element} from "web/core/utils/create_html_element";
import type {ScenarioGame} from "scenario_test/create_scenario_game";

const REPLAY_STORAGE_KEY = "eljekua_scenario_replay"
const SCENARIO_LOAD_STORAGE_KEY = "eljekua_visual_test_reload"
const REPLAY_STEP_DELAY_MS = 400

const schedule_scenario_load_reload = (scenario: ScenarioTest) => {
    sessionStorage.setItem(SCENARIO_LOAD_STORAGE_KEY, serialize_scenario_test_json(scenario))
    window.location.reload()
}

const read_scheduled_scenario_load = (): ScenarioTest | null => {
    const raw = sessionStorage.getItem(SCENARIO_LOAD_STORAGE_KEY)
    if (!raw) return null
    sessionStorage.removeItem(SCENARIO_LOAD_STORAGE_KEY)
    return parse_scenario_test_json(raw)
}

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
    let scenario = create_empty_scenario({name: ""})
    let saved_path: string | null = null
    let available_powers: Array<IRPower> = []

    const html_panel = document.querySelector("#visual_tests")!
    html_panel.classList.add("visual-tests", "content-editor")

    const create_section = (...children: Array<HTMLElement>) => {
        const html_section = create_html_element("section", "visual-tests__section")
        html_section.append(...children)
        return html_section
    }

    const create_run_actions = (...buttons: Array<HTMLElement>) => {
        const html_actions = create_html_element("div", "visual-tests__run-actions")
        html_actions.append(...buttons)
        return html_actions
    }

    const get_scenario = () => scenario
    const set_scenario = (next_scenario: ScenarioTest) => {
        scenario = next_scenario
        if (saved_path !== null)
            auto_save.schedule_auto_save()
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

    const html_header = create_html_element("h1", "visual-tests__header")
    html_header.textContent = "Visual Tests"

    const get_current_scenario = (): ScenarioTest => ({
        ...scenario,
        name: saved_path ?? scenario.name,
    })

    const html_new_test_button = create_content_button({
        text: "New test",
        variant: CONTENT_EDITOR_BUTTON_VARIANT.SECONDARY,
        size: CONTENT_EDITOR_BUTTON_SIZE.SMALL,
    })

    const html_delete_test_button = create_content_button({
        text: "Delete test",
        variant: CONTENT_EDITOR_BUTTON_VARIANT.DANGER,
        size: CONTENT_EDITOR_BUTTON_SIZE.SMALL,
    })

    const html_test_actions = create_html_element("div", "visual-tests__test-actions")
    html_test_actions.append(html_new_test_button, html_delete_test_button)

    const html_start_battle_button = create_content_button({
        text: "Start battle",
        variant: CONTENT_EDITOR_BUTTON_VARIANT.PRIMARY,
        size: CONTENT_EDITOR_BUTTON_SIZE.SMALL,
    })

    const html_replay_button = create_content_button({
        text: "Visual replay",
        variant: CONTENT_EDITOR_BUTTON_VARIANT.SECONDARY,
        size: CONTENT_EDITOR_BUTTON_SIZE.SMALL,
    })

    const scenario_test_tree = create_scenario_test_tree({
        on_test_click: (path) => {
            void handle_test_tree_click(path)
        },
    })

    const html_saved_tests_title = create_field_group_title("Tests")

    const html_controls_title = create_field_group_title("Run")
    const html_level_setup_title = create_field_group_title("Level setup")
    const html_result_title = create_field_group_title("Result")
    const html_steps_title = create_field_group_title("Steps")

    const html_result = create_html_element("div", "visual-tests__result visual-tests__panel")

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
        on_placement_error: (message) => {
            set_result(message, false)
        },
    })

    const {html_panel: html_expectations, refresh_controls: refresh_expectation_controls, cancel_expectation_flow} = create_expectation_editor({
        get_scenario,
        set_scenario,
        get_game_state: () => game_state,
        is_battle_started: () => step_recorder.is_battle_started(),
        on_expectation_added: () => refresh_steps_list(),
        click_overlay,
        board,
        cancel_creature_placement,
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
            html_step.textContent = `${index + 1}. ${format_scenario_step_label(step)}`
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

    const auto_save = create_auto_save_scheduler({
        persist: async () => {
            if (saved_path === null)
                return

            try {
                const scenario_to_save = {...scenario, name: saved_path}
                await save_scenario_test(scenario_to_save)
                await refresh_saved_scenarios_list()
            } catch (error) {
                set_result(error instanceof Error ? error.message : String(error), false)
            }
        },
    })

    const test_powers_panel = create_test_powers_panel({
        get_test_path: () => saved_path ?? "",
        on_powers_changed: (powers) => {
            available_powers = powers
            refresh_creature_power_options()
        },
    })

    const refresh_test_ui_state = () => {
        html_delete_test_button.hidden = saved_path === null
        test_powers_panel.html_root.hidden = saved_path === null
    }

    const reset_editor_state = () => {
        cancel_creature_placement()
        cancel_expectation_flow()
        step_recorder.mark_loaded_scenario()
        html_start_battle_button.disabled = false
        refresh_level_setup_list()
        refresh_steps_list()
    }

    const open_new_test_modal = async () => {
        if (saved_path !== null) {
            try {
                await auto_save.flush_auto_save()
            } catch (error) {
                set_result(error instanceof Error ? error.message : String(error), false)
                return
            }
        }

        open_create_test_modal({
            on_accept: (path) => {
                void create_test_at_path(path).catch((error) => {
                    set_result(error instanceof Error ? error.message : String(error), false)
                })
            },
        })
    }

    const create_test_at_path = async (path: string) => {
        const test_path = sanitize_scenario_path(path)
        const new_scenario = create_empty_scenario({name: test_path})
        await save_scenario_test(new_scenario)
        schedule_scenario_load_reload(new_scenario)
    }

    const apply_loaded_scenario = (loaded: ScenarioTest) => {
        cancel_creature_placement()
        cancel_expectation_flow()
        saved_path = loaded.name
        scenario = loaded
        refresh_test_ui_state()
        scenario_test_tree.set_selected_path(loaded.name)
        apply_scenario_level_setup_to_game({scenario: loaded, add_creature_to_game})
        step_recorder.mark_loaded_scenario()
        html_start_battle_button.disabled = false
        refresh_level_setup_list()
        refresh_steps_list()
        void test_powers_panel.load_powers_for_test(loaded.name)
    }

    const load_scenario_by_path = async (path: string) => {
        const loaded = await load_scenario_test_by_path(path)
        schedule_scenario_load_reload(loaded)
    }

    const handle_test_tree_click = async (path: string) => {
        if (saved_path !== null) {
            try {
                await auto_save.flush_auto_save()
            } catch (error) {
                set_result(error instanceof Error ? error.message : String(error), false)
                return
            }
        }

        set_result("Loading...")
        try {
            await load_scenario_by_path(path)
        } catch (error) {
            set_result(error instanceof Error ? error.message : String(error), false)
        }
    }

    html_start_battle_button.addEventListener("click", () => {
        cancel_creature_placement()
        cancel_expectation_flow()
        step_recorder.begin_recording_at_battle_start()
        start_battle()
        html_start_battle_button.disabled = true
        refresh_steps_list()
    })

    html_new_test_button.addEventListener("click", () => {
        void open_new_test_modal()
    })

    html_delete_test_button.addEventListener("click", () => {
        if (saved_path === null)
            return

        const path_to_delete = saved_path

        void auto_save.run_without_auto_save(async () => {
            await auto_save.cancel_pending_save()
            saved_path = null
            refresh_test_ui_state()
            await delete_scenario_test(path_to_delete)
            await refresh_saved_scenarios_list()
            scenario = create_empty_scenario({name: ""})
            scenario_test_tree.set_selected_path("")
            available_powers = []
            reset_editor_state()
            set_result(`Deleted ${path_to_delete}.`, true)
        }).catch((error) => {
            set_result(error instanceof Error ? error.message : String(error), false)
        })
    })

    html_replay_button.addEventListener("click", () => {
        const flush = saved_path !== null ? auto_save.flush_auto_save() : Promise.resolve()
        void flush.then(() => {
            sessionStorage.setItem(REPLAY_STORAGE_KEY, JSON.stringify({
                scenario: get_current_scenario(),
                step_delay_ms: REPLAY_STEP_DELAY_MS,
            }))
            window.location.reload()
        })
    })

    html_panel.append(
        html_header,
        create_section(
            html_saved_tests_title,
            scenario_test_tree.html_tree,
            html_test_actions,
        ),
        create_section(test_powers_panel.html_root),
        create_section(html_creature_form),
        create_section(
            html_controls_title,
            create_run_actions(html_start_battle_button, html_replay_button),
        ),
        create_section(
            html_level_setup_title,
            html_level_setup_list,
        ),
        create_section(html_expectations),
        create_section(
            html_result_title,
            html_result,
        ),
        create_section(
            html_steps_title,
            html_steps_list,
        ),
    )

    const scheduled_scenario = read_scheduled_scenario_load()
    if (scheduled_scenario) {
        apply_loaded_scenario(scheduled_scenario)
        set_result(`Loaded ${scheduled_scenario.name}.`, true)
    } else {
        refresh_test_ui_state()
        reset_editor_state()
    }

    void refresh_saved_scenarios_list()

    return {
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
