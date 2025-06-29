import {SquareVisual, VisualSquareCreator} from "battlegrid/squares/SquareVisual";
import {CreatureVisual, VisualCreatureCreator} from "./creatures/CreatureVisual";
import {Position, positions_equal} from "./Position";
import {CreatureData} from "battlegrid/creatures/CreatureData";
import {Creature} from "battlegrid/creatures/Creature";

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
                const new_ring_candidates = this.get_adjacent({origin: anchor})

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

    get_adjacent({origin}: { origin: Position }) {
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

    get_push_positions({attacker_origin, defender_origin, amount}: {
        attacker_origin: Position,
        defender_origin: Position,
        amount: number
    }) {
        //TODO contemplate bigger pushes
        const adjacent = this.get_adjacent({origin: defender_origin})
        const distance_between_positions = (a: Position, b: Position) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))
        const initial_distance = distance_between_positions(attacker_origin, defender_origin)
        const unoccupied = adjacent.filter(x => !this.is_terrain_occupied(x))
        return unoccupied.filter(position => distance_between_positions(position, attacker_origin) > initial_distance)
    }


    place_creature({position, creature}: { position: Position, creature: Creature }) {
        creature.move_to(position)
    }

    get_creature_by_position(position: Position): Creature {
        const creature = this.creatures.find(c => c.data.position.x === position.x && c.data.position.y === position.y)
        if (!creature) throw Error(`creature not found for cell ${position}`)
        return creature
    }

    is_terrain_occupied(position: Position) {
        return this.creatures.some(c => c.data.position.x === position.x && c.data.position.y === position.y)
    }

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
