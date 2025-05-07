import {SquareVisual, VisualSquareCreator} from "battlegrid/squares/SquareVisual";
import {CreatureVisual, VisualCreatureCreator} from "./creatures/CreatureVisual";
import {Position} from "./Position";

export class BattleGrid {
    private BOARD_HEIGHT = 10
    private BOARD_WIDTH = 10

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

    * get_area_burst({origin, radius}: { origin: Position, radius: number }) {
        const lower_x = Math.max(0, origin.x - radius)
        const upper_x = Math.min(this.BOARD_WIDTH - 1, origin.x + radius)
        const lower_y = Math.max(0, origin.y - radius)
        const upper_y = Math.min(this.BOARD_HEIGHT - 1, origin.y + radius)
        for (let x = lower_x; x <= upper_x; x++)
            for (let y = lower_y; y <= upper_y; y++)
                yield this.get_square({x, y})
    }

    * get_move_area({origin, distance}: { origin: Position, distance: number }) {

        //TODO extract foreachSquareInGrid
        const lower_x = Math.max(0, origin.x - distance)
        const upper_x = Math.min(this.BOARD_WIDTH - 1, origin.x + distance)
        const lower_y = Math.max(0, origin.y - distance)
        const upper_y = Math.min(this.BOARD_HEIGHT - 1, origin.y + distance)
        for (let x = lower_x; x <= upper_x; x++)
            for (let y = lower_y; y <= upper_y; y++) {
                if (origin.x === x && origin.y === y) continue
                yield this.get_square({x, y})
            }
    }

    * get_melee({origin}: { origin: Position }) {
        const distance = 1
        const lower_x = Math.max(0, origin.x - distance)
        const upper_x = Math.min(this.BOARD_WIDTH - 1, origin.x + distance)
        const lower_y = Math.max(0, origin.y - distance)
        const upper_y = Math.min(this.BOARD_HEIGHT - 1, origin.y + distance)
        for (let x = lower_x; x <= upper_x; x++)
            for (let y = lower_y; y <= upper_y; y++) {
                if (origin.x === x && origin.y === y) continue
                yield this.get_square({x, y})
            }
    }

    private creatures: Array<Creature> = []

    place_character({position, creature}: { position: Position, creature: Creature }) {
        creature.move_to(position)
    }

    get_creature_by_position(position: Position): Creature {
        const creature = this.creatures.find(c => c.position.x === position.x && c.position.y === position.y)
        if (!creature) throw Error(`creature not found for cell ${position}`)
        return creature
    }

    is_terrain_occupied(position: Position) {
        return this.creatures.some(c => c.position.x === position.x && c.position.y === position.y)
    }

    create_creature(data: CreatureData) {
        const visual = this.visual_creature_creator.create({
            image: data.image,
            hp: {current: data.hp, max: data.max_hp},
            position: data.position
        })
        const creature = new Creature({data, visual})
        this.creatures.push(creature)
    }
}

export type Square = {
    visual: SquareVisual,
    position: Position
}

export type CreatureData = {
    position: Position
    image: string
    movement: number
    hp: number
    max_hp: number
}

export class Creature {
    private visual: CreatureVisual
    position: Position
    data: CreatureData

    constructor({data, visual}: { data: CreatureData, visual: CreatureVisual }) {
        this.data = data
        this.visual = visual
        this.position = data.position
    }

    move_to(position: Position) {
        this.position = position
        this.visual.place_at(position)
    }

    receive_damage(value: number) {
        this.data.hp -= value
        this.visual.receive_damage({hp: this.data.hp, damage: value})
    }
}