import {create_battle_grid} from "scripts/battlegrid/BattleGrid";
import {create_visual_creature} from "web_components/creature/CreatureVisual";
import {create_player_turn_handler} from "scripts/battlegrid/player_turn_handler/PlayerTurnHandler";
import {create_action_log} from "scripts/action_log/ActionLog";
import {Creature} from "scripts/battlegrid/creatures/Creature";
import {ROGUE_POWERS} from "scripts/powers/rogue";
import {FIGHTER_POWERS} from "scripts/powers/fighter";
import {WIZARD_POWERS} from "scripts/powers/wizard";
import type {CreatureData} from "scripts/battlegrid/creatures/CreatureData";
import {create_initiative_order} from "scripts/initiative_order/InitiativeOrder";
import {create_option_buttons} from "scripts/battlegrid/option_buttons/OptionButtons";
import {create_option_button_visual} from "scripts/battlegrid/option_buttons/OptionButtonVisual";
import {create_hit_status_buttons} from "scripts/battlegrid/hit_status_buttons/HitStatusButtons";
import {create_creature_hit_status_visual} from "scripts/battlegrid/hit_status_buttons/CreatureHitStatusVisual";
import {ATTRIBUTES} from "scripts/character_sheet/attributes";
import {create_initiative_entry_visual} from "scripts/initiative_order/InitiativeEntryVisual";
import {create_add_creature_to_game} from "scripts/use_cases/add_creature_to_game";
import {create_start_battle} from "scripts/use_cases/start_battle";
import {create_turn_state} from "scripts/battlegrid/player_turn_handler/TurnState";
import {create_instruction_loop} from "scripts/instruction_loop";
import {build_evaluate_ast} from "scripts/expressions/evaluator/evaluate_ast";
import {create_instruction_visualizer} from "scripts/instruction_visualizer/instruction_visualizer";
import {AnimationQueue} from "scripts/AnimationQueue";
import {create_gameplay_use_cases} from "scripts/use_cases/gameplay/gameplay_use_cases";
import {HIT_STATUS, HitStatus} from "scripts/battlegrid/player_turn_handler/HitStatus";
import {create_settings} from "scripts/settings/Settings";
import {create_game_events} from "scripts/events/GameEvents";
import {create_battle_grid_ui} from "web_components/battle_grid/BattleGridUI";

const initiative_order = create_initiative_order({create_initiative_entry_visual})
const action_log = create_action_log()
const turn_state = create_turn_state()
const settings = create_settings()
const game_events = create_game_events()

const battle_grid = create_battle_grid({size: {x: 10, y: 10}})

const option_buttons = create_option_buttons({create_option_button_visual})
const hit_status_buttons = create_hit_status_buttons({
    create_creature_hit_status_visual,
    create_option_button_visual,
})

const evaluate_ast = build_evaluate_ast({battle_grid, turn_state})

const player_turn_handler = create_player_turn_handler({
    battle_grid,
    initiative_order,
    option_buttons,
    hit_status_buttons,
    turn_state,
    evaluate_ast,
    game_events
})

const battle_grid_ui = create_battle_grid_ui({
    battle_grid,
    player_turn_handler,
    turn_state,
    game_events,
    option_buttons,
    hit_status_buttons
})

const instruction_visualizer = create_instruction_visualizer()

const gameplay_use_cases = create_gameplay_use_cases({
    battle_grid, player_turn_handler, initiative_order
})

const instruction_loop = create_instruction_loop({
    player_turn_handler,
    battle_grid,
    turn_state,
    evaluate_ast,
    initiative_order,
    instruction_visualizer,
    settings
})


game_events.on_creature_added_to_game.add_handler((creature) => {
    const {data, events} = creature
    const visual = create_visual_creature(data)

    events.moved.add_handler(({position, movement_type}) => {
        switch (movement_type) {
            case "move":
                AnimationQueue.add_animation(() => visual.move_one_square(position))
                break
            case "push":
                AnimationQueue.add_animation(() => visual.push_to(position))
                break
        }
    })

    events.received_damage.add_handler(({damage}) => {
        AnimationQueue.add_animation(() => visual.receive_damage({hp: data.hp_current, damage: damage.value}))
    })

    events.is_untargeted.add_handler(() => {
        visual.remove_hit_chance()
    })

    events.is_missed.add_handler(() => {
        AnimationQueue.add_animation(visual.display_miss)
    })

    events.is_targeted.add_handler(({attack, defense, chance}) => {
        visual.display_hit_chance({attack, defense, chance})
    })

    events.received_damage.add_handler(({damage}) => {
        action_log.add_new_action_log(`${data.name} was dealt `, damage, ` damage.`)
    })

    const HIT_STATUS_TEXT = new Map<HitStatus, string>([
        [HIT_STATUS.MISS, "misses"],
        [HIT_STATUS.HIT, "hits"],
        [HIT_STATUS.CRIT, "crits"]
    ])

    events.has_attacked.add_handler(({attack, defense, hit_status, defender, instruction}) => {
        action_log.add_new_action_log(
            `${data.name}'s ${turn_state.get_power_name()} (`,
            attack,
            `) ${HIT_STATUS_TEXT.get(hit_status)} against ${defender.data.name}'s ${instruction.defense} (`,
            defense,
            `).`)
    })
})

const add_creature = create_add_creature_to_game({battle_grid, initiative_order, game_events})
const start_battle = create_start_battle({battle_grid, initiative_order, instruction_loop})

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

    add_creature({data: bob})
    add_creature({data: maik})
    add_creature({data: yeims})
    add_creature({data: jenri})

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
    gameplay_use_cases.set_current_turn_to_creature({creature})
}

const build_character = (
    data: Omit<Partial<CreatureData>, "position"> & Pick<CreatureData, "name" | "position">
): CreatureData => {
    return {
        name: data.name,
        position: data.position,
        size: data.size ?? "medium",
        image: data.image ?? `url("/public/saber-and-pistol.svg")`,
        movement: data.movement ?? 5,
        hp_current: data.hp_current ?? 10,
        hp_max: data.hp_max ?? 10,
        level: data.level ?? 1,
        team: data.team ?? null,
        attributes: data.attributes ?? Object.fromEntries(Object.values(ATTRIBUTES).map(attr => [attr, 14])) as Creature["data"]["attributes"],
        powers: data.powers ?? []
    }
}

const build_monster = (
    data: Omit<Partial<CreatureData>, "position"> & Pick<CreatureData, "name" | "position">
): CreatureData => {
    return {
        name: data.name,
        position: data.position,
        size: data.size ?? "medium",
        image: data.image ?? `url("/public/saber-and-pistol.svg")`,
        movement: data.movement ?? 5,
        hp_current: data.hp_current ?? 10,
        hp_max: data.hp_max ?? 10,
        level: data.level ?? 1,
        team: data.team ?? null,
        attributes: data.attributes ?? Object.fromEntries(Object.values(ATTRIBUTES).map(attr => [attr, 14])) as Creature["data"]["attributes"],
        powers: data.powers ?? []
    }
}

(window as any).init_demo()