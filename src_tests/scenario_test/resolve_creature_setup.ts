import type {Creature} from "core/battlegrid/creatures/Creature";
import type {CreatureData} from "core/battlegrid/creatures/CreatureData";
import type {Creatures} from "core/creatures/Creatures";
import {ATTRIBUTES} from "core/character_sheet/attributes";
import {
    transform_power_ir_into_vm_representation
} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import type {IRPower} from "core/types";
import type {ScenarioCreatureSetup} from "scenario_test/ScenarioTest";
import type {CreatureSetupDraft} from "web/visual_tests/creature_editor/creature_editor_defaults";
import {VISUAL_TEST_CREATURE_IMAGE_OPTIONS} from "web/visual_tests/visual_test_creature_images";

const PLACEMENT_VALIDATION_POSITION = {x: 0, y: 0, footprint: 1} as const

export const validate_creature_setup_draft = (creature: CreatureSetupDraft): void => {
    resolve_creature_setup({...creature, position: PLACEMENT_VALIDATION_POSITION})
}

export const sync_creature_setup_powers = ({
                                               creature,
                                               available_powers,
                                           }: {
    creature: ScenarioCreatureSetup
    available_powers: Array<IRPower>
}): ScenarioCreatureSetup => {
    if (creature.powers === undefined || creature.powers.length === 0)
        return creature

    const powers_by_name = new Map(available_powers.map(power => [power.name, power]))
    return {
        ...creature,
        powers: creature.powers.map(power => powers_by_name.get(power.name) ?? power),
    }
}

export const sync_level_setup_creature_powers = ({
                                                     creatures,
                                                     available_powers,
                                                 }: {
    creatures: Array<ScenarioCreatureSetup>
    available_powers: Array<IRPower>
}): Array<ScenarioCreatureSetup> =>
    creatures.map(creature => sync_creature_setup_powers({creature, available_powers}))

const find_game_creature_for_setup = ({
                                          creatures,
                                          setup,
                                      }: {
    creatures: Creatures
    setup: ScenarioCreatureSetup
}): Creature | undefined =>
    creatures.get_all().find(creature =>
        creature.data.name === setup.name
        && creature.data.position.x === setup.position.x
        && creature.data.position.y === setup.position.y,
    )

export const apply_synced_powers_to_game_creatures = ({
                                                            creatures,
                                                            synced_setups,
                                                        }: {
    creatures: Creatures
    synced_setups: Array<ScenarioCreatureSetup>
}) => {
    for (const setup of synced_setups) {
        const game_creature = find_game_creature_for_setup({creatures, setup})
        if (game_creature === undefined || setup.powers === undefined || setup.powers.length === 0)
            continue

        const powers_by_name = new Map(
            setup.powers.map(power => [power.name, transform_power_ir_into_vm_representation(power)]),
        )
        game_creature.data.powers = game_creature.data.powers.map(power =>
            powers_by_name.get(power.name) ?? power,
        )
    }
}

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
