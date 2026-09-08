import {create_creature, type Creature} from "core/battlegrid/creatures/Creature";
import {assert_is_valid_index} from "stdlib/assert";
import type {CreatureData} from "core/battlegrid/creatures/CreatureData";

export const create_creatures = () => {
    const creatures: Array<Creature> = []

    return {
        get_all: (): ReadonlyArray<Creature> => creatures,
        get_by_id: (id: number) => {
            assert_is_valid_index(id, creatures)
            return creatures[id]
        },
        create: (data: CreatureData) => {
            const id = creatures.length
            const creature = create_creature({id, data})
            creatures.push(creature)
            return creature
        }
    }
}

export type Creatures = ReturnType<typeof create_creatures>