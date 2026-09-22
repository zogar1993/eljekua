import {
    transform_power_ir_into_vm_representation
} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import {FIRE_ATTACK, FIRE_NECROTIC_ATTACK, UNTYPED_DAMAGE} from "tests/damage/test_powers";
import {create_creature_test_helpers} from "tests/utils/creature_test_helpers";
import {create_test_game} from "tests/utils/create_test_game";

const DEFAULT_POSITION = {x: 3, y: 4, footprint: 1} as const
const DEFENDER_POSITION = {x: 4, y: 4, footprint: 1} as const

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
        given_a_creature_is_created({
            name: "Attacker",
            position: DEFAULT_POSITION,
            powers: [transform_power_ir_into_vm_representation(FIRE_ATTACK)],
        })
        given_a_creature_is_created({
            name: "Defender",
            position: DEFENDER_POSITION,
            resistances: {fire: 1},
        })
        start_battle()
        when_creature("Attacker").selects_action("Fire Attack")
        when_creature("Attacker").selects_target("Defender")
        then_creature("Defender").has_hp(7)
    })

    test("untyped damage is not reduced by typed resistances", () => {
        given_a_creature_is_created({
            name: "Attacker",
            position: DEFAULT_POSITION,
            powers: [transform_power_ir_into_vm_representation(UNTYPED_DAMAGE)],
        })
        given_a_creature_is_created({
            name: "Defender",
            position: DEFENDER_POSITION,
            resistances: {fire: 1},
        })
        start_battle()
        when_creature("Attacker").selects_action("Untyped Damage")
        when_creature("Attacker").selects_target("Defender")
        then_creature("Defender").has_hp(6)
    })

    test("dual type damage only considers lower resistance", () => {
        given_a_creature_is_created({
            name: "Attacker",
            position: DEFAULT_POSITION,
            powers: [transform_power_ir_into_vm_representation(FIRE_NECROTIC_ATTACK)],
        })
        given_a_creature_is_created({
            name: "Defender",
            position: DEFENDER_POSITION,
            resistances: {fire: 1, necrotic: 2},
        })
        start_battle()
        when_creature("Attacker").selects_action("Fire Necrotic Attack")
        when_creature("Attacker").selects_target("Defender")
        then_creature("Defender").has_hp(7)
    })
})

describe("damage vulnerability", () => {
    test("typed damage is increased against vulnerable creatures", () => {
        given_a_creature_is_created({
            name: "Attacker",
            position: DEFAULT_POSITION,
            powers: [transform_power_ir_into_vm_representation(FIRE_ATTACK)],
        })
        given_a_creature_is_created({
            name: "Defender",
            position: DEFENDER_POSITION,
            resistances: {fire: -1},
        })
        start_battle()
        when_creature("Attacker").selects_action("Fire Attack")
        when_creature("Attacker").selects_target("Defender")
        then_creature("Defender").has_hp(5)
    })

    test("untyped damage is not increased by typed vulnerability", () => {
        given_a_creature_is_created({
            name: "Attacker",
            position: DEFAULT_POSITION,
            powers: [transform_power_ir_into_vm_representation(UNTYPED_DAMAGE)],
        })
        given_a_creature_is_created({
            name: "Defender",
            position: DEFENDER_POSITION,
            resistances: {fire: -1},
        })
        start_battle()
        when_creature("Attacker").selects_action("Untyped Damage")
        when_creature("Attacker").selects_target("Defender")
        then_creature("Defender").has_hp(6)
    })

    test("dual type damage only considers higher vulnerability", () => {
        given_a_creature_is_created({
            name: "Attacker",
            position: DEFAULT_POSITION,
            powers: [transform_power_ir_into_vm_representation(FIRE_NECROTIC_ATTACK)],
        })
        given_a_creature_is_created({
            name: "Defender",
            position: DEFENDER_POSITION,
            resistances: {fire: -1, necrotic: -2},
        })
        start_battle()
        when_creature("Attacker").selects_action("Fire Necrotic Attack")
        when_creature("Attacker").selects_target("Defender")
        then_creature("Defender").has_hp(4)
    })
})
