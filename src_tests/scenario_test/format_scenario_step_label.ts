import {INTERACTION_TYPE} from "core/interactions/Interactions";
import type {Position} from "core/battlegrid/Position";
import {
    EXPECTATION_TYPE,
    SCENARIO_STEP_TYPE,
    type ScenarioSerializableInteractionSelection,
    type ScenarioStep,
} from "scenario_test/ScenarioTest";

const format_position = ({x, y}: Position) => `(${x}, ${y})`

const format_interaction_selection_label = (selection: ScenarioSerializableInteractionSelection): string => {
    switch (selection.type) {
        case INTERACTION_TYPE.OPTION_SELECT:
            return `select option: ${selection.option}`
        case INTERACTION_TYPE.SELECT_CREATURE:
            return `select creature: ${selection.creature_name}`
        case INTERACTION_TYPE.SELECT_TERRAIN:
            return `select terrain: ${format_position(selection.position)}`
        case INTERACTION_TYPE.SELECT_AREA:
            return `select area: ${format_position(selection.center)}`
        case INTERACTION_TYPE.SELECT_PATH: {
            if (selection.path.length === 0)
                return "select path: (empty)"
            const start = format_position(selection.path[0])
            const end = format_position(selection.path[selection.path.length - 1])
            if (selection.path.length === 1)
                return `select path: ${start}`
            return `select path: ${start} → ${end}`
        }
        case INTERACTION_TYPE.HIT_STATUS_SELECT:
            return `select hit status: ${selection.attack_rolls
                .map(({creature_name, hit_status}) => `${creature_name}=${hit_status}`)
                .join(", ")}`
    }
}

export const format_scenario_step_label = (step: ScenarioStep): string => {
    switch (step.type) {
        case SCENARIO_STEP_TYPE.SET_TURN:
            return `set turn: ${step.creature_name}`
        case SCENARIO_STEP_TYPE.INTERACTION:
            return format_interaction_selection_label(step.selection)
        case SCENARIO_STEP_TYPE.EXPECT: {
            const {expectation} = step
            switch (expectation.type) {
                case EXPECTATION_TYPE.CREATURE_POSITION:
                    return `expect position: ${expectation.creature_name} @ (${expectation.position.x}, ${expectation.position.y})`
                case EXPECTATION_TYPE.CREATURE_HP:
                    return `expect hp: ${expectation.creature_name} = ${expectation.hp_current}`
                case EXPECTATION_TYPE.CURRENT_TURN:
                    return `expect turn: ${expectation.creature_name}`
                case EXPECTATION_TYPE.ATTACK_LOG:
                    return `expect attack: ${expectation.attacker} → ${expectation.target} (${expectation.power_name})`
            }
        }
    }
}
