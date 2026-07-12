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
import {create_set_current_turn_to_creature} from "scripts/use_cases/set_current_turn_to_creature";
import {create_turn_state} from "scripts/battlegrid/player_turn_handler/TurnState";

const turn_state = create_turn_state();
const battle_grid = create_battle_grid({...dependency_mocks, create_battle_grid_visual, size: {x: 10, y: 10}})
const initiative_order = create_initiative_order({...dependency_mocks})
const option_buttons = create_option_buttons({create_option_button_visual})
const player_turn_handler = create_player_turn_handler({
    ...dependency_mocks,
    battle_grid,
    initiative_order,
    option_buttons,
    turn_state
})

battle_grid.visual.addOnMouseMoveHandler(coordinate => {
    player_turn_handler.on_hover({coordinate})
})

battle_grid.visual.addOnClickHandler(coordinate => {
    player_turn_handler.on_click({coordinate})
})

const add_creature_to_game = create_add_creature_to_game({battle_grid, initiative_order})
const start_battle = create_start_battle({battle_grid, initiative_order, player_turn_handler})
const set_current_turn_to_creature = create_set_current_turn_to_creature({
    player_turn_handler,
    initiative_order,
    battle_grid
})

describe("when an enemy leaves a space adjacent to a creature", () => {
    test(`the creature can perform an opportunity attack`, () => {
        given_a_creature_is_created({name: "linuar", team: 1, position: {x: 0, y: 0, footprint: 1}})
        given_a_creature_is_created({name: "ragoz", team: 2, position: {x: 1, y: 0, footprint: 1}})
        start_battle()
        given_creature("ragoz").is_in_its_turn()

        when_creature("ragoz").moves_to({x: 2, y: 0})

        then_creature("ragoz").is_at_position({x: 1, y: 0}) //hasn't moved yet
        then_creature("linuar").has_action("Opportunity Attack")
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
            set_current_turn_to_creature({creature})
        }
    }
}


const when_creature = (creature_name: string) => {
    const creature = battle_grid.creatures.find(creature => creature.data.name === creature_name)
    if (!creature) throw Error(`creature name "${creature_name}" not found`)

    return {
        moves_to: (position: Omit<Position, "footprint">) => {
            option_buttons_test_ui.click("Move")
            battle_grid_test_ui.click(position)
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
        has_action(action_name: string) {
            expect(turn_state.get_power_owner()).toEqual(creature)
            expect(option_buttons_test_ui.has_button(action_name)).toEqual(true)
        }
    }
}