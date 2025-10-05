import {SquareVisual, VisualSquareCreator} from "battlegrid/squares/SquareVisual";
import {CreatureData} from "battlegrid/creatures/CreatureData";
import {Creature} from "battlegrid/creatures/Creature";
import {VisualCreatureCreator} from "battlegrid/creatures/CreatureVisual";
import {assert_positions_have_same_footprint, Position, positions_equal} from "battlegrid/Position";
import {AnimationQueue} from "AnimationQueue";
import {get_reach_adjacent} from "battlegrid/ranges/get_reach_adjacent";
import {BASIC_ATTACK_ACTIONS, BASIC_MOVEMENT_ACTIONS} from "powers/basic";

export class BattleGrid {
    readonly BOARD_HEIGHT = 10
    readonly BOARD_WIDTH = 10
    readonly creatures: Array<Creature> = []

    board: Array<Array<Square>>
    visual_creature_creator: VisualCreatureCreator
    get_square = ({x, y}: Position) => {
        if (x < 0 || x >= this.BOARD_WIDTH || y < 0 || y >= this.BOARD_HEIGHT)
            throw (`position {x:${x}, y:${y}} is out of the battle grid dimensions (width:${this.BOARD_WIDTH}, height:${this.BOARD_HEIGHT})`)
        return this.board[y][x]
    }

    constructor({
                    visual_square_creator,
                    visual_creature_creator
                }: {
        visual_square_creator: VisualSquareCreator,
        visual_creature_creator: VisualCreatureCreator,
    }) {
        this.visual_creature_creator = visual_creature_creator
        this.board = Array.from({length: this.BOARD_HEIGHT}, (_, y) => {
                return Array.from({length: this.BOARD_WIDTH}, (_, x) => {
                    const visual = visual_square_creator.create({x, y})
                    return {visual, position: {x, y, footprint: 1}}
                })
            }
        )
    }

    // get_area_burst({origin, radius}: { origin: Position, radius: number }): Array<Position> {
    //     const lower_x = Math.max(0, origin.x - radius)
    //     const upper_x = Math.min(this.BOARD_WIDTH - 1, origin.x + radius)
    //     const lower_y = Math.max(0, origin.y - radius)
    //     const upper_y = Math.min(this.BOARD_HEIGHT - 1, origin.y + radius)
    //     const result = [];
    //     for (let x = lower_x; x <= upper_x; x++)
    //         for (let y = lower_y; y <= upper_y; y++)
    //             result.push({x, y});
    //     return result
    // }

    get_shortest_path = ({origin, destination}: { origin: Position, destination: Position }) => {
        const visited: Array<Position> = [origin]
        type WeightedPath = {
            path: Array<Position>,
            distance: { squares: number, intuitive: number },
            moved: number,
            weight: number
        }
        const initial_distance = distance_between_positions(origin, destination)
        let paths: Array<WeightedPath> =
            [{
                path: [origin],
                moved: 0,
                distance: {
                    squares: initial_distance,
                    intuitive: intuitive_distance_between_positions(origin, destination)
                },
                weight: initial_distance
            }]
        const extend_path = ({old_path, position}: { old_path: WeightedPath, position: Position }): WeightedPath => {
            const distance = distance_between_positions(position, destination)
            const moved = old_path.moved + 1
            return {
                path: [...old_path.path, position],
                distance: {squares: distance, intuitive: intuitive_distance_between_positions(position, destination)},
                moved,
                weight: distance + moved
            }
        }

        while (paths.length > 0) {
            const min_weight = Math.min(...paths.map(x => x.weight))
            const min_weight_paths = paths.filter(x => x.weight === min_weight)
            const min_intuitive_distance = Math.min(...min_weight_paths.map(x => x.distance.intuitive))
            const current_path = paths.find(x => x.distance.intuitive === min_intuitive_distance)!

            // remove the current path from the list, we only need its products, and we also avoid dead ends
            paths = paths.filter(x => x !== current_path)

            const head = current_path.path[current_path.path.length - 1]
            const alternatives = get_reach_adjacent({position: head, battle_grid: this})
                .filter(a => visited.every(b => !positions_equal(a, b)))
                .filter(a => !this.is_terrain_occupied(a))

            const ending_position = alternatives.find(alternative => positions_equal(alternative, destination))
            if (ending_position) return [...current_path.path, ending_position]

            visited.push(...alternatives)

            paths = [
                ...alternatives.map(position => extend_path({old_path: current_path, position})),
                ...paths
            ]
        }

        throw Error(`Path not found from ${JSON.stringify(origin)} to ${JSON.stringify(destination)}`)
    }

    is_flanking({attacker, defender}: { attacker: Creature, defender: Creature }) {
        if (attacker.data.team === null) return false

        const offset = get_offset(attacker.data.position, defender.data.position)
        const position = add_offset(defender.data.position, offset)

        if (!this.is_terrain_occupied(position)) return false

        const flanker = this.get_creature_by_position(position)
        return flanker.data.team === attacker.data.team
    }

    move_creature_one_square({position, creature}: { position: Position, creature: Creature }) {
        creature.data.position = position
        AnimationQueue.add_animation(() => creature.visual.move_one_square(position))
    }

    push_creature({position, creature}: { position: Position, creature: Creature }) {
        creature.data.position = position
        AnimationQueue.add_animation(() => creature.visual.push_to(position))
    }

    get_creature_by_position = (position: Position): Creature => {
        const creature = this.creatures.find(creature => positions_equal(creature.data.position, position))
        if (!creature) throw Error(`creature not found for cell ${position}`)
        return creature
    }

    is_terrain_occupied = (position: Position) =>
        this.creatures.some(creature => positions_equal(creature.data.position, position))

    create_creature = (data: CreatureData) => {
        const d = {...data, powers: [...BASIC_MOVEMENT_ACTIONS, ...BASIC_ATTACK_ACTIONS, ...data.powers]}
        const visual = this.visual_creature_creator.create(d)
        const creature = new Creature({data: d, visual})
        this.creatures.push(creature)
        return creature
    }

    transform_virtual_positions_to_concrete_positions = (position: Position) => {
        position
    }
}

export type Square = {
    visual: SquareVisual,
    position: Position
}

type PositionOffset = {
    x: number,
    y: number
}

export const distance_between_positions = (a: Position, b: Position) => {
    assert_positions_have_same_footprint(a, b)
    return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))
}
const intuitive_distance_between_positions = (a: Position, b: Position) => {
    assert_positions_have_same_footprint(a, b)
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}
const get_offset = (a: Position, b: Position): PositionOffset => {
    assert_positions_have_same_footprint(a, b)
    return {x: b.x - a.x, y: b.y - a.y}
}
const add_offset = (p: Position, o: PositionOffset): Position => ({x: p.x + o.x, y: p.y + o.y, footprint: p.footprint})
