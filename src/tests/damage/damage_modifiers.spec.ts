import {
    transform_power_ir_into_vm_representation
} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import {create_creature_test_helpers} from "tests/utils/creature_test_helpers";
import {create_test_game} from "tests/utils/create_test_game";

const POSITION_LINUAR = {x: 3, y: 4, footprint: 1} as const
const POSITION_RAGOZ = {x: 4, y: 4, footprint: 1} as const

let start_battle: ReturnType<typeof create_test_game>["start_battle"]
let given_a_creature_is_created: ReturnType<typeof create_creature_test_helpers>["given_a_creature_is_created"]
let when_creature: ReturnType<typeof create_creature_test_helpers>["when_creature"]
let then_creature: ReturnType<typeof create_creature_test_helpers>["then_creature"]

beforeEach(() => {
    const test_game = create_test_game({attack_roll_resolution_is_random: false})
    start_battle = test_game.start_battle
    const helpers = create_creature_test_helpers({
        creatures: test_game.creatures,
        instruction_loop: test_game.instruction_loop,
        vm_state: test_game.vm_state,
        add_creature_to_game: test_game.add_creature_to_game,
        set_current_turn_to_creature: test_game.set_current_turn_to_creature,
        default_attribute_value: 10,
    })
    given_a_creature_is_created = helpers.given_a_creature_is_created
    when_creature = helpers.when_creature
    then_creature = helpers.then_creature
})

describe("damage resistance", () => {
    test("typed damage is reduced against resistant creatures", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE_FIRE]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, resistances: {fire: 1}})
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(7)
    })

    test("untyped damage is not reduced by typed resistances", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE_UNTYPED]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, resistances: {fire: 1}})
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(6)
    })

    test("dual type damage only considers lower resistance", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE_FIRE_NECROTIC]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, resistances: {fire: 1, necrotic: 2}})
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(7)
    })
})

describe("damage vulnerability", () => {
    test("typed damage is increased against vulnerable creatures", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE_FIRE]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, resistances: {fire: -1}})
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(5)
    })

    test("untyped damage is not increased by typed vulnerability", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE_UNTYPED]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, resistances: {fire: -1}})
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(6)
    })

    test("dual type damage only considers higher vulnerability", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_LINUAR, powers: [DEAL_DAMAGE_FIRE_NECROTIC]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_RAGOZ, resistances: {fire: -1, necrotic: -2}})
        start_battle()

        when_creature("linuar").selects_action("Deal Damage")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(4)
    })
})

const deal_damage_power = ({damage_types}: {damage_types: Array<string>}) => transform_power_ir_into_vm_representation({
    name: "Deal Damage",
    type: {action: "standard", cooldown: "at-will", attack: true},
    targeting: {targeting_type: "melee_weapon", target_type: "enemy", amount: 1},
    effect: [
        {type: "set_hit_status", target: "primary_target", status: 1},
        {type: "apply_damage", value: "4", target: "primary_target", damage_types: damage_types},
    ],
})

const DEAL_DAMAGE_UNTYPED = deal_damage_power({damage_types: []})
const DEAL_DAMAGE_FIRE = deal_damage_power({damage_types: ["fire"]})
const DEAL_DAMAGE_FIRE_NECROTIC = deal_damage_power({damage_types: ["fire", "necrotic"]})
