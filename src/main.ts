import {create_action_log} from "web/action_log/ActionLog";
import {Creature} from "core/battlegrid/creatures/Creature";
import {ROGUE_POWERS} from "data/powers/rogue";
import {FIGHTER_POWERS} from "data/powers/fighter";
import {WIZARD_POWERS} from "data/powers/wizard";
import {evil_ritualist, Monster} from "data/monsters/EvilRitualist";
import type {CreatureData} from "core/battlegrid/creatures/CreatureData";
import {
    transform_power_ir_into_vm_representation
} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import {create_hit_status_buttons_ui} from "web/hit_status_buttons/HitStatusButtonsUI";
import {ATTRIBUTES} from "core/character_sheet/attributes";
import {create_initiative_entry_visual} from "core/initiative_order/InitiativeEntryVisual";
import {create_add_creature_to_game} from "core/use_cases/add_creature_to_game";
import {create_start_battle} from "core/use_cases/start_battle";
import {create_instruction_loop} from "core/instruction_loop";
import {build_evaluate_ast} from "core/virtual_machine/expressions/evaluate_ast";
import {create_instruction_visualizer} from "web/instruction_visualizer/instruction_visualizer";
import {create_set_current_turn_to_creature} from "core/use_cases/gameplay/set_current_turn_to_creature";
import {HIT_STATUS, HitStatus} from "core/battlegrid/player_turn_handler/HitStatus";
import {create_game_events} from "core/events/GameEvents";
import {create_game_state} from "core/game_state/GameState";
import {initialize_battle_grid_ui} from "web/battle_grid/BattleGridUI";
import {create_option_buttons_ui} from "web/creature_option_buttons/CreatureOptionButtons";

const action_log = create_action_log()
const game_events = create_game_events()
const game_state = create_game_state({
    game_events,
    create_initiative_entry_visual,
    battle_grid_size: {x: 10, y: 10},
})
const {battle_grid, turn_state} = game_state

const evaluate_ast = build_evaluate_ast({game_state})

const instruction_loop = create_instruction_loop({
    game_state,
    evaluate_ast,
    game_events,
})

//TODO nuke this
const player_turn_handler = instruction_loop

initialize_battle_grid_ui({
    battle_grid,
    player_turn_handler,
    turn_state,
    game_events,
})

create_option_buttons_ui({game_events})
create_hit_status_buttons_ui({game_events})
create_instruction_visualizer({game_events})

const set_current_turn_to_creature = create_set_current_turn_to_creature({game_state, game_events})

game_events.on_creature_received_damage.add_handler(({creature, damage}) => {
    action_log.add_new_action_log(`${creature.data.name} was dealt `, damage, ` damage.`)
})

const HIT_STATUS_TEXT = new Map<HitStatus, string>([
    [HIT_STATUS.MISS, "misses"],
    [HIT_STATUS.HIT, "hits"],
    [HIT_STATUS.CRIT, "crits"]
])

game_events.on_creature_attacked.add_handler(({creature, attack, defense, hit_status, defender, instruction, power_name}) => {
    action_log.add_new_action_log(
        `${creature.data.name}'s ${power_name} (`,
        attack,
        `) ${HIT_STATUS_TEXT.get(hit_status)} against ${defender.data.name}'s ${instruction.defense} (`,
        defense,
        `).`)
})

const add_creature = create_add_creature_to_game({game_state, game_events})
const start_battle = create_start_battle({game_state, instruction_loop, game_events})

;(window as any).init_demo = () => {
    const bob = build_character({
        name: "axe",
        position: {x: 1, y: 2, footprint: 1},
        image: `url("/public/war-axe.svg")`,
        movement: 5,
        hp_current: 7,
        hp_max: 10,
        level: 20,
        attributes: Object.fromEntries(Object.values(ATTRIBUTES).map(attr => [attr, 14])) as Creature["data"]["attributes"],
        powers: FIGHTER_POWERS,
        team: 1
    })
    const maik = build_character({
        name: "staff",
        position: {x: 0, y: 1, footprint: 1},
        image: `url("/public/wizard-staff.svg")`,
        movement: 2,
        hp_current: 10,
        hp_max: 10,
        level: 1,
        attributes: Object.fromEntries(Object.values(ATTRIBUTES).map(attr => [attr, 14])) as Creature["data"]["attributes"],
        powers: WIZARD_POWERS,
        team: 1
    })
    const yeims = build_character({
        name: "crossbow",
        position: {x: 1, y: 0, footprint: 1},
        image: `url("/public/crossbow.svg")`,
        movement: 10,
        hp_current: 10,
        hp_max: 10,
        level: 1,
        team: null,
        attributes: Object.fromEntries(Object.values(ATTRIBUTES).map(attr => [attr, 14])) as Creature["data"]["attributes"],
        powers: ROGUE_POWERS
    })

    const jenri = build_character({
        name: "pirate",
        position: {x: 7, y: 7, footprint: 2},
        size: "large",
        image: `url("/public/saber-and-pistol.svg")`,
    })

    const ritualist = build_monster(evil_ritualist, {
        position: {x: 3, y: 3, footprint: 1},
        image: `url("/public/wizard-staff.svg")`,
        team: 2,
    })

    const ritualist2 = build_monster(evil_ritualist, {
        position: {x: 3, y: 4, footprint: 1},
        image: `url("/public/wizard-staff.svg")`,
        team: 2,
    })

    add_creature({data: bob})
    add_creature({data: maik})
    add_creature({data: yeims})
    add_creature({data: jenri})
    add_creature({data: ritualist})
    add_creature({data: ritualist2})

    start_battle()
}

;(window as any).add_character = (data: CreatureData) => {
    add_creature({data})
}

;(window as any).start = () => {
    start_battle()
}

;(window as any).set_current_turn = (name: string) => {
    const creature = battle_grid.creatures.find(creature => creature.data.name === name)
    if (!creature) {
        console.log(`Creature with name '${name}' not found`)
        return
    }
    set_current_turn_to_creature({creature})
}

const build_character = (
    data: Omit<Partial<CreatureData>, "position"> & Pick<CreatureData, "name" | "position">
): CreatureData => {
    return {
        name: data.name,
        template: data.template ?? null,
        position: data.position,
        size: data.size ?? "medium",
        image: data.image ?? `url("/public/saber-and-pistol.svg")`,
        movement: data.movement ?? 5,
        hp_current: data.hp_current ?? 10,
        hp_max: data.hp_max ?? 10,
        level: data.level ?? 1,
        team: data.team ?? null,
        attributes: data.attributes ?? Object.fromEntries(Object.values(ATTRIBUTES).map(attr => [attr, 14])) as Creature["data"]["attributes"],
        powers: data.powers ?? [],
        archetypes: []
    }
}

const build_monster = (
    monster: Monster,
    overrides: Pick<CreatureData, "position"> & Partial<Omit<CreatureData, "position">>,
): CreatureData => {
    return {
        name: overrides.name ?? monster.template,
        template: overrides.template ?? monster.template,
        position: overrides.position,
        size: overrides.size ?? monster.size,
        image: overrides.image ?? `url("/public/saber-and-pistol.svg")`,
        movement: overrides.movement ?? monster.speed,
        hp_current: overrides.hp_current ?? monster.hp,
        hp_max: overrides.hp_max ?? monster.hp,
        level: overrides.level ?? monster.level,
        team: overrides.team ?? null,
        attributes: overrides.attributes ?? monster.attributes,
        archetypes: overrides.archetypes ?? monster.archetypes,
        powers: overrides.powers ?? monster.powers.map(transform_power_ir_into_vm_representation),
    }
}

(window as any).init_demo()