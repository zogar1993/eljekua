import type {Creatures} from "core/creatures/Creatures";
import {
    INTERACTION_TYPE,
    type InteractionSelection,
} from "core/interactions/Interactions";
import type {
    ScenarioHitStatusName,
    ScenarioSerializableInteractionSelection,
} from "scenario_test/ScenarioTest";

const HIT_STATUS_TO_SCENARIO_NAME = new Map<number, ScenarioHitStatusName>([
    [0, "miss"],
    [1, "hit"],
    [2, "crit"],
])

const get_creature_name_by_id = ({creatures, creature_id}: { creatures: Creatures, creature_id: number }) => {
    const creature = creatures.get_by_id(creature_id)
    return creature.data.name
}

export const serialize_interaction_selection = ({
                                                      creatures,
                                                      selection,
                                                  }: {
    creatures: Creatures
    selection: InteractionSelection
}): ScenarioSerializableInteractionSelection => {
    switch (selection.type) {
        case INTERACTION_TYPE.OPTION_SELECT:
            return selection
        case INTERACTION_TYPE.SELECT_PATH:
            return selection
        case INTERACTION_TYPE.SELECT_TERRAIN:
            return selection
        case INTERACTION_TYPE.SELECT_AREA:
            return selection
        case INTERACTION_TYPE.SELECT_CREATURE:
            return {
                type: INTERACTION_TYPE.SELECT_CREATURE,
                creature_name: get_creature_name_by_id({creatures, creature_id: selection.creature_id}),
            }
        case INTERACTION_TYPE.HIT_STATUS_SELECT:
            return {
                type: INTERACTION_TYPE.HIT_STATUS_SELECT,
                attack_rolls: selection.attack_rolls.map(({creature_id, hit_status}) => ({
                    creature_name: get_creature_name_by_id({creatures, creature_id}),
                    hit_status: HIT_STATUS_TO_SCENARIO_NAME.get(hit_status)!,
                })),
            }
    }
}
