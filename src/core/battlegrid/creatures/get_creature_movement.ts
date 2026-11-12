import type {Creature} from "core/battlegrid/creatures/Creature";

export const SLOWED_SPEED = 2

export const get_creature_movement = ({creature}: { creature: Creature }): number => {
    const base = creature.data.movement
    if (creature.statuses.some(({rule}) => rule.type === "slowed"))
        return Math.min(base, SLOWED_SPEED)
    return base
}