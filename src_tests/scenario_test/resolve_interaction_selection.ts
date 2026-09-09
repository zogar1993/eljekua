import type {Creatures} from "core/creatures/Creatures";
import {
    INTERACTION_TYPE,
    type InteractionSelection,
} from "core/interactions/Interactions";
import {HIT_STATUS} from "core/virtual_machine/expressions/constants/HitStatus";
import type {
    ScenarioHitStatusName,
    ScenarioSerializableInteractionSelection,
} from "scenario_test/ScenarioTest";

const SCENARIO_HIT_STATUS_TO_VALUE = {
    miss: HIT_STATUS.MISS,
    hit: HIT_STATUS.HIT,
    crit: HIT_STATUS.CRIT,
} as const satisfies Record<ScenarioHitStatusName, typeof HIT_STATUS[keyof typeof HIT_STATUS]>

const get_creature_by_name = ({creatures, creature_name}: { creatures: Creatures, creature_name: string }) => {
    const creature = creatures.get_all().find(entry => entry.data.name === creature_name)
    if (!creature) throw Error(`creature name "${creature_name}" not found`)
    return creature
}

export const resolve_interaction_selection = ({
                                                  creatures,
                                                  selection,
                                              }: {
    creatures: Creatures
    selection: ScenarioSerializableInteractionSelection
}): InteractionSelection => {
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
                creature_id: get_creature_by_name({creatures, creature_name: selection.creature_name}).id,
            }
        case INTERACTION_TYPE.HIT_STATUS_SELECT:
            return {
                type: INTERACTION_TYPE.HIT_STATUS_SELECT,
                attack_rolls: selection.attack_rolls.map(({creature_name, hit_status}) => ({
                    creature_id: get_creature_by_name({creatures, creature_name}).id,
                    hit_status: SCENARIO_HIT_STATUS_TO_VALUE[hit_status],
                })),
            }
    }
}
