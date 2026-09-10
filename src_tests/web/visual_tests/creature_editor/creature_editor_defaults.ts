import {ATTRIBUTES, type AttributeCode} from "core/character_sheet/attributes";
import type {ScenarioCreatureSetup} from "scenario_test/ScenarioTest";
import {VISUAL_TEST_CREATURE_IMAGE_OPTIONS} from "web/visual_tests/visual_test_creature_images";

export type CreatureSetupDraft = Omit<ScenarioCreatureSetup, "position">

const create_default_attributes = (): Record<AttributeCode, number> =>
    Object.fromEntries(Object.values(ATTRIBUTES).map(attribute => [attribute, 10])) as Record<AttributeCode, number>

export const create_default_creature_setup_draft = (): CreatureSetupDraft => ({
    name: "New creature",
    team: 1,
    size: "medium",
    image: VISUAL_TEST_CREATURE_IMAGE_OPTIONS[0].image,
    movement: 5,
    hp_current: 10,
    hp_max: 10,
    level: 1,
    attributes: create_default_attributes(),
    powers: [],
    archetypes: [],
})
