import {Creature} from "scripts/battlegrid/creatures/Creature";
import {Position} from "scripts/battlegrid/Position";


export const create_move_creature = (
    {}: {}
) => (
    {position, creature}: { position: Position, creature: Creature }
) => {
    creature.data.position = position
    creature.events.moved.raise({position, movement_type: "move"})
}