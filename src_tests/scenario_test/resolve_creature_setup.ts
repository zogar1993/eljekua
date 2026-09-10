import type {Creature} from "core/battlegrid/creatures/Creature";
import type {CreatureData} from "core/battlegrid/creatures/CreatureData";
import {ATTRIBUTES} from "core/character_sheet/attributes";
import {
    transform_power_ir_into_vm_representation
} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import type {ScenarioCreatureSetup} from "scenario_test/ScenarioTest";
import {VISUAL_TEST_CREATURE_IMAGE_OPTIONS} from "web/visual_tests/visual_test_creature_images";

export const resolve_creature_setup = (creature: ScenarioCreatureSetup): CreatureData => {
    const powers = (creature.powers ?? []).map(transform_power_ir_into_vm_representation)

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
