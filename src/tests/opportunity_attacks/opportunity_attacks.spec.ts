import {get_flanker_positions} from "core/battlegrid/position/get_flanker_positions";
import {dependency_mocks} from "tests/utils/dependency_mocks";
import {CreatureData} from "core/battlegrid/creatures/CreatureData";
import {Creature} from "core/battlegrid/creatures/Creature";
import {ATTRIBUTES} from "core/character_sheet/attributes";
import {Position} from "core/battlegrid/Position";
import {create_add_creature_to_game} from "core/use_cases/add_creature_to_game";
import {build_evaluate_ast} from "core/virtual_machine/expressions/evaluate_ast";
import {create_instruction_loop} from "core/instruction_loop";
import {create_set_current_turn_to_creature} from "core/use_cases/gameplay/set_current_turn_to_creature";
import {create_game_events} from "core/events/GameEvents";
import {create_game_state} from "core/game_state/GameState";
import {create_interaction_test_helpers} from "tests/utils/interaction_test_helpers";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import {EXPR} from "core/virtual_machine/expressions/EXPR";

const game_events = create_game_events()
const game_state = create_game_state({
    game_events,
    ...dependency_mocks,
    battle_grid_size: {x: 10, y: 10},
})
const {battle_grid, initiative_order, turn_state} = game_state
const evaluate_ast = build_evaluate_ast({game_state})

const instruction_loop = create_instruction_loop({
    game_state,
    evaluate_ast,
    game_events,
})

const player_turn_handler = instruction_loop
const interactions = create_interaction_test_helpers({player_turn_handler})

const set_current_turn_to_creature = create_set_current_turn_to_creature({game_state, game_events})

const add_creature_to_game = create_add_creature_to_game({game_state, game_events})

const start_battle = () => {
    initiative_order.start()
}

const attack_log: Array<{ attacker: string, target: string, power_name: string }> = []

game_events.on_creature_missed.add_handler((creature) => {
    const attacker = EXPR.as_creature(turn_state.get_variable(SYSTEM_KEYWORD.OWNER))
    const power_name = EXPR.as_string(turn_state.get_variable(SYSTEM_KEYWORD.POWER_NAME))
    attack_log.push({
        attacker: attacker.data.name,
        target: creature.data.name,
        power_name,
    })
})

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

        when_creature("ragoz").moves_to({x: 2, y: 0})

        then_creature("ragoz").is_at_position({x: 1, y: 0}) //hasn't moved yet
        then_creature("linuar").has_action("Opportunity Attack")

        when_creature("linuar").selects_action("Opportunity Attack")
        when_creature("linuar").selects_action("Melee Basic Attack")

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

const given_a_creature_is_created = (c: Partial<CreatureData> & Pick<CreatureData, "position" | "name">) => {
    const data: CreatureData = {
        name: c.name || "",
        template: c.template ?? null,
        position: c.position,
        size: c.size ?? "medium",
        image: c.image ?? `url("/public/saber-and-pistol.svg")`,
        movement: c.movement ?? 5,
        hp_current: c.hp_current ?? 10,
        hp_max: c.hp_max ?? 10,
        level: c.level ?? 1,
        team: c.team ?? null,
        attributes: c.attributes ?? Object.fromEntries(Object.values(ATTRIBUTES).map(attr => [attr, 14])) as Creature["data"]["attributes"],
        powers: c.powers ?? []
    }

    add_creature_to_game({data})
}

const given_creature = (creature_name: string) => {
    const creature = battle_grid.creatures.find(creature => creature.data.name === creature_name)
    if (!creature) throw Error(`creature name "${creature_name}" not found`)

    return {
        is_in_its_turn: () => {
            if (player_turn_handler.get_interaction() !== null)
                throw Error("instruction loop still has a pending interaction — call start_battle() without running the loop first")

            set_current_turn_to_creature({creature})
            instruction_loop.run()
        }
    }
}


const when_creature = (creature_name: string) => {
    const creature = battle_grid.creatures.find(creature => creature.data.name === creature_name)
    if (!creature) throw Error(`creature name "${creature_name}" not found`)

    return {
        moves_to: (position: Omit<Position, "footprint">) => {
            interactions.select_option("Move")
            interactions.select_position(position)
        },
        selects_action: (action_name: string) => {
            interactions.select_option(action_name)
            interactions.confirm_pending_interaction()
        }
    }
}

const then_creature = (creature_name: string) => {
    const creature = battle_grid.creatures.find(creature => creature.data.name === creature_name)
    if (!creature) throw Error(`creature name "${creature_name}" not found`)

    return {
        is_at_position: (position: Omit<Position, "footprint">) => {
            expect(creature.data.position).toEqual({...position, footprint: 1})
        },
        has_action: (action_name: string) => {
            expect(interactions.has_option(action_name)).toEqual(true)
        },
        has_performed_action: (action_name: string, options: { target: string }) => {
            expect(attack_log).toContainEqual({
                attacker: creature_name,
                target: options.target,
                power_name: action_name,
            })
        }
    }
}
