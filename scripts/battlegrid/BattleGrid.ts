import {SquareVisual, VisualSquareCreator} from "battlegrid/squares/SquareVisual";
import {CreatureData} from "battlegrid/creatures/CreatureData";
import {Creature} from "battlegrid/creatures/Creature";
import {VisualCreatureCreator} from "battlegrid/creatures/CreatureVisual";
import {Position, positions_equal} from "battlegrid/Position";
import {AnimationQueue} from "AnimationQueue";

export class BattleGrid {
    private BOARD_HEIGHT = 10
    private BOARD_WIDTH = 10
    private creatures: Array<Creature> = []


    board: Array<Array<Square>>
    visual_creature_creator: VisualCreatureCreator
    get_square = ({x, y}: { x: number, y: number }) => this.board[y][x]

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
                    return {visual, position: {x, y}}
                })
            }
        )
    }

    get_all_creatures = () => this.creatures;

    get_area_burst({origin, radius}: { origin: Position, radius: number }): Array<Position> {
        const lower_x = Math.max(0, origin.x - radius)
        const upper_x = Math.min(this.BOARD_WIDTH - 1, origin.x + radius)
        const lower_y = Math.max(0, origin.y - radius)
        const upper_y = Math.min(this.BOARD_HEIGHT - 1, origin.y + radius)
        const result = [];
        for (let x = lower_x; x <= upper_x; x++)
            for (let y = lower_y; y <= upper_y; y++)
                result.push({x, y});
        return result
    }

    get_in_range({origin, distance}: { origin: Position, distance: number }): Array<Position> {
        const lower_x = Math.max(0, origin.x - distance)
        const upper_x = Math.min(this.BOARD_WIDTH - 1, origin.x + distance)
        const lower_y = Math.max(0, origin.y - distance)
        const upper_y = Math.min(this.BOARD_HEIGHT - 1, origin.y + distance)
        const result = [];
        for (let x = lower_x; x <= upper_x; x++)
            for (let y = lower_y; y <= upper_y; y++)
                if (origin.x !== x || origin.y !== y)
                    result.push({x, y});
        return result
    }

    get_move_area({origin, distance}: { origin: Position, distance: number }): Array<Position> {
        const visited = [origin]
        let last_ring = [origin]

        let movement_left = distance

        while (movement_left > 0) {
            const new_ring: Array<Position> = []

            for (const anchor of last_ring) {
                const new_ring_candidates = this.get_adjacent({position: anchor})

                for (const new_ring_candidate of new_ring_candidates) {
                    if (this.is_terrain_occupied(new_ring_candidate)) continue
                    if (visited.some(position => positions_equal(position, new_ring_candidate))) continue
                    if (new_ring.some(position => positions_equal(position, new_ring_candidate))) continue
                    new_ring.push(new_ring_candidate)
                    visited.push(new_ring_candidate)
                }
            }

            last_ring = new_ring

            movement_left--
        }

        return visited
    }

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
            const alternatives = this.get_adjacent({position: head})
                .filter(x => visited.every(y => !positions_equal(x, y)))
                .filter(x => !this.is_terrain_occupied(x))

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

    get_melee({origin}: { origin: Position }): Array<Position> {
        const distance = 1
        const lower_x = Math.max(0, origin.x - distance)
        const upper_x = Math.min(this.BOARD_WIDTH - 1, origin.x + distance)
        const lower_y = Math.max(0, origin.y - distance)
        const upper_y = Math.min(this.BOARD_HEIGHT - 1, origin.y + distance)

        const result = [];
        for (let x = lower_x; x <= upper_x; x++)
            for (let y = lower_y; y <= upper_y; y++)
                if (origin.x !== x || origin.y !== y)
                    result.push({x, y});
        return result
    }

    get_adjacent({position}: { position: Position }) {
        const distance = 1
        const lower_x = Math.max(0, position.x - distance)
        const upper_x = Math.min(this.BOARD_WIDTH - 1, position.x + distance)
        const lower_y = Math.max(0, position.y - distance)
        const upper_y = Math.min(this.BOARD_HEIGHT - 1, position.y + distance)

        const result = [];
        for (let x = lower_x; x <= upper_x; x++)
            for (let y = lower_y; y <= upper_y; y++)
                if (position.x !== x || position.y !== y)
                    result.push({x, y});
        return result
    }

    get_push_positions({attacker_origin, defender_origin, amount}: {
        attacker_origin: Position,
        defender_origin: Position,
        amount: number
    }) {
        //TODO contemplate bigger pushes
        const adjacent = this.get_adjacent({position: defender_origin})
        const initial_distance = distance_between_positions(attacker_origin, defender_origin)
        const unoccupied = adjacent.filter(x => !this.is_terrain_occupied(x))
        return unoccupied.filter(position => distance_between_positions(position, attacker_origin) > initial_distance)
    }


    place_creature({position, creature}: { position: Position, creature: Creature }) {
        creature.data.position = position
        creature.visual.place_at(position)
    }

    move_creature_one_square({position, creature}: { position: Position, creature: Creature }) {
        creature.data.position = position
        AnimationQueue.add_animation(() => creature.visual.move_one_square(position))
    }

    get_creature_by_position = (position: Position): Creature => {
        const creature = this.creatures.find(creature => positions_equal(creature.data.position, position))
        if (!creature) throw Error(`creature not found for cell ${position}`)
        return creature
    }

    is_terrain_occupied = (position: Position) =>
        this.creatures.some(creature => positions_equal(creature.data.position, position))

    create_creature = (data: CreatureData) => {
        const visual = this.visual_creature_creator.create(data)
        const creature = new Creature({data, visual})
        this.creatures.push(creature)
    }
}

export type Square = {
    visual: SquareVisual,
    position: Position
}

const distance_between_positions = (a: Position, b: Position) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))
const intuitive_distance_between_positions = (a: Position, b: Position) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
