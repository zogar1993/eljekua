import {
    Power,
    transform_power_ir_into_vm_representation,
} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";
import {INTERACTION_TYPE} from "core/interactions/Interactions";
import {ATTACK_ROLL_RESOLUTION_MODE} from "core/settings/AttackRollResolutionMode";
import {create_creature_test_helpers} from "tests/utils/creature_test_helpers";
import {create_test_game} from "tests/utils/create_test_game";

const ALLY_CRITICAL_HIT_REACTION: Power = transform_power_ir_into_vm_representation({
    name: "Critical Hit Reaction",
    type: {action: "free_attack", cooldown: "at-will", attack: true},
    trigger: {
        type: "reaction",
        intercepts: ["critical_hit"],
        conditions: ["$is_ally(trigger_activator, trigger_owner)"],
    },
    effect: [{
        type: INSTRUCTION_TYPE.ADD_POWERS_AS_OPTIONS,
        creature: "owner",
        cost: "free_attack",
        filter: "melee_basic_attack",
    }],
})

const MELEE_ATTACK: Power = transform_power_ir_into_vm_representation({
    name: "Attack",
    type: {action: "standard", cooldown: "at-will", attack: true},
    targeting: {targeting_type: "melee_weapon", target_type: "enemy", amount: 1},
    roll: {
        attack: "0",
        defense: "ac",
        hit: [{
            type: INSTRUCTION_TYPE.APPLY_DAMAGE,
            value: "1",
            target: "primary_target",
        }],
    },
})

describe("trigger transform validation", () => {
    test("throws when a movement trigger uses reaction timing", () => {
        expect(() => transform_power_ir_into_vm_representation({
            name: "Invalid Movement Trigger",
            type: {action: "opportunity", cooldown: "at-will", attack: true},
            trigger: {
                type: "reaction",
                intercepts: ["movement"],
                conditions: [],
            },
            effect: [],
        })).toThrow(/movement trigger must use timing 'interruption'/)
    })

    test("throws when a critical hit trigger uses interruption timing", () => {
        expect(() => transform_power_ir_into_vm_representation({
            name: "Invalid Critical Hit Trigger",
            type: {action: "free_attack", cooldown: "at-will", attack: true},
            trigger: {
                type: "interruption",
                intercepts: ["critical_hit"],
                conditions: [],
            },
            effect: [],
        })).toThrow(/critical hit trigger must use timing 'reaction'/)
    })

    test("places critical hit reaction triggers after attack roll consequences", () => {
        const attack = transform_power_ir_into_vm_representation({
            name: "Attack",
            type: {action: "standard", cooldown: "at-will", attack: true},
            targeting: {targeting_type: "melee_weapon", target_type: "enemy", amount: 1},
            roll: {
                attack: "0",
                defense: "ac",
                hit: [{
                    type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                    value: "1",
                    target: "primary_target",
                }],
            },
        })

        const consequence_index = attack.instructions.findIndex(
            instruction => instruction.type === INSTRUCTION_TYPE.ATTACK_ROLL_CONSEQUENCE,
        )
        const trigger_index = attack.instructions.findIndex(
            instruction => instruction.type === INSTRUCTION_TYPE.TRIGGER_CRITICAL_ROLL_REACTION,
        )

        expect(consequence_index).toBeGreaterThanOrEqual(0)
        expect(trigger_index).toBe(consequence_index + 1)
        expect(attack.instructions[trigger_index]).toEqual({
            type: INSTRUCTION_TYPE.TRIGGER_CRITICAL_ROLL_REACTION,
        })
    })
})

describe("movement interruption triggers", () => {
    const test_game = create_test_game({attack_roll_resolution: ATTACK_ROLL_RESOLUTION_MODE.HIT_STATUS})
    const {vm_state, instruction_loop} = test_game
    const {given_a_creature_is_created, given_creature, when_creature, then_creature} = create_creature_test_helpers({
        creatures: test_game.creatures,
        instruction_loop,
        vm_state,
        add_creature_to_game: test_game.add_creature_to_game,
        set_current_turn_to_creature: test_game.set_current_turn_to_creature,
        available_interaction: test_game.game_state.available_interaction,
    })

    test("can interrupt each step of a walk", () => {
        given_a_creature_is_created({name: "linuar", team: 1, position: {x: 0, y: 1, footprint: 1}})
        given_a_creature_is_created({name: "calendula", team: 1, position: {x: 2, y: 1, footprint: 1}})
        given_a_creature_is_created({name: "ragoz", team: 2, position: {x: 0, y: 0, footprint: 1}})
        test_game.start_initiative()
        given_creature("ragoz").is_in_its_turn()

        when_creature("ragoz").moves_through({x: 1, y: 0}, {x: 2, y: 0})

        then_creature("ragoz").is_at_position({x: 0, y: 0})

        when_creature("linuar").selects_action("Ignore")

        then_creature("ragoz").is_at_position({x: 1, y: 0})

        when_creature("calendula").selects_action("Ignore")

        then_creature("ragoz").is_at_position({x: 2, y: 0})
    })
})

