# Temporary Hit Points

## Not real hit points

- Temporary hit points are not healing.
- They are a separate pool that absorbs damage before current hit points are reduced.
- Granting temporary hit points does not change the creature's current hit points.
- A creature at 0 or fewer current hit points remains at 0 or fewer after receiving temporary hit points.

## Do not count toward maximum

- Temporary hit points are not added to current hit points.
- They do not count when comparing current hit points to maximum hit points.
- They do not affect whether the creature is bloodied.
- Effects that depend on current hit points ignore temporary hit points.

## Lose temporary hit points first

- When a creature takes damage, subtract its temporary hit points from the damage first.
- Any remaining damage reduces current hit points.
- See **Damage** for general damage application.

## Not cumulative

- When a creature receives temporary hit points multiple times, keep the highest total; do not add the values together.
- Example: a creature has 5 temporary hit points, receives 5 again before using them — it still has 5, not 10.
- Example: a creature has 10 temporary hit points, takes 8 damage (leaving 2), then receives 5 — it has 5, not 7.

## Until a rest

- Temporary hit points last until reduced to 0 or until the creature takes a short rest or an extended rest.

## Instruction: add temporary hit points

- **target** — variable label bound to exactly one creature.
- **value** — expression that resolves to a non-negative number of temporary hit points to grant.

### Normal behavior

- Evaluate **value** and set the target's temporary hit points to the higher of its current temporary hit points and the resolved amount.
- Current hit points are unchanged.

### Edge cases

- Granting 0 leaves temporary hit points unchanged when the creature already has a higher pool.
- Granting temporary hit points to a creature at 0 or negative current hit points only updates the temporary pool.

### Errors

- **target** is not bound to exactly one creature.
- **value** does not resolve to a number.
- **value** resolves to a negative number.
