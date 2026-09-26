# Expressions

Expressions are AST nodes evaluated at runtime to typed values (numbers, booleans, strings, creatures, positions).

## Evaluation errors

These apply to every expression unless a section below states otherwise:

- A function called with the wrong number of parameters throws at evaluation.
- A parameter whose evaluated type does not match what the function expects throws at evaluation.
- A keyword used when its VM variable is not bound throws at evaluation.

## Literals

- A **number** evaluates to a resolved number with that value.
- A **string** (double-quoted) evaluates to a string with that value.

## Keywords

- A keyword resolves to the VM variable with the same name.
- A keyword with a property (e.g. `owner.level`) resolves to that property on the bound creature.

### System keywords

| Keyword | Meaning |
|---------|---------|
| `owner` | The acting creature for the current power or instruction frame |
| `primary_target` | The primary target selected for the current power |
| `filter_creature` | The creature currently under test during `$filter_creatures` |

## `$add`

- Parameters: one or more number expressions.
- Result: the sum of all parameters, as a resolved number.
- Throws when any parameter does not evaluate to a number.

## `$is_ally`

- Parameters: two creature expressions.
- Result: `true` when both creatures have a non-null team and share that team; otherwise `false`.

## `$are_enemies`

- Parameters: two creature expressions.
- Result: `true` when `$is_ally` would be `false`; otherwise `false`.

## `$is_race`

- Parameters: a creature expression and a race string.
- Result: `true` when the creature's race matches the string; otherwise `false` (including when the creature has no race).

## `$creature_by_id`

- Parameters: a creature id number.
- Result: a creatures value containing that creature.
- Throws when no creature exists with that id.

## `$adjacent_creatures`

- Parameters: one creature expression.
- Result: all creatures occupying squares adjacent to the source creature's occupied surface.
- The source creature is never included.
- Adjacency uses Chebyshev distance 1 from the creature's full footprint.
- Returns an empty list when there are no adjacent creatures.

## `$count`

- Parameters: one creatures expression.
- Result: the number of creatures in that list, as a resolved number.
- Returns `0` for an empty list.

## `$filter_creatures`

- Parameters: a creatures expression and a boolean condition.
- For each creature in the list, `filter_creature` is bound to that creature while the condition is evaluated.
- Result: a creatures value containing only creatures for which the condition is `true`.
- Returns an empty list when no creatures satisfy the condition, or when the input list is empty.
