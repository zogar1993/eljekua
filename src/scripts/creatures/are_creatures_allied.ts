import {Creature} from "scripts/battlegrid/creatures/Creature";

export const are_creatures_allied = (creatureA: Creature, creatureB: Creature) =>
    creatureA.data.team === creatureB.data.team