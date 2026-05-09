# Map Rendering Pipeline

Date: 2026-05-09

## Purpose

This document will define the future V2 map and geospatial rendering approach.

## Current Status

No V2 map pipeline exists.

## Goals

- Support market and submarket context.
- Preserve desktop performance.
- Allow dense overlays without clutter.
- Keep map source/licensing decisions explicit.
- Support report-ready map exports if needed.

## Required Decisions

- 2D map, 3D map, or hybrid.
- Offline vs. online basemaps.
- Data sources and licensing.
- Polygon boundary format.
- Rendering library.
- Export path for report figures.

## Design Target

The concept artwork shows a dark 3D-style market overview. Future
implementation should decide whether that is a real 3D scene, a stylized 2D map,
or a staged MVP approximation.
