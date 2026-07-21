import {create_battle_grid} from "scripts/battlegrid/BattleGrid";
import {get_flanker_positions} from "scripts/battlegrid/position/get_flanker_positions";
import {dependency_mocks} from "tests/utils/dependency_mocks";
import {create_player_turn_handler} from "scripts/battlegrid/player_turn_handler/PlayerTurnHandler";
import {CreatureData} from "scripts/battlegrid/creatures/CreatureData";
import {Creature} from "scripts/battlegrid/creatures/Creature";
import {ATTRIBUTES} from "scripts/character_sheet/attributes";
import {create_initiative_order} from "scripts/initiative_order/InitiativeOrder";
import {create_option_buttons} from "scripts/battlegrid/option_buttons/OptionButtons";
import {Position} from "scripts/battlegrid/Position";
import {create_option_button_visual, option_buttons_test_ui} from "tests/utils/option_buttons_test_ui";
import {create_battle_grid_visual, battle_grid_test_ui} from "tests/utils/battle_grid_test_ui";
import {create_add_creature_to_game} from "scripts/use_cases/add_creature_to_game";
import {create_start_battle} from "scripts/use_cases/start_battle";
import {create_set_current_turn_to_creature} from "scripts/use_cases/gameplay/set_current_turn_to_creature";
import {create_turn_state} from "scripts/battlegrid/player_turn_handler/TurnState";
import {build_evaluate_ast} from "scripts/expressions/evaluator/evaluate_ast";
import {create_instruction_loop} from "scripts/instruction_loop";
import {create_gameplay_use_cases} from "scripts/use_cases/gameplay/gameplay_use_cases";

const turn_state = create_turn_state();
const battle_grid = create_battle_grid({...dependency_mocks, create_battle_grid_visual, size: {x: 10, y: 10}})
const initiative_order = create_initiative_order({...dependency_mocks})
const option_buttons = create_option_buttons({create_option_button_visual})
const evaluate_ast = build_evaluate_ast({turn_state, battle_grid})
const player_turn_handler = create_player_turn_handler({
    ...dependency_mocks,
    battle_grid,
    initiative_order,
    option_buttons,
    turn_state,
    evaluate_ast
})

const gameplay_use_cases = create_gameplay_use_cases({
    battle_grid,
    initiative_order,
    player_turn_handler
})

const instruction_loop = create_instruction_loop({
    ...dependency_mocks,
    initiative_order,
    evaluate_ast,
    turn_state,
    battle_grid,
    player_turn_handler,
    gameplay_use_cases
})

battle_grid.visual.addOnMouseMoveHandler(coordinate => {
    player_turn_handler.on_hover({coordinate})
})

battle_grid.visual.addOnClickHandler(coordinate => {
    player_turn_handler.on_click({coordinate})
})

const add_creature_to_game = create_add_creature_to_game({battle_grid, initiative_order, on_creature_added_to_game: []})
const start_battle = create_start_battle({battle_grid, initiative_order, instruction_loop})

describe("when an enemy leaves a space adjacent to a creature", () => {
    test(`the creature can perform an opportunity attack to it`, async () => {
        // Both ragoz and calendula are next to linuar.
        // When ragoz moves, the opportunity attack should target him automatically.
        // The reason for calendula being here is so we have multiple basic attack valid targets
        given_a_creature_is_created({name: "linuar", team: 1, position: {x: 0, y: 0, footprint: 1}})
        given_a_creature_is_created({name: "ragoz", team: 2, position: {x: 1, y: 0, footprint: 1}})
        given_a_creature_is_created({name: "calendula", team: 2, position: {x: 1, y: 1, footprint: 1}})
        start_battle()
        given_creature("ragoz").is_in_its_turn()

        await when_creature("ragoz").moves_to({x: 2, y: 0})

        await then_creature("ragoz").is_at_position({x: 1, y: 0}) //hasn't moved yet
        await then_creature("linuar").has_action("Opportunity Attack")

        await when_creature("linuar").selects_action("Opportunity Attack")
        await when_creature("linuar").selects_action("Melee Basic Attack")

        await then_creature("linuar").has_performed_action("Melee Basic Attack", {target: "ragoz"})

        await then_creature("ragoz").is_at_position({x: 2, y: 0})
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
            gameplay_use_cases.set_current_turn_to_creature({creature})
        }
    }
}


const when_creature = (creature_name: string) => {
    const creature = battle_grid.creatures.find(creature => creature.data.name === creature_name)
    if (!creature) throw Error(`creature name "${creature_name}" not found`)

    return {
        moves_to: async (position: Omit<Position, "footprint">) => {
            await wait_until(() => player_turn_handler.get_selection_context()?.type === "option_select")
            option_buttons_test_ui.click("Move")
            await wait_until(() => player_turn_handler.get_selection_context()?.type === "position_select")
            battle_grid_test_ui.click(position)
        },
        selects_action: async (action_name: string) => {
            await wait_until(() => player_turn_handler.get_selection_context()?.type === "option_select")
            option_buttons_test_ui.click(action_name)
        }
    }
}


const then_creature = (creature_name: string) => {
    const creature = battle_grid.creatures.find(creature => creature.data.name === creature_name)
    if (!creature) throw Error(`creature name "${creature_name}" not found`)

    return {
        is_at_position: async (position: Omit<Position, "footprint">) => {
            expect(creature.data.position).toEqual({...position, footprint: 1})
        },
        has_action: async (action_name: string) => {
            await wait_until(() => turn_state.get_power_owner() === creature)
            expect(option_buttons_test_ui.has_button(action_name)).toEqual(true)
        },
        has_performed_action: async (action_name: string, options: any) => {
            throw Error("'has_performed_action' has not been implemented yet")
        }
    }
}

const wait_until = (
    condition: () => boolean | Promise<boolean>,
): Promise<void> => {
    const interval = 20
    const timeout = 1000

    const start = Date.now();
    return new Promise((resolve, reject) => {
        const check = async () => {
            try {
                if (await condition()) return resolve();
            } catch (err) {
                return reject(err);
            }
            if (timeout != null && Date.now() - start >= timeout) {
                return reject(new Error("wait_for: timed out"));
            }
            setTimeout(check, interval);
        };
        check();
    });
}