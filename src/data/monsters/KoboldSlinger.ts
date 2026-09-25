import type {IRPower} from "core/types";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";
import type {Monster} from "data/monsters/Monster";

const dagger: IRPower = {
    name: "Dagger",
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
        attack: "8",
        defense: "ac",
        hit: [
            {
                type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                value: "$add({1d4},3)",
                target: "primary_target",
            },
        ],
    },
}

// Sling range not listed on the stat block; using short range only.
const sling: IRPower = {
    name: "Sling",
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    targeting: {
        targeting_type: "ranged",
        target_type: "enemy",
        amount: 1,
        distance: "20",
    },
    roll: {
        attack: "8",
        defense: "ac",
        hit: [
            {
                type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                value: "$add({1d6},5)",
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

// const special_shot: IRPower = {
//     name: "Special Shot",
//     type: {
//         action: "standard",
//         cooldown: "encounter", // 3/encounter — not implemented
//         attack: true,
//     },
//     targeting: {
//         targeting_type: "ranged",
//         target_type: "enemy",
//         amount: 1,
//         distance: "10", // Ranged 10/20 — long range (20) not implemented
//     },
//     roll: {
//         attack: "8",
//         defense: "ac",
//         hit: [
//             {
//                 type: INSTRUCTION_TYPE.APPLY_DAMAGE,
//                 value: "$add({1d6},5)",
//                 target: "primary_target",
//             },
//             // 1-2 Stinkpot: -2 attack rolls (save ends) — not implemented
//             // 3-4 Firepot (fire): ongoing 2 fire (save ends) — not implemented
//             // 5-6 Gluepot: immobilized (save ends) — not implemented
//         ],
//     },
// }

const kobold_slinger: Monster = {
    template: "Kobold Slinger",
    size: "small",
    race: "kobold",
    keywords: ["natural", "humanoid", "reptile"],
    level: 1,
    xp: 100,
    archetypes: ["artillery"],
    initiative: 3,
    senses: {
        perception: 1,
        // darkvision: not implemented
    },
    alignment: "evil",
    languages: ["Common", "Draconic"],
    hp: 24,
    // bloodied: 12 — not implemented
    defenses: {
        ac: 13,
        fortitude: 12,
        reflex: 14,
        will: 12,
    },
    speed: 6,
    powers: [
        dagger,
        sling,
        shifty,
    ],
    attributes: {
        str: 9,
        con: 12,
        dex: 17,
        int: 9,
        wis: 12,
        cha: 10,
    },
    constant_effects: [],
    // Special Shot — not implemented (see commented power above)
    // Skills: Stealth +8 — not implemented
    // Equipment: 3 special shot ammo, dagger, leather armor, sling, sling bullets x20 — not implemented
}

export {kobold_slinger}
