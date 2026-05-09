# Persistence Schema

Date: 2026-05-09

## Purpose

This document will describe the future QuarterlineV2 persistence layer. It
replaces old hosted-backend assumptions with a clean desktop-first planning
surface.

## Current Status

No persistence schema is implemented. No hosted backend is selected.

## Local-First Questions

- Should the app use SQLite, a workspace package, embedded document storage, or
  another local persistence model?
- How should source files be stored, referenced, encrypted, retained, and
  deleted?
- How should export snapshots be reproduced?
- What audit trail is needed locally?
- What schema choices keep future sync possible?

## Optional Hosted Questions

Hosted services should be treated as future additive capabilities:

- Authentication.
- Backup.
- Team sync.
- AI provider orchestration.
- Shared review.
- Entitlements.

## Future Schema Sections

Add sections later for:

- Local tables/documents.
- File-storage layout.
- Migration strategy.
- Backup/restore.
- Sync model.
- Security model.
- Verification scripts.
