import type {Creature} from "core/battlegrid/creatures/Creature";
import type {CreatureData} from "core/battlegrid/creatures/CreatureData";
import {ATTRIBUTES} from "core/character_sheet/attributes";
import {BASIC_ATTACK_ACTIONS, BASIC_MOVEMENT_ACTIONS} from "data/powers/basic";
import {FIGHTER_POWERS} from "data/powers/fighter";
import {ROGUE_POWERS} from "data/powers/rogue";
import {WIZARD_POWERS} from "data/powers/wizard";
import type {ScenarioCreatureSetup} from "scenario_test/ScenarioTest";
import {VISUAL_TEST_CREATURE_IMAGE_OPTIONS} from "web/visual_tests/visual_test_creature_images";

export const POWER_SET = {
    BASIC: "basic",
    FIGHTER: "fighter",
    WIZARD: "wizard",
    ROGUE: "rogue",
} as const

export type PowerSetName = typeof POWER_SET[keyof typeof POWER_SET]

const POWER_SETS: Record<PowerSetName, CreatureData["powers"]> = {
    [POWER_SET.BASIC]: [...BASIC_MOVEMENT_ACTIONS, ...BASIC_ATTACK_ACTIONS],
    [POWER_SET.FIGHTER]: FIGHTER_POWERS,
    [POWER_SET.WIZARD]: WIZARD_POWERS,
    [POWER_SET.ROGUE]: ROGUE_POWERS,
}

export const resolve_creature_setup = (creature: ScenarioCreatureSetup): CreatureData => {
    const power_sets = creature.power_sets ?? [POWER_SET.BASIC]
    const powers = power_sets.flatMap(power_set => POWER_SETS[power_set])

    return {
        name: creature.name,
        template: creature.template ?? null,
        position: creature.position,
        size: creature.size ?? "medium",
        image: creature.image ?? VISUAL_TEST_CREATURE_IMAGE_OPTIONS[0].image,
        movement: creature.movement ?? 5,
        hp_current: creature.hp_current ?? 10,
        hp_max: creature.hp_max ?? 10,
        level: creature.level ?? 1,
        team: creature.team ?? null,
        attributes: creature.attributes ?? Object.fromEntries(Object.values(ATTRIBUTES).map(attr => [attr, 14])) as Creature["data"]["attributes"],
        powers,
        archetypes: creature.archetypes ?? [],
    }
}
