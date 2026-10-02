import type {IRPower} from "core/types";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";
import {MODIFIER_TYPE} from "core/battlegrid/creatures/Modifier";
import {to_ast} from "core/expressions/parser/to_ast";
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
    damage: "{1d8}",
    roll: {
        attack: "6",
        defense: "ac",
        hit: [
            {
                type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                value: "primary_damage",
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

const mob_attack = {
    name: "Mob Attack",
    type: MODIFIER_TYPE.ATTACK_ROLL,
    value: to_ast(`$count($filter_creatures($adjacent_creatures(owner), $and($is_ally(owner, filter_creature), $is_race(filter_creature, "kobold"))))`),
}

const kobold_skirmisher: Monster = {
    template: "Kobold Skirmisher",
    size: "small",
    race: "kobold",
    keywords: ["natural", "humanoid", "reptile"],
    level: 1,
    xp: 100,
    archetypes: ["skirmisher"],
    initiative: 5,
    senses: {
        perception: 0,
        // darkvision: not implemented
    },
    alignment: "evil",
    languages: ["Common", "Draconic"],
    hp: 27,
    // bloodied: 13 — not implemented
    defenses: {
        ac: 15,
        fortitude: 11,
        reflex: 14,
        will: 13,
    },
    speed: 6,
    powers: [
        spear,
        shifty,
    ],
    attributes: {
        str: 8,
        con: 11,
        dex: 16,
        int: 6,
        wis: 10,
        cha: 15,
    },
    constant_rules: [],
    skills: {
        acrobatics: 7,
        stealth: 9,
        thievery: 9,
    },
    modifiers: [mob_attack],
    // Combat Advantage: extra 1d6 damage on melee and ranged attacks — not implemented
    // Trap Sense: +2 bonus to all defenses against traps — not implemented
    // Equipment: hide armor, spear — not implemented
}

export {kobold_skirmisher}
