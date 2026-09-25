import type {IRPower} from "core/types";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";
import type {Monster} from "data/monsters/Monster";

const javelin_melee: IRPower = {
    name: "Javelin",
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
        traits: ["melee_basic_attack"],
    },
    targeting: {
        targeting_type: "melee_weapon",
        target_type: "enemy",
        amount: 1,
    },
    roll: {
        attack: "5",
        defense: "ac",
        hit: [
            {
                type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                value: "4",
                target: "primary_target",
            },
        ],
    },
}

// Ranged 10/20 — long range (20) not implemented; using short range only.
const javelin_ranged: IRPower = {
    name: "Javelin (Ranged)",
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    targeting: {
        targeting_type: "ranged",
        target_type: "enemy",
        amount: 1,
        distance: "10",
    },
    roll: {
        attack: "5",
        defense: "ac",
        hit: [
            {
                type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                value: "4",
                target: "primary_target",
            },
        ],
    },
}

const shifty: IRPower = {
    name: "Shifty",
    type: {
        action: "minor",
        cooldown: "at-will",
        attack: false,
    },
    targeting: {
        targeting_type: "movement",
        distance: 1,
    },
    effect: [
        {
            type: INSTRUCTION_TYPE.SHIFT,
            target: "owner",
            destination: "primary_target",
        },
    ],
}

const kobold_minion: Monster = {
    template: "Kobold Minion",
    size: "small",
    race: "kobold",
    keywords: ["natural", "humanoid", "reptile"],
    level: 1,
    xp: 25,
    archetypes: ["minion", "skirmisher"],
    initiative: 3,
    senses: {
        perception: 1,
        // darkvision: not implemented
    },
    alignment: "evil",
    // languages: ["Common", "Draconic"] — not implemented
    languages: [],
    // HP 1; a missed attack never damages a minion — enforced via minion archetype
    hp: 1,
    defenses: {
        ac: 15,
        fortitude: 11,
        reflex: 13,
        will: 11,
    },
    speed: 6,
    powers: [
        javelin_melee,
        javelin_ranged,
        shifty,
    ],
    attributes: {
        str: 8,
        con: 12,
        dex: 16,
        int: 9,
        wis: 12,
        cha: 10,
    },
    constant_effects: [],
    // Trap Sense: +2 bonus to all defenses against traps — not implemented
    // Skills: Stealth +4, Thievery +4 — not implemented
    // Equipment: hide armor, javelin x3, light shield — not implemented
}

export {kobold_minion}
