import type {ExprCreatures} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import type {BattleGrid} from "core/battlegrid/BattleGrid";
import type {Creature} from "core/battlegrid/creatures/Creature";
import {get_f1_positions_within_distance} from "core/battlegrid/position/get_f1_positions_within_distance";

export const evaluate_function_adjacent_creatures = ({node, game_state, game_queries}: EvaluateFunctionProps): ExprCreatures => {
    assert_parameters_amount_equals(node, 1)

    const creature = game_queries.evaluate_creature(game_queries.evaluate(node.parameters[0]))

    return {
        type: "creatures",
        value: get_adjacent_creatures({creature, battle_grid: game_state.battle_grid}),
    }
}

const get_adjacent_creatures = ({creature, battle_grid}: {
    creature: Creature
    battle_grid: BattleGrid
}): Array<Creature> => {
    const position = creature.data.position
    const adjacent_positions = get_f1_positions_within_distance({position, battle_grid, distance: 1})

    return battle_grid.get_creatures_in_positions(adjacent_positions)
}
