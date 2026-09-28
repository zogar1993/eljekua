import type {IRPower} from "core/types";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";
import type {Monster} from "data/monsters/Monster";

const spear: IRPower = {
    name: "Spear",
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
        attack: "6",
        defense: "ac",
        hit: [
            {
                type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                value: "{1d8}",
                target: "primary_target",
            },
        ],
    },
}

const shift_and_slide: IRPower = {
    name: "Shift and Slide",
    type: {
        action: "minor",
        cooldown: "at-will",
        attack: false,
    },
    targeting: {
        targeting_type: "adjacent",
        target_type: "ally",
        amount: 1,
    },
    effect: [
        {
            type: INSTRUCTION_TYPE.SWAP_PLACES,
            creature_a: "owner",
            creature_b: "primary_target",
        },
    ],
}

const kobold_slink: Monster = {
    template: "Kobold Slink",
    size: "small",
    race: "kobold",
    keywords: ["natural", "humanoid", "reptile"],
    level: 1,
    xp: 100,
    archetypes: ["lurker"],
    initiative: 7,
    senses: {
        perception: 0,
        // darkvision: not implemented
    },
    alignment: "evil",
    languages: ["Common", "Draconic"],
    hp: 24,
    // bloodied: 12 — not implemented
    defenses: {
        ac: 15,
        fortitude: 12,
        reflex: 14,
        will: 13,
    },
    speed: 6,
    powers: [
        spear,
        shift_and_slide,
    ],
    attributes: {
        str: 8,
        con: 12,
        dex: 16,
        int: 6,
        wis: 10,
        cha: 15,
    },
    constant_effects: [],
    skills: {
        acrobatics: 7,
        stealth: 9,
        thievery: 9,
    },
    // Combat Advantage: extra 1d6 damage on melee and ranged attacks — not implemented
    // Slink's Boon: cannot be targeted unless nearest enemy — not implemented
    // Equipment: hide armor, spear — not implemented
}

export {kobold_slink}
