# Market Boundary Library

Date: 2026-05-09

## Purpose

This document will define how QuarterlineV2 represents markets, submarkets,
custom geographies, and property-level locations.

## Current Status

No V2 market boundary library exists.

## Questions To Resolve

- Which geography levels matter for the first MVP?
- Are markets broker-defined, MSA/CBSA-based, custom, or mixed?
- How are submarkets imported, edited, and versioned?
- What should be stored locally vs. fetched from a service?
- How should boundaries appear in report exports?

## Candidate Concepts

- Market.
- Submarket.
- Custom boundary.
- Property point.
- Portfolio geography.
- Boundary source and version.

## Non-Goal

Do not assume V1 geography helpers or data sources apply to V2.
