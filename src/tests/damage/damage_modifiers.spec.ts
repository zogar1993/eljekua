import type {CreatureData} from "core/battlegrid/creatures/CreatureData";
import type {Creature} from "core/battlegrid/creatures/Creature";
import type {Creatures} from "core/creatures/Creatures";
import {ATTRIBUTES} from "core/character_sheet/attributes";
import {create_add_creature_to_game} from "core/use_cases/add_creature_to_game";
import {create_start_battle} from "core/use_cases/start_battle";
import type {InstructionLoop} from "core/instruction_loop";
import {create_instruction_loop} from "core/instruction_loop";
import {INTERACTION_TYPE} from "core/interactions/Interactions";
import {build_evaluate_ast} from "core/virtual_machine/expressions/evaluate_ast";
import {
    transform_power_ir_into_vm_representation
} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import type {Power} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import {create_game_events} from "core/events/GameEvents";
import {create_game_state} from "core/game_state/GameState";
import {FIRE_ATTACK, FIRE_NECROTIC_ATTACK, UNTYPED_DAMAGE} from "tests/damage/test_powers";

const DEFAULT_POSITION = {x: 3, y: 4, footprint: 1} as const
const DEFENDER_POSITION = {x: 4, y: 4, footprint: 1} as const

let creatures: Creatures
let instruction_loop: InstructionLoop
let add_creature_to_game: ReturnType<typeof create_add_creature_to_game>
let start_battle: ReturnType<typeof create_start_battle>

beforeEach(() => {
    const game_events = create_game_events()
    const game_state = create_game_state({
        game_events,
        battle_grid_size: {x: 10, y: 10},
    })
    game_state.settings.attack_roll_resolution_is_random = false

    creatures = game_state.creatures
    const evaluate_ast = build_evaluate_ast({game_state})
    instruction_loop = create_instruction_loop({game_state, evaluate_ast, game_events})
    add_creature_to_game = create_add_creature_to_game({game_state, game_events})
    start_battle = create_start_battle({game_state, instruction_loop, game_events})
})

const given_attacker_and_defender = ({
                                         attacker_power,
                                         defender_resistances,
                                     }: {
    attacker_power: Power
    defender_resistances: Record<string, number>
}) => {
    given_creature({
        name: "Attacker",
        position: DEFAULT_POSITION,
        powers: [attacker_power],
    })
    given_creature({
        name: "Defender",
        position: DEFENDER_POSITION,
        resistances: defender_resistances,
    })
    start_battle()
}

const when_attacker_uses_power_against_defender = (power_name: string) => {
    instruction_loop.select({type: INTERACTION_TYPE.OPTION_SELECT, option: power_name})
    const defender = creatures.get_all().find(creature => creature.data.name === "Defender")
    if (!defender) throw Error(`creature name "Defender" not found`)
    instruction_loop.select({type: INTERACTION_TYPE.SELECT_CREATURE, creature_id: defender.id})
}

const then_defender_has_hp = (hp_current: number) => {
    const defender = creatures.get_all().find(creature => creature.data.name === "Defender")
    if (!defender) throw Error(`creature name "Defender" not found`)
    expect(defender.data.hp_current).toEqual(hp_current)
}

describe("damage resistance", () => {
    test("typed damage is reduced against resistant creatures", () => {
        given_attacker_and_defender({
            attacker_power: transform_power_ir_into_vm_representation(FIRE_ATTACK),
            defender_resistances: {fire: 1},
        })
        when_attacker_uses_power_against_defender("Fire Attack")
        then_defender_has_hp(7)
    })

    test("untyped damage is not reduced by typed resistances", () => {
        given_attacker_and_defender({
            attacker_power: transform_power_ir_into_vm_representation(UNTYPED_DAMAGE),
            defender_resistances: {fire: 1},
        })
        when_attacker_uses_power_against_defender("Untyped Damage")
        then_defender_has_hp(6)
    })

    test("dual type damage only considers lower resistance", () => {
        given_attacker_and_defender({
            attacker_power: transform_power_ir_into_vm_representation(FIRE_NECROTIC_ATTACK),
            defender_resistances: {fire: 1, necrotic: 2},
        })
        when_attacker_uses_power_against_defender("Fire Necrotic Attack")
        then_defender_has_hp(7)
    })
})

describe("damage vulnerability", () => {
    test("typed damage is increased against vulnerable creatures", () => {
        given_attacker_and_defender({
            attacker_power: transform_power_ir_into_vm_representation(FIRE_ATTACK),
            defender_resistances: {fire: -1},
        })
        when_attacker_uses_power_against_defender("Fire Attack")
        then_defender_has_hp(5)
    })

    test("untyped damage is not increased by typed vulnerability", () => {
        given_attacker_and_defender({
            attacker_power: transform_power_ir_into_vm_representation(UNTYPED_DAMAGE),
            defender_resistances: {fire: -1},
        })
        when_attacker_uses_power_against_defender("Untyped Damage")
        then_defender_has_hp(6)
    })

    test("dual type damage only considers higher vulnerability", () => {
        given_attacker_and_defender({
            attacker_power: transform_power_ir_into_vm_representation(FIRE_NECROTIC_ATTACK),
            defender_resistances: {fire: -1, necrotic: -2},
        })
        when_attacker_uses_power_against_defender("Fire Necrotic Attack")
        then_defender_has_hp(4)
    })
})

const given_creature = (creature: Partial<CreatureData> & Pick<CreatureData, "name" | "position">) => {
    const data: CreatureData = {
        name: creature.name,
        template: creature.template ?? null,
        position: creature.position,
        size: creature.size ?? "medium",
        image: creature.image ?? `url("/public/saber-and-pistol.svg")`,
        movement: creature.movement ?? 5,
        hp_current: creature.hp_current ?? 10,
        hp_max: creature.hp_max ?? 10,
        level: creature.level ?? 1,
        team: creature.team ?? null,
        attributes: creature.attributes ?? Object.fromEntries(
            Object.values(ATTRIBUTES).map(attribute => [attribute, 10]),
        ) as Creature["data"]["attributes"],
        powers: creature.powers ?? [],
        archetypes: creature.archetypes ?? [],
        resistances: creature.resistances ?? {},
    }

    add_creature_to_game({data})
}
