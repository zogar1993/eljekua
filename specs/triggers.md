# Triggers

Powers may define a trigger that fires when another creature's action matches an interception.

## Trigger timing and interception

| Interception | Allowed timing |
|--------------|----------------|
| `movement` | `interruption` only |
| `critical_hit` | `reaction` only |

Transforming a power whose trigger pairs an interception with the wrong timing throws.

## Movement interruption

- Each walk step runs as: offer movement interruption triggers, then move one square, then continue the walk if the path is not finished.
- Fires before each step that would leave a square where a valid trigger applies.
- When triggers are offered, the walk pauses until every offered trigger is resolved or ignored; the walk then resumes from the interrupted square.

## Critical hit reaction

- Fires after the attacking power's other instructions resolve, including attack roll consequences.
- Runs only when at least one attack roll in the current `hit_status` is a critical hit.
- The activator is the attacking creature (`owner`).

## Trigger variables

While trigger conditions are evaluated:

| Variable | Meaning |
|----------|---------|
| `trigger_activator` | The creature whose action triggered the check |
| `trigger_owner` | The creature currently being tested for a matching trigger power |

## Offering triggers

- Each eligible creature is offered its matching trigger powers as options, plus Ignore.
- A creature that was already offered triggers for the same interception in the current context is not offered again.
