# Slowed

## Speed cap

- While a creature has the slowed condition, its speed is 2 if its base speed is higher than 2.
- A creature whose base speed is already 2 or lower is unchanged by slowed.

## Movement that uses speed

- Slowed applies to movement that resolves distance from the creature's speed (for example walk via `$speed(owner)`).
- Powers that declare a fixed movement distance without using the creature's speed are not reduced by slowed.

## Exceptions

- Slowed does not limit forced movement, teleportation, or any movement that does not use the creature's speed.

## Instruction: apply status (slowed)

- **target** — variable label bound to one or more creatures.
- **duration** — when the slowed condition ends (see status durations elsewhere).
- **status.type** — `slowed` (no additional fields).

### Normal behavior

- Add a slowed status to each target.
- While the status lasts, the target's speed for speed-based movement is capped as in **Speed cap**.

### Edge cases

- Applying slowed to a creature that already has slowed adds another status entry; speed remains capped at 2.
- Slowed on a creature with base speed 1 or 2 does not increase its speed.

### Errors

- **target** is not bound to at least one creature.
- **duration** uses an unsupported value.