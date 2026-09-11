import {
    EXPECTATION_TYPE,
    SCENARIO_STEP_TYPE,
    type ScenarioStep,
} from "scenario_test/ScenarioTest";

export const format_scenario_step_label = (step: ScenarioStep): string => {
    switch (step.type) {
        case SCENARIO_STEP_TYPE.SET_TURN:
            return `set turn: ${step.creature_name}`
        case SCENARIO_STEP_TYPE.INTERACTION:
            return `interaction: ${step.selection.type}`
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
