import type {GameState} from "core/game_state/GameState";
import {
    EXPECTATION_TYPE,
    SCENARIO_STEP_TYPE,
    type ScenarioExpectation,
    type ScenarioTest,
} from "scenario_test/ScenarioTest";
import {create_field_group_title} from "web/visual_tests/create_labeled_field";
import {create_html_element} from "web/core/utils/create_html_element";

export const create_expectation_editor = ({
                                                get_scenario,
                                                set_scenario,
                                                get_game_state,
                                                is_battle_started,
                                                on_expectation_added,
                                            }: {
    get_scenario: () => ScenarioTest
    set_scenario: (scenario: ScenarioTest) => void
    get_game_state: () => GameState
    is_battle_started: () => boolean
    on_expectation_added: () => void
}) => {
    const html_panel = create_html_element("div", "visual-tests__expectations")
    html_panel.append(create_field_group_title("Expectations"))

    const expectation_buttons: Array<HTMLButtonElement> = []

    const refresh_controls = () => {
        const enabled = is_battle_started()
        for (const button of expectation_buttons)
            button.disabled = !enabled
    }

    const append_expectation = (expectation: ScenarioExpectation) => {
        if (!is_battle_started()) return
        const scenario = get_scenario()
        set_scenario({
            ...scenario,
            steps: [...scenario.steps, {type: SCENARIO_STEP_TYPE.EXPECT, expectation}],
        })
        on_expectation_added()
    }

    const add_button = (label: string, on_click: () => void) => {
        const button = document.createElement("button")
        button.className = "visual-tests__button"
        button.type = "button"
        button.textContent = label
        button.disabled = !is_battle_started()
        button.addEventListener("click", on_click)
        expectation_buttons.push(button)
        html_panel.append(button)
    }

    add_button("Expect current turn creature", () => {
        const {initiative_order} = get_game_state()
        const creature = initiative_order.get_current_creature()
        append_expectation({
            type: EXPECTATION_TYPE.CURRENT_TURN,
            creature_name: creature.data.name,
        })
    })

    add_button("Expect selected creature positions", () => {
        for (const creature of get_game_state().creatures.get_all()) {
            append_expectation({
                type: EXPECTATION_TYPE.CREATURE_POSITION,
                creature_name: creature.data.name,
                position: {...creature.data.position},
            })
        }
    })

    add_button("Expect selected creature hp", () => {
        for (const creature of get_game_state().creatures.get_all()) {
            append_expectation({
                type: EXPECTATION_TYPE.CREATURE_HP,
                creature_name: creature.data.name,
                hp_current: creature.data.hp_current,
            })
        }
    })

    return {html_panel, refresh_controls}
}
