# AGENTS.md

## Project Overview

A high-throughput multi-channel messaging gateway to dispatch transactional and promotional messages across SMS, Viber, Email, and WhatsApp. This a Nest JS monorepo that contains multiple independently deployable applications with shared internal libraries and core modules.

## Tech Stack & Environment

- Framework: NestJS (v11+), Express
- Runtime: Node.js (v24.22.0)
- Language: TypeScript 5
- Database: MongoDB via Mongoose
- Package Manager: pnpm
- Workspace Manager: NestJS monorepo workspace

## Command Matrix (Global vs. Scoped Workspace)

You must explicitly separate global codebase operations from targeted application execution. Never run global start scripts during a specific application task

### Global Commands (Repository-Wide Quality Checks)

Run these from the root directory to maintain codebase health across all workspaces:

- Lint entire workspace: `pnpm run lint` (Checks all apps and libs for syntax health)
- Format codebase: `pnpm run format` (Runs prettier across the monorepo)
- Global typecheck: `pnpm run typecheck` (Validates TypeScript integrity project-wide)

### Scoped Commands (Targeted Application Testing)

When debugging or implementing fix/features, isolate execution to the specific application you are targeting.

- inspect application list: `nest-cli.json`
- build application: `nest build <app-name>`
- run the built application for sandbox verification: `node dist/apps/<app-name>/main.js`
- terminate the application after verification: `ctrl + c`

## Domain maps

Read these maps only when it is required:

- Project structure (`docs/project-structure`)
