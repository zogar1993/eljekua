import type {Position} from "core/battlegrid/Position";
import {ATTRIBUTES, type AttributeCode} from "core/character_sheet/attributes";
import type {Size} from "core/battlegrid/creatures/SIZES";
import type {IRPower} from "core/types";
import type {ScenarioCreatureSetup} from "scenario_test/ScenarioTest";
import {VISUAL_TEST_CREATURE_IMAGE_OPTIONS} from "web/visual_tests/visual_test_creature_images";

export const DEFAULT_SCENARIO_CREATURE_SIZE: Size = "medium"
export const DEFAULT_SCENARIO_CREATURE_MOVEMENT = 5
export const DEFAULT_SCENARIO_CREATURE_HP = 10
export const DEFAULT_SCENARIO_CREATURE_LEVEL = 1
export const DEFAULT_SCENARIO_CREATURE_ATTRIBUTE_VALUE = 10

export const create_default_creature_attributes = (): Record<AttributeCode, number> =>
    Object.fromEntries(
        Object.values(ATTRIBUTES).map(attribute => [attribute, DEFAULT_SCENARIO_CREATURE_ATTRIBUTE_VALUE]),
    ) as Record<AttributeCode, number>

export const create_default_scenario_creature_setup = ({
                                                           name,
                                                           position,
                                                       }: {
    name: string
    position: Position
}): ScenarioCreatureSetup => ({
    name,
    position,
    template: null,
    team: null,
    size: DEFAULT_SCENARIO_CREATURE_SIZE,
    image: VISUAL_TEST_CREATURE_IMAGE_OPTIONS[0].image,
    movement: DEFAULT_SCENARIO_CREATURE_MOVEMENT,
    hp_current: DEFAULT_SCENARIO_CREATURE_HP,
    hp_max: DEFAULT_SCENARIO_CREATURE_HP,
    level: DEFAULT_SCENARIO_CREATURE_LEVEL,
    attributes: create_default_creature_attributes(),
    powers: [] as Array<IRPower>,
    archetypes: [],
    resistances: {},
})