describe("critical hit reaction triggers", () => {
    let test_game: ReturnType<typeof create_test_game>
    let available_interaction: ReturnType<typeof create_test_game>["game_state"]["available_interaction"]
    let given_a_creature_is_created: ReturnType<typeof create_creature_test_helpers>["given_a_creature_is_created"]
    let given_creature: ReturnType<typeof create_creature_test_helpers>["given_creature"]
    let when_creature: ReturnType<typeof create_creature_test_helpers>["when_creature"]

    beforeEach(() => {
        test_game = create_test_game({attack_roll_resolution: ATTACK_ROLL_RESOLUTION_MODE.HIT_STATUS})
        available_interaction = test_game.game_state.available_interaction
        const helpers = create_creature_test_helpers({
            creatures: test_game.creatures,
            instruction_loop: test_game.instruction_loop,
            vm_state: test_game.vm_state,
            add_creature_to_game: test_game.add_creature_to_game,
            set_current_turn_to_creature: test_game.set_current_turn_to_creature,
            available_interaction,
        })
        given_a_creature_is_created = helpers.given_a_creature_is_created
        given_creature = helpers.given_creature
        when_creature = helpers.when_creature
    })

    test("offers a reaction after attack consequences resolve on a critical hit", () => {
        given_a_creature_is_created({
            name: "linuar",
            team: 1,
            position: {x: 0, y: 0, footprint: 1},
            powers: [MELEE_ATTACK],
        })
        given_a_creature_is_created({
            name: "calendula",
            team: 1,
            position: {x: 1, y: 0, footprint: 1},
            powers: [ALLY_CRITICAL_HIT_REACTION],
        })
        given_a_creature_is_created({name: "ragoz", team: 2, position: {x: 1, y: 1, footprint: 1}, hp_current: 5, hp_max: 5})
        test_game.start_initiative()
        given_creature("linuar").is_in_its_turn()

        when_creature("linuar").selects_action("Attack")
        when_creature("linuar").selects_target("ragoz")
        when_creature("linuar").rolls_a_crit_against("ragoz")

        const interaction = available_interaction.get_current()
        expect(interaction.type).toBe(INTERACTION_TYPE.OPTION_SELECT)
        if (interaction.type !== INTERACTION_TYPE.OPTION_SELECT) throw new Error("expected option select")
        expect(interaction.available_options.some((option) => option.text === "Critical Hit Reaction")).toBe(true)
    })

    test("does not offer a critical hit reaction on a non-critical hit", () => {
        given_a_creature_is_created({
            name: "linuar",
            team: 1,
            position: {x: 0, y: 0, footprint: 1},
            powers: [MELEE_ATTACK],
        })
        given_a_creature_is_created({
            name: "calendula",
            team: 1,
            position: {x: 1, y: 0, footprint: 1},
            powers: [ALLY_CRITICAL_HIT_REACTION],
        })
        given_a_creature_is_created({name: "ragoz", team: 2, position: {x: 1, y: 1, footprint: 1}})
        test_game.start_initiative()
        given_creature("linuar").is_in_its_turn()

        when_creature("linuar").selects_action("Attack")
        when_creature("linuar").selects_target("ragoz")
        when_creature("linuar").misses_attack_roll_against("ragoz")

        expect(test_game.vm_state.get_acting_creature().data.name).toBe("linuar")
        const interaction = available_interaction.get_current()
        if (interaction.type === INTERACTION_TYPE.OPTION_SELECT) {
            expect(interaction.available_options.every((option) => option.text !== "Critical Hit Reaction")).toBe(true)
        }
    })
})
