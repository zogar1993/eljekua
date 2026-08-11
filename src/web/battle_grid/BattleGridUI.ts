import {BattleGrid} from "core/battlegrid/BattleGrid";
import {create_battle_grid_visual} from "web/battle_grid/BattleGridVisual";
import {create_visual_square, SquareVisual} from "web/battle_grid/squares/SquareVisual";
import {
    Position,
    PositionFootprintOne, positions_of_same_footprint_equal,
    transform_position_to_f1,
    transform_positions_to_f1
} from "core/battlegrid/Position";
import {SQUARE_HIGHLIGHT, SquareHighlight} from "web/battle_grid/squares/SquareHighlight";
import {bound_minmax} from "stdlib/bound_minmax";
import {get_creature_defense} from "core/character_sheet/get_creature_defense";
import {EXPR} from "core/expressions/evaluator/EXPR";
import {INSTRUCTION_TYPE} from "core/expressions/parser/instructions";
import {Expr} from "core/expressions/evaluator/types";
import {AstNode} from "core/expressions/parser/nodes/AstNode";
import {
    AvailableInteractionsSelectPosition,
    PlayerTurnHandler, Targets
} from "core/battlegrid/player_turn_handler/PlayerTurnHandler";
import {TurnState} from "core/battlegrid/player_turn_handler/TurnState";
import {
    ClickableCoordinate,
    get_position_by_coordinate,
    nullable_positions_equal
} from "web/battle_grid/coordinates/ClickableCoordinate";
import {GameEvents} from "core/events/GameEvents";
import {create_visual_creature} from "web/creature/CreatureVisual";
import {AnimationQueue} from "core/AnimationQueue";
import {OptionButtons} from "core/battlegrid/option_buttons/OptionButtons";
import {HitStatusButtons} from "core/battlegrid/hit_status_buttons/HitStatusButtons";

