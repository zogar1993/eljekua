import {
    Power,
    transform_power_ir_into_vm_representation,
} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import {ATTACK_ROLL_RESOLUTION_MODE} from "core/settings/AttackRollResolutionMode";
import {ATTRIBUTES} from "core/character_sheet/attributes";
import type {CreatureData} from "core/battlegrid/creatures/CreatureData";
import {create_creature_test_helpers} from "tests/utils/creature_test_helpers";
import {create_test_game} from "tests/utils/create_test_game";

const POSITION_ATTACKER = {x: 2, y: 2, footprint: 1} as const
const POSITION_DEFENDER = {x: 3, y: 2, footprint: 1} as const

const ZERO_ATTRIBUTES = Object.fromEntries(
    Object.values(ATTRIBUTES).map(attribute => [attribute, 10]),
) as CreatureData["attributes"]

describe("rigged d20 attack roll resolution", () => {
    test("the selected d20 value is used when the attack roll resolves", () => {
        let attack_total: number | undefined
        const test_game = create_test_game({attack_roll_resolution: ATTACK_ROLL_RESOLUTION_MODE.RIGGED_ROLL})
        test_game.game_events.on_creature_attacked.add_handler(({attack}) => {
            attack_total = attack.value
        })
        const {given_a_creature_is_created, when_creature} = create_creature_test_helpers({
            creatures: test_game.creatures,
            instruction_loop: test_game.instruction_loop,
            vm_state: test_game.vm_state,
            add_creature_to_game: test_game.add_creature_to_game,
            set_current_turn_to_creature: test_game.set_current_turn_to_creature,
            default_attribute_value: 10,
        })

        given_a_creature_is_created({
            name: "linuar",
            position: POSITION_ATTACKER,
            team: 1,
            attributes: ZERO_ATTRIBUTES,
            powers: [ATTACK_WITH_ZERO_BONUS],
        })
        given_a_creature_is_created({
            name: "ragoz",
            position: POSITION_DEFENDER,
            team: 2,
            attributes: ZERO_ATTRIBUTES,
        })
        test_game.start_battle()

        when_creature("linuar").selects_action("Attack")
        when_creature("linuar").selects_target("ragoz")
        when_creature("linuar").rolls_d20_against("ragoz", 10)

        expect(attack_total).toBe(10)
    })
})

const ATTACK_WITH_ZERO_BONUS: Power = transform_power_ir_into_vm_representation({
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
