import type {GameQueries} from "core/game_state/GameQueries";
import type {GameState} from "core/game_state/GameState";
import type {BattleGrid} from "core/battlegrid/BattleGrid";
import {are_creatures_allied} from "core/battlegrid/creatures/are_creatures_allied";
import {is_creature_targetable} from "core/battlegrid/creatures/is_creature_targetable";
import {get_reach} from "core/battlegrid/position/get_reach";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import type {Position} from "core/battlegrid/Position";
import {assert_are_footprint_one, positions_equal, positions_share_surface} from "core/battlegrid/Position";
import {AST} from "core/virtual_machine/expressions/AST_NODE";
import type {InstructionSelectTarget} from "core/virtual_machine/instructions/instructions";

export const get_valid_targets = ({instruction, battle_grid, game_queries, game_state}: {
    instruction: InstructionSelectTarget,
    battle_grid: BattleGrid,
    game_queries: GameQueries,
    game_state: GameState,
}) => {
    const in_range = get_reach({instruction, battle_grid, game_queries})

    if (instruction.targeting_type === "area_burst")
        return in_range

    if (instruction.targeting_type === "push")
        return in_range

    if (instruction.targeting_type === "movement") {
        const owner = EXPR.as_creature(game_queries.evaluate(AST.OWNER))
        const valid_targets = in_range
            .filter(position => !positions_equal(position, owner.data.position))
            .filter(position => !battle_grid.is_terrain_occupied(position, {exclude: [owner]}))

        if (instruction.destination_requirement) {
            const possibilities = EXPR.as_positions(game_queries.evaluate(instruction.destination_requirement))

            const restricted: Array<Position> = []
            for (const position of valid_targets)
                for (const possibility of possibilities)
                    if (positions_share_surface(position, possibility))
                        restricted.push(position)
            return restricted
        } else
            return valid_targets
    }

    let valid_targets: Array<Position>
    if (instruction.target_type === "terrain") {
        valid_targets = in_range.filter(position => !battle_grid.is_terrain_occupied(position))
    } else if (instruction.target_type === "enemy" || instruction.target_type === "creature" || instruction.target_type === "ally") {
        assert_are_footprint_one(in_range)
        const owner = EXPR.as_creature(game_queries.evaluate(AST.OWNER))
        const creatures_in_range = battle_grid.get_creatures_in_positions(in_range)
        const creatures = instruction.target_type === "ally"
            ? creatures_in_range.filter(creature => creature !== owner && are_creatures_allied(owner, creature))
            : instruction.target_type === "enemy"
                ? creatures_in_range.filter(creature => !are_creatures_allied(owner, creature))
                : creatures_in_range
        const targetable_creatures = creatures.filter(creature =>
            is_creature_targetable({creature, attacker: owner, game_queries, game_state}))
        valid_targets = targetable_creatures.map(creature => creature.data.position)
    } else {
        throw `Target "${instruction.target_type}" not supported`
    }

    const results: Array<Position> = []
    const excluded_positions = instruction.exclude.flatMap(node => EXPR.as_positions(game_queries.evaluate(node)))
    for (const position of valid_targets) {
        if (excluded_positions.some(excluded => positions_share_surface(excluded, position))) continue
        results.push(position)
    }

    return results
}