export const initialize_battle_grid_ui = ({
                                              battle_grid,
                                              player_turn_handler,
                                              turn_state,
                                              game_events,
                                              option_buttons,
                                              hit_status_buttons
                                          }: {
    battle_grid: BattleGrid,
    player_turn_handler: PlayerTurnHandler,
    turn_state: TurnState,
    game_events: GameEvents,
    option_buttons: OptionButtons,
    hit_status_buttons: HitStatusButtons
}) => {
    const {size} = battle_grid
    const click_overlay = create_battle_grid_visual({width: size.x, height: size.y})
    const board = battle_grid.board.map(row => row.map(({position: {x, y}}) => create_visual_square({x, y})))

    const highlighted: Record<SquareHighlight, Set<SquareVisual>> = {
        [SQUARE_HIGHLIGHT.NONE]: new Set<SquareVisual>(),
        [SQUARE_HIGHLIGHT.SELECTED]: new Set<SquareVisual>(),
        [SQUARE_HIGHLIGHT.AREA]: new Set<SquareVisual>(),
        [SQUARE_HIGHLIGHT.PATH]: new Set<SquareVisual>(),
        [SQUARE_HIGHLIGHT.AVAILABLE_TARGET]: new Set<SquareVisual>()
    }
    const hovered = new Set<SquareVisual>()

    const get_square = ({x, y}: PositionFootprintOne) => {
        if (x < 0 || x >= size.x || y < 0 || y >= size.y)
            throw (`position {x:${x}, y:${y}} is out of the battle grid dimensions (width:${size.x}, height:${size.y})`)
        return board[y][x]
    }

    const get_squares = (position: Position) => {
        return transform_position_to_f1(position).map(p => get_square(p))
    }

    const set_highlights = ({positions, highlight}: { positions: Array<Position>, highlight: SquareHighlight }) => {
        const squares = positions.flatMap(position => get_squares(position))
        squares.forEach(square => square.set_highlight(highlight))
        squares.forEach(square => highlighted[highlight].add(square))
    }

    const clear_highlights = ({highlight}: { highlight: SquareHighlight }) => {
        const squares = highlighted[highlight]
        squares.forEach(square => square.set_highlight("none"))
        squares.clear()
    }

    const set_hovers = ({positions}: { positions: Array<Position> }) => {
        const squares = positions.flatMap(position => get_squares(position))
        squares.forEach(square => square.set_interaction_status("hover"))
        squares.forEach(square => hovered.add(square))
    }

    const clear_hovers = () => {
        hovered.forEach(square => square.set_interaction_status("none"))
        hovered.clear()
    }

    const on_click = ({coordinate}: { coordinate: ClickableCoordinate }) => {
        const selection_context = player_turn_handler.get_selection_context()
        if (selection_context?.type !== "position_select") return

        const position = get_position_by_coordinate({coordinate, positions: selection_context.clickable})
        if (position === null) return

        selection_context.select(position)

        deselect()
    }

    const deselect = () => {
        const selection_context = player_turn_handler.get_selection_context()
        if (selection_context === null) return

        if (selection_context.type === "position_select") {
            clear_highlights({highlight: SQUARE_HIGHLIGHT.AVAILABLE_TARGET})
            clear_highlights({highlight: SQUARE_HIGHLIGHT.PATH})
            clear_highlights({highlight: SQUARE_HIGHLIGHT.AREA})
            clear_highlights({highlight: SQUARE_HIGHLIGHT.SELECTED})
            /*
                        if (targets) {
                            if (targets.type === "creatures") {
                                const creatures = targets.value

                                creatures.forEach(creature => creature.events.is_untargeted.raise())
                            }
                        }

             */
        } else if (selection_context.type === "option_select")
            option_buttons.remove_options()
        else if (selection_context.type === "hit_status_select")
            hit_status_buttons.remove()

        player_turn_handler.set_selection_context(null)
    }

    function set_selected_indicator() {
        const position = turn_state.get_acting_creature().data.position
        set_highlights({positions: [position], highlight: "selected"})
    }


    let latest_position: Position | null = null
    click_overlay.addOnMouseMoveHandler(coordinate => {
        const selection_context = player_turn_handler.get_selection_context()
        if (selection_context?.type !== "position_select") return

        const position = coordinate &&
            get_position_by_coordinate({positions: selection_context.clickable, coordinate})

        if (nullable_positions_equal(latest_position, position)) return

        clear_hovers()

        if (position === null) return


        latest_position = position

        /*
                const highlighted_positions = selection_context.highlighted.map(({position}) => position)

                for (const position of highlighted_positions) {
                    get_square(position).set_interaction_status("none")
                    get_square(position).set_highlight("none")
                }

         */

        for (const creature of battle_grid.creatures)
            creature.events.is_untargeted.raise()

        if (position) {
            selection_context.get_targets_for_position(position)
            //show_attack_success_chance_if_needed({selection_context, evaluate_ast, turn_state})
            set_hovers({positions: transform_position_to_f1(position)})
        } else {
            const positions = transform_positions_to_f1(selection_context.clickable)
            set_highlights({positions, highlight: SQUARE_HIGHLIGHT.NONE})
        }
    })

    click_overlay.addOnClickHandler(coordinate => {
        on_click({coordinate})
    })

    game_events.on_acting_creature_changed.add_handler(creature => {
        if (creature === null)
            deselect()
        else
            set_selected_indicator()
    })

    game_events.on_available_interactions_changed.add_handler((interactions) => {
        if (interactions.type === "position_select") {
            set_selected_indicator()

            set_highlights({positions: interactions.clickable, highlight: "available-target"})

            /* TODO reactivate path highlighting
                        for (const {position, highlight} of interactions.highlighted)
                            set_highlight({positions: [position], highlight})

             */
        }
    })

    return {
        click_overlay,
        board,
    }
}

/* TODO activate success chance again
const show_attack_success_chance_if_needed = ({turn_state, selection_context, evaluate_ast}: {
    turn_state: TurnState,
    selection_context: AvailableInteractionsSelectPosition,
    evaluate_ast: (node: AstNode) => Expr
}) => {
    const next_instruction = turn_state.peek_instruction()
    const needs_roll = next_instruction.type === INSTRUCTION_TYPE.ATTACK_DICE_ROLL
    if (needs_roll && selection_context.target) {
        if (selection_context.target.type !== "creatures")
            throw Error("an attack roll needs to target creatures")

        const creatures = selection_context.target.value
        creatures.forEach(defender => {
            const attacker = next_instruction.attack
            const attack = EXPR.as_number(evaluate_ast(attacker))

            const defense_code = next_instruction.defense
            const defense = get_creature_defense({creature: defender, defense_code}).value

            const chance = bound_minmax(0, (attack + 20 - defense + 1) * 5, 100)

            defender.events.is_targeted.raise({attack, defense, chance})
        })
    }
}
 */