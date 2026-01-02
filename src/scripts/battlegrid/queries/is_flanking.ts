import {Creature} from "scripts/battlegrid/creatures/Creature";
import {get_flanker_positions} from "scripts/battlegrid/position/get_flanker_positions";
import {are_creatures_allied} from "scripts/creatures/are_creatures_allied";
import {BattleGrid} from "scripts/battlegrid/BattleGrid";

export const is_flanking = ({attacker, defender, battle_grid}: {
    attacker: Creature,
    defender: Creature,
    battle_grid: BattleGrid
}) => {
    if (attacker.data.team === null) return false

    //TODO P4 test actual flanking
    const positions = get_flanker_positions({
        attacker_position: attacker.data.position,
        defender_position: defender.data.position,
        battle_grid
    })

    if (positions.every(position => !battle_grid.is_terrain_occupied(position))) return false

    const flankers = positions.map(battle_grid.get_creature_by_position)
    return flankers.some(flanker => are_creatures_allied(flanker, attacker))
}