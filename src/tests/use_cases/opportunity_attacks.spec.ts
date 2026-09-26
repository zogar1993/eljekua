import {get_flanker_positions} from "core/battlegrid/position/get_flanker_positions";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {create_creature_test_helpers} from "tests/utils/creature_test_helpers";
import type {AttackLogEntry} from "tests/utils/creature_test_helpers";
import {ATTACK_ROLL_RESOLUTION_MODE} from "core/settings/AttackRollResolutionMode";
import {create_test_game} from "tests/utils/create_test_game";

const test_game = create_test_game({attack_roll_resolution: ATTACK_ROLL_RESOLUTION_MODE.HIT_STATUS})
const {battle_grid, vm_state, instruction_loop, game_events} = test_game

const attack_log: Array<AttackLogEntry> = []

game_events.on_creature_missed.add_handler((creature) => {
    const attacker = EXPR.as_creature(vm_state.get_variable(SYSTEM_KEYWORD.OWNER))
    const power_name = EXPR.as_string(vm_state.get_variable(SYSTEM_KEYWORD.POWER_NAME))
    attack_log.push({
        attacker: attacker.data.name,
        target: creature.data.name,
        power_name,
    })
})

const {given_a_creature_is_created, given_creature, when_creature, then_creature} = create_creature_test_helpers({
    creatures: test_game.creatures,
    instruction_loop,
    vm_state,
    add_creature_to_game: test_game.add_creature_to_game,
    set_current_turn_to_creature: test_game.set_current_turn_to_creature,
    attack_log,
})

const start_battle = test_game.start_initiative

describe("when an enemy leaves a space adjacent to a creature", () => {
    test(`the creature can perform an opportunity attack to it`, () => {
        // Both ragoz and calendula are next to linuar.
        // When ragoz moves, the opportunity attack should target him automatically.
        // The reason for calendula being here is so we have multiple basic attack valid targets
        given_a_creature_is_created({name: "linuar", team: 1, position: {x: 0, y: 0, footprint: 1}})
        given_a_creature_is_created({name: "ragoz", team: 2, position: {x: 1, y: 0, footprint: 1}})
        given_a_creature_is_created({name: "calendula", team: 2, position: {x: 1, y: 1, footprint: 1}})
        start_battle()
        given_creature("ragoz").is_in_its_turn()

        when_creature("ragoz").moves_through({x: 2, y: 0})

        then_creature("ragoz").is_at_position({x: 1, y: 0}) //hasn't moved yet

        when_creature("linuar").selects_action("Opportunity Attack")
        when_creature("linuar").selects_action("Melee Basic Attack")
        when_creature("linuar").misses_attack_roll_against("ragoz")

        then_creature("linuar").has_performed_action("Melee Basic Attack", {target: "ragoz"})

        then_creature("ragoz").is_at_position({x: 2, y: 0})
    })
})

describe("when a 1x1 attacker attacks a 2x2 defender", () => {
    test(`by the corner there is one flanking position`, () => {
        const result = get_flanker_positions({
            attacker_position: {x: 0, y: 0, footprint: 1},
            defender_position: {x: 1, y: 1, footprint: 2},
            battle_grid
        })
        expect(result).toIncludeSameMembers([{x: 3, y: 3, footprint: 1}]);
    });

    test(`by the side there are two flanking positions`, () => {
        const result = get_flanker_positions({
            attacker_position: {x: 0, y: 1, footprint: 1},
            defender_position: {x: 1, y: 1, footprint: 2},
            battle_grid
        })
        expect(result).toIncludeSameMembers([{x: 3, y: 1, footprint: 1}, {x: 3, y: 2, footprint: 1}]);
    });
})
