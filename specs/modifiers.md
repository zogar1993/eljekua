# Modifiers

## Definition

- A creature may have modifiers.
- Each modifier has a **name** and a **value**.
- The name is a plain label (not evaluated at runtime).
- The value is an expression evaluated at runtime.

## Attack roll

- An attack roll modifier applies every time the creature makes an attack roll.
- It modifies the **final attack roll value** (the total compared against the defender's defense).
- The modifier's value is evaluated when the attack roll resolves.
- The value must evaluate to a resolved number.
- Multiple attack roll modifiers on the same creature all apply; their values are summed into the attack total.
- The modifier name appears as the label for that value in the attack roll breakdown.
