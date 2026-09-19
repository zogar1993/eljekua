import {
    create_default_creature_attributes,
    create_default_scenario_creature_setup,
} from "scenario_test/default_scenario_creature";
import type {ScenarioCreatureSetup} from "scenario_test/ScenarioTest";

export type CreatureSetupDraft = Omit<ScenarioCreatureSetup, "position">

export const create_default_creature_setup_draft = (): CreatureSetupDraft => {
    const {position: _position, ...draft} = create_default_scenario_creature_setup({
        name: "",
        position: {x: 0, y: 0, footprint: 1},
    })
    return {
        ...draft,
        name: "",
    }
}

export {create_default_creature_attributes}
