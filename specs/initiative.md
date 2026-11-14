# Initiative

## Joining combat

- When a creature is added to the game, roll **d20** and add its initiative modifier to set its initiative total.
- Initiative is fixed once rolled; it is not re-rolled during the same encounter.

## Initiative modifier

- Use the creature's explicit `initiative_modifier` when present.
- Otherwise, initiative modifier is half level plus the creature's Dexterity ability modifier.

## Order

- Creatures act from highest initiative total to lowest.
- When two creatures share the same initiative total, the one with the higher initiative modifier acts first.
- When initiative total and initiative modifier are both tied, the creature already in the order acts before one added later.

## Current turn

- The initiative order tracks which creature's turn it is.
- **Start battle** — the creature at the front of the order acts first.
- **End turn** — turn passes to the next creature in the order; after the last creature, turn wraps to the first.
- **Set current turn** — turn jumps directly to a chosen creature that is already in the order.

## Errors

- No creature in the initiative order when the current creature is queried, battle starts, or turn advances.
- **Set current turn** targets a creature that is not in the initiative order.