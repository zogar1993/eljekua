import type {Creature} from "core/battlegrid/creatures/Creature";
import type {CreatureData} from "core/battlegrid/creatures/CreatureData";
import type {Creatures} from "core/creatures/Creatures";
import {
    transform_power_ir_into_vm_representation
} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import type {IRPower} from "core/types";
import type {ScenarioCreatureOverride, ScenarioCreatureSetup} from "scenario_test/ScenarioTest";
import {
    compact_creature_override,
    resolve_creature_override,
} from "scenario_test/scenario_creature_override";
import type {CreatureSetupDraft} from "web/visual_tests/creature_editor/creature_editor_defaults";

const PLACEMENT_VALIDATION_POSITION = {x: 0, y: 0, footprint: 1} as const

export const validate_creature_setup_draft = (
    creature: CreatureSetupDraft,
    {
        existing_creature_names = [],
        available_powers = [],
    }: {
        existing_creature_names?: Array<string>
        available_powers?: Array<IRPower>
    } = {},
): void => {
    const name = creature.name.trim()
    if (name.length === 0)
        throw Error("creature name is required")

    if (existing_creature_names.some(existing_name => existing_name === name))
        throw Error(`creature name "${name}" is already in use`)

    resolve_creature_setup(
        resolve_creature_override(
            compact_creature_override({...creature, position: PLACEMENT_VALIDATION_POSITION}),
            available_powers,
        ),
    )
}

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
        if (game_creature === undefined || setup.powers.length === 0)
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
    const powers = creature.powers.map(transform_power_ir_into_vm_representation)

    return {
        name: creature.name.trim(),
        template: creature.template,
        position: creature.position,
        size: creature.size,
        image: creature.image,
        movement: creature.movement,
        hp_current: creature.hp_current,
        hp_max: creature.hp_max,
        level: creature.level,
        team: creature.team,
        attributes: creature.attributes,
        powers,
        archetypes: creature.archetypes,
        resistances: creature.resistances,
    }
}

export const resolve_creature_overrides = ({
                                               overrides,
                                               available_powers = [],
                                           }: {
    overrides: Array<ScenarioCreatureOverride>
    available_powers?: Array<IRPower>
}): Array<ScenarioCreatureSetup> =>
    overrides.map(override => resolve_creature_override(override, available_powers))
