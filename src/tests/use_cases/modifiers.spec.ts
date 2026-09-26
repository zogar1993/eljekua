import {
    Power,
    transform_power_ir_into_vm_representation,
} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import {MODIFIER_TYPE, type ModifierAttackRoll} from "core/battlegrid/creatures/Modifier";
import {ATTACK_ROLL_RESOLUTION_MODE} from "core/settings/AttackRollResolutionMode";
import {ATTRIBUTES} from "core/character_sheet/attributes";
import type {CreatureData} from "core/battlegrid/creatures/CreatureData";
import {to_ast} from "core/expressions/parser/to_ast";
import {create_creature_test_helpers} from "tests/utils/creature_test_helpers";
import {create_test_game} from "tests/utils/create_test_game";

const POSITION_ATTACKER = {x: 2, y: 2, footprint: 1} as const
const POSITION_DEFENDER = {x: 3, y: 2, footprint: 1} as const

const ZERO_ATTRIBUTES = Object.fromEntries(
    Object.values(ATTRIBUTES).map(attribute => [attribute, 10]),
) as CreatureData["attributes"]

let attack_total: number | undefined
let start_battle: ReturnType<typeof create_test_game>["start_battle"]
let given_a_creature_is_created: ReturnType<typeof create_creature_test_helpers>["given_a_creature_is_created"]
let when_creature: ReturnType<typeof create_creature_test_helpers>["when_creature"]

beforeEach(() => {
    attack_total = undefined
    const test_game = create_test_game({attack_roll_resolution: ATTACK_ROLL_RESOLUTION_MODE.RIGGED_ROLL})
    test_game.game_events.on_creature_attacked.add_handler(({attack}) => {
        attack_total = attack.value
    })
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
})

describe("attack roll modifier", () => {
    test("adds its value to the final attack roll when the creature attacks", () => {
        given_a_creature_is_created({
            name: "linuar",
            position: POSITION_ATTACKER,
            team: 1,
            attributes: ZERO_ATTRIBUTES,
            powers: [MELEE_ATTACK],
            modifiers: [ATTACK_ROLL_MODIFIER("2")],
        })
        given_a_creature_is_created({
            name: "ragoz",
            position: POSITION_DEFENDER,
            team: 2,
            attributes: ZERO_ATTRIBUTES,
        })
        start_battle()

        when_creature("linuar").selects_action("Attack")
        when_creature("linuar").selects_target("ragoz")
        when_creature("linuar").rolls_d20_against("ragoz", 10)

        expect(attack_total).toBe(12)
    })

    test("evaluates its value expression at runtime", () => {
        given_a_creature_is_created({
            name: "linuar",
            position: POSITION_ATTACKER,
            team: 1,
            attributes: ZERO_ATTRIBUTES,
            powers: [MELEE_ATTACK],
            modifiers: [ATTACK_ROLL_MODIFIER("$add(2, 3)")],
        })
        given_a_creature_is_created({
            name: "ragoz",
            position: POSITION_DEFENDER,
            team: 2,
            attributes: ZERO_ATTRIBUTES,
        })
        start_battle()

        when_creature("linuar").selects_action("Attack")
        when_creature("linuar").selects_target("ragoz")
        when_creature("linuar").rolls_d20_against("ragoz", 10)

        expect(attack_total).toBe(15)
    })
})

const ATTACK_ROLL_MODIFIER = (value: string, name = "Attack Roll Modifier"): ModifierAttackRoll => ({
    name,
    type: MODIFIER_TYPE.ATTACK_ROLL,
    value: to_ast(value),
})

const MELEE_ATTACK: Power = transform_power_ir_into_vm_representation({
    name: "Attack",
    type: {action: "standard", cooldown: "at-will", attack: true},
    targeting: {targeting_type: "melee_weapon", target_type: "enemy", amount: 1},
    roll: {
        attack: "0",
        defense: "ac",
        hit: [
            {
                type: "apply_damage",
                value: "1",
                target: "primary_target",
            },
        ],
    },
})
