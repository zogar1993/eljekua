import type {Creature} from "core/battlegrid/creatures/Creature";

export const are_creatures_allied = (creatureA: Creature, creatureB: Creature) =>
    creatureA.data.team !== null && creatureB.data.team !== null && creatureA.data.team === creatureB.data.team
