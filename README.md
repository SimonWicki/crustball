<p align="center">
  <img src="crustball.png" width="240" />
</p>

# crustball

crustball is a powerball style distribution mechanism that converts ongoing system activity into periodic randomized reward events.

The system accumulates value over time and releases it through deterministic draws that select eligible holders without staking, snapshots, or manual claims.

crustball is designed to be simple, inspectable, and mechanically honest. It does one thing and does it continuously.

---

## Overview

crustball operates as a closed loop system.

Activity enters the system.
Value accumulates.
A draw is triggered.
Rewards are distributed.
The cycle repeats.

There is no concept of claiming, opting in, or locking assets. Holding the token is sufficient to be eligible.

Each draw behaves like a powerball event. Most draws distribute modest rewards across a broader set of holders. Some draws concentrate rewards more aggressively. The outcome of each draw is fully deterministic and reproducible from public inputs.

The system does not attempt to optimize outcomes. It enforces rules and lets probability do the rest.

---

## Core Principles

crustball is built around a small set of constraints.

No staking  
No snapshots  
No claim transactions  
No discretionary intervention  
No hidden logic  

Every action taken by the system can be inspected, replayed, and verified.

If the inputs are known, the outcome is known.

---

## How the System Works

### 1. Accumulation Phase

During each cycle, system activity generates value. This may include protocol fees, routed flows, or other configured inputs.

All incoming value is tracked in a distribution pool associated with the current cycle.

The system does not distribute continuously. Accumulation is intentional. Value is meant to build tension between draws.

---

### 2. Eligibility Resolution

At draw time, the system determines which holders are eligible.

Eligibility rules are explicit and configurable but typically include:

Minimum balance thresholds  
Exclusion of known system addresses  
Optional cooldown or activity requirements  

No snapshots are taken. Holder state is resolved at draw time using live on chain data.

---

### 3. Entropy Generation

Entropy is derived from deterministic sources available on chain at the time of the draw.

Examples include:

Recent block data  
Transaction ordering  
Cycle counters  

The entropy source is fixed by the system configuration. No off chain randomness is introduced.

Given the same inputs, the same entropy is produced.

---

### 4. Selection

Eligible holders are passed through a weighted selection process.

Weights may be uniform or balance adjusted depending on configuration. Selection logic is deterministic and auditable.

Most cycles select multiple winners.
Some cycles select fewer winners with larger allocations.
Rare cycles may heavily concentrate distribution.

The system does not know which type of cycle it is until entropy is resolved.

---

### 5. Distribution

Once winners are selected, rewards are distributed directly.

There are no claims.
There is no batching delay.
There is no discretion.

Transfers are executed as part of the cycle finalization.

The cycle is then closed and the next accumulation phase begins.

---

## Cycle Timing

crustball operates on fixed interval cycles.

Typical configurations range from several minutes to longer intervals depending on deployment goals.

Shorter cycles increase frequency and reduce variance.
Longer cycles increase tension and amplify rare outcomes.

Cycle duration is part of the public configuration and does not change mid operation.

---

## Determinism and Auditability

Every crustball cycle can be replayed.

Given:
The cycle inputs  
The eligibility set  
The entropy source  
The selection algorithm  

Any third party can independently verify the result.

The system does not rely on trust. It relies on reproducibility.

---

## Failure Modes

crustball is designed to fail quietly.

If there is no activity, nothing is distributed.
If the pool is empty, the draw resolves with zero value.
If no holders are eligible, the cycle completes without winners.

There is no fallback logic that invents outcomes.

The absence of activity is treated as a valid state.

---

## What crustball Is Not

crustball is not a yield product.
crustball is not a staking protocol.
crustball is not a guarantee of return.
crustball is not optimized for constant rewards.

It is a mechanism. It reacts to inputs. It does not promise outcomes.

---

## Use Cases

crustball can be deployed anywhere periodic randomized redistribution is desired.

Examples include:

Fee redistribution mechanisms  
Protocol engagement incentives  
Experimental token economics  
Autonomous reward systems  

The mechanism is generic by design.

---

## Repository Structure

This repository contains a full reference implementation.

Key areas include:

Core cycle logic  
Eligibility resolution  
Entropy and selection  
Audit and replay tooling  
Configuration schemas  

Supporting documentation is provided in the `docs` directory.

---

## Extensibility

crustball is intentionally minimal.

Extensions should live at the edges, not the core.

Common extensions include:

Alternative eligibility rules  
Different entropy sources  
Custom weighting strategies  
External activity feeds  

The core loop should remain untouched.

---

## Philosophy

crustball treats randomness as a feature, not a flaw.

Most systems attempt to smooth outcomes. crustball accepts variance and makes it visible.

By concentrating value periodically instead of continuously, the system creates tension, anticipation, and uneven outcomes that reflect real activity.

crustball does not pretend to be fair in every moment. It is fair over time.

---

## License

This project is open source and provided as is.

Use it, fork it, inspect it, break it, or extend it.

The mechanism does not require permission to exist.
