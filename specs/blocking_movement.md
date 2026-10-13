# Blocking Movement

## Structures

- A board square may hold a structure with a `blocks_movement` flag.
- When `blocks_movement` is true, that square is impassable for movement.
- When `blocks_movement` is false, or the square has no structure, movement is not blocked by that square.
- Structures on separator edges (`separators_horizontal`, `separators_vertical`) are out of scope for this rule.

## Footprint

- For a position that covers multiple squares, the position is impassable if **any** covered square is blocked by a structure.

## Movement actions

A square blocked by a structure counts as impassable terrain for all movement-related actions:

| Action | Rule |
|--------|------|
| Walk | Cannot enter or path through a blocked square. |
| Run | Same as walk. |
| Shift | Cannot shift into a blocked square. |
| Push | Cannot push a creature into a blocked square. |
| Pull | Cannot pull a creature into a blocked square. |
| Slide | Cannot slide a creature into a blocked square. |

- Voluntary movement (walk, run, shift) also cannot treat a blocked square as occupied only by terrain for destination selection — blocked squares are never valid movement destinations.
- Forced movement (push, pull, slide) cannot end on a blocked square.

## Creatures vs structures

- Creature occupancy and structure blocking are independent checks; either one makes a square impassable for movement.
- Blocking structures do not make a square count as occupied for non-movement targeting (e.g. selecting a creature on an adjacent square).
