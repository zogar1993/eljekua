import {
    Power,
    transform_power_ir_into_vm_representation,
} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import {HIT_STATUS} from "core/virtual_machine/expressions/constants/HitStatus";
import {ATTACK_ROLL_RESOLUTION_MODE} from "core/settings/AttackRollResolutionMode";
import {create_creature_test_helpers} from "tests/utils/creature_test_helpers";
import {create_test_game} from "tests/utils/create_test_game";

const POSITION_GRANTER = {x: 3, y: 4, footprint: 1} as const
const POSITION_TARGET = {x: 4, y: 4, footprint: 1} as const
const POSITION_ATTACKER = {x: 5, y: 4, footprint: 1} as const

let start_battle: ReturnType<typeof create_test_game>["start_battle"]
let given_a_creature_is_created: ReturnType<typeof create_creature_test_helpers>["given_a_creature_is_created"]
let given_creature: ReturnType<typeof create_creature_test_helpers>["given_creature"]
let when_creature: ReturnType<typeof create_creature_test_helpers>["when_creature"]
let then_creature: ReturnType<typeof create_creature_test_helpers>["then_creature"]

beforeEach(() => {
    const test_game = create_test_game({attack_roll_resolution: ATTACK_ROLL_RESOLUTION_MODE.HIT_STATUS})
    start_battle = test_game.start_battle
    const helpers = create_creature_test_helpers({
        creatures: test_game.creatures,
        instruction_loop: test_game.instruction_loop,
        vm_state: test_game.vm_state,
        add_creature_to_game: test_game.add_creature_to_game,
        set_current_turn_to_creature: test_game.set_current_turn_to_creature,
        available_interaction: test_game.game_state.available_interaction,
        default_attribute_value: 10,
    })
    given_a_creature_is_created = helpers.given_a_creature_is_created
    given_creature = helpers.given_creature
    when_creature = helpers.when_creature
    then_creature = helpers.then_creature
})

describe("add temporary hit points instruction", () => {
    test("grants temporary hit points without changing current hit points", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_GRANTER, team: 1, powers: [GRANT_TEMP_HP(5)]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_TARGET, team: 1})
        start_battle()

        when_creature("linuar").selects_action("Grant Temp HP")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(FULL_HP)
        then_creature("ragoz").has_temporary_hit_points(5)
    })

    test("does not add temporary hit points together when granted twice in one turn", () => {
        given_a_creature_is_created({
            name: "linuar",
            position: POSITION_GRANTER,
            team: 1,
            powers: [GRANT_TEMP_HP(5), GRANT_TEMP_HP_AGAIN(5)],
        })
        given_a_creature_is_created({name: "ragoz", position: POSITION_TARGET, team: 1})
        start_battle()

        when_creature("linuar").selects_action("Grant Temp HP")
        when_creature("linuar").selects_target("ragoz")
        when_creature("linuar").selects_action("Grant Temp HP Again")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_temporary_hit_points(5)
    })

    test("grants temporary hit points to a creature at zero current hit points", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_GRANTER, team: 1, powers: [GRANT_TEMP_HP(5)]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_TARGET, team: 1, hp_current: 0})
        start_battle()

        when_creature("linuar").selects_action("Grant Temp HP")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_hp(0)
        then_creature("ragoz").has_temporary_hit_points(5)
    })

    test("leaves a higher temporary hit point pool unchanged when granting zero", () => {
        given_a_creature_is_created({
            name: "linuar",
            position: POSITION_GRANTER,
            team: 1,
            powers: [GRANT_TEMP_HP(5), GRANT_TEMP_HP(0, "Grant Zero Temp HP", "minor")],
        })
        given_a_creature_is_created({name: "ragoz", position: POSITION_TARGET, team: 1})
        start_battle()

        when_creature("linuar").selects_action("Grant Temp HP")
        when_creature("linuar").selects_target("ragoz")
        when_creature("linuar").selects_action("Grant Zero Temp HP")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_temporary_hit_points(5)
    })
})

