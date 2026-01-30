# BagsBall Architecture

This repository contains an off-chain distribution worker for BagsBall that targets the Solana SPL token
model. The system is designed to be stateless across cycles, with explicit inputs and replayable selection.

## Components

- Scheduler: triggers a cycle at a fixed interval; ensures no overlap
- Holder discovery: enumerates token accounts for the mint and produces a holder set
- Eligibility filter: thresholds balances; normalizes owners; removes duplicates
- Random seed builder: composes deterministic seed material per cycle
- Selector: samples `N` unique winners uniformly from the eligible set
- Distributor: sends SPL transfers from a pool token account to winners
- Recorder: writes JSONL audit logs per cycle

## Failure model

The system fails closed if it cannot establish a consistent holder set or pool balance. Distributions should
not happen on partial data.

## Verifiability

A cycle is replayable if you persist:
- the eligible set (addresses + balances) or a deterministic snapshot reference
- the seed inputs (slot, blockhash, cycle id, static salt)
- the selection algorithm version

The worker emits these fields in the JSONL audit log.
