import type {ScenarioGame} from "scenario_test/create_scenario_game";
import {resolve_creature_setup} from "scenario_test/resolve_creature_setup";
import type {ScenarioTest} from "scenario_test/ScenarioTest";

export const apply_scenario_level_setup_to_game = ({
                                                       scenario,
                                                       add_creature_to_game,
                                                   }: {
    scenario: ScenarioTest
    add_creature_to_game: ScenarioGame["add_creature_to_game"]
}) => {
    for (const creature of scenario.level_setup.creatures)
        add_creature_to_game({data: resolve_creature_setup(creature)})
}