describe("damage with temporary hit points", () => {
    test("absorbs damage with temporary hit points before reducing current hit points", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_GRANTER, team: 1, powers: [GRANT_TEMP_HP(10)]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_TARGET, team: 1})
        given_a_creature_is_created({name: "orc", position: POSITION_ATTACKER, team: 2, powers: [DEAL_DAMAGE()]})
        start_battle()

        when_creature("linuar").selects_action("Grant Temp HP")
        when_creature("linuar").selects_target("ragoz")

        given_creature("orc").is_in_its_turn()
        when_creature("orc").selects_action("Deal Damage")
        when_creature("orc").selects_target("ragoz")

        then_creature("ragoz").has_hp(FULL_HP)
        then_creature("ragoz").has_temporary_hit_points(2)
    })

    test("reduces current hit points with damage that exceeds temporary hit points", () => {
        given_a_creature_is_created({name: "linuar", position: POSITION_GRANTER, team: 1, powers: [GRANT_TEMP_HP(5)]})
        given_a_creature_is_created({name: "ragoz", position: POSITION_TARGET, team: 1})
        given_a_creature_is_created({name: "orc", position: POSITION_ATTACKER, team: 2, powers: [DEAL_DAMAGE()]})
        start_battle()

        when_creature("linuar").selects_action("Grant Temp HP")
        when_creature("linuar").selects_target("ragoz")

        given_creature("orc").is_in_its_turn()
        when_creature("orc").selects_action("Deal Damage")
        when_creature("orc").selects_target("ragoz")

        then_creature("ragoz").has_hp(FULL_HP - (DAMAGE - 5))
        then_creature("ragoz").has_temporary_hit_points(0)
    })

    test("uses the higher temporary hit point total after damage and a new grant", () => {
        given_a_creature_is_created({
            name: "linuar",
            position: POSITION_GRANTER,
            team: 1,
            powers: [GRANT_TEMP_HP(10), GRANT_TEMP_HP_AGAIN(5)],
        })
        given_a_creature_is_created({name: "ragoz", position: POSITION_TARGET, team: 1})
        given_a_creature_is_created({name: "orc", position: POSITION_ATTACKER, team: 2, powers: [DEAL_DAMAGE()]})
        start_battle()

        when_creature("linuar").selects_action("Grant Temp HP")
        when_creature("linuar").selects_target("ragoz")

        given_creature("orc").is_in_its_turn()
        when_creature("orc").selects_action("Deal Damage")
        when_creature("orc").selects_target("ragoz")

        given_creature("linuar").is_in_its_turn()
        when_creature("linuar").selects_action("Grant Temp HP Again")
        when_creature("linuar").selects_target("ragoz")

        then_creature("ragoz").has_temporary_hit_points(5)
    })
})

const FULL_HP = 10
const DAMAGE = 8

const GRANT_TEMP_HP = (
    amount: number,
    name = "Grant Temp HP",
    action: "standard" | "minor" = "standard",
): Power => transform_power_ir_into_vm_representation({
    name,
    type: {action, cooldown: "at-will", attack: false},
    targeting: {targeting_type: "melee_weapon", target_type: "ally", amount: 1},
    effect: [{
        type: "add_temporary_hit_points",
        target: "primary_target",
        value: `${amount}`,
    }],
})

const GRANT_TEMP_HP_AGAIN = (amount: number): Power => GRANT_TEMP_HP(amount, "Grant Temp HP Again", "minor")

const DEAL_DAMAGE = (): Power => transform_power_ir_into_vm_representation({
    name: "Deal Damage",
    type: {action: "standard", cooldown: "at-will", attack: true},
    targeting: {targeting_type: "melee_weapon", target_type: "enemy", amount: 1},
    effect: [
        {type: "set_hit_status", target: "primary_target", status: HIT_STATUS.HIT},
        {
            type: "apply_damage",
            value: `${DAMAGE}`,
            target: "primary_target",
            damage_types: [],
        },
    ],
})
