# Framework Architecture Specification

**Repo:** `nestjs-master` · **Status:** draft for review · **Date:** 2026-08-21

This document specifies what this repository is meant to become: a reusable NestJS
baseline that new services of any nature (public API, event consumer, scheduled job,
internal BFF) can start from without re-solving configuration, observability,
messaging, error handling, or delivery. It records the target architecture, the
rules that keep it reusable, and a prioritised register of what is still missing or
broken today.

---

## 1. Purpose and scope

### 1.1 What "base" means here

A base repository succeeds when a new service can be created by:

1. copying (or generating from) this repo,
2. deleting the `libs/application` contents and the apps it does not need,
3. declaring its own config schema and feature modules,

and getting logging, tracing, metrics, secrets, health, error shape, security
headers, graceful shutdown, CI, and container packaging for free.

It fails when a new service has to *edit* framework code to start. Every gap below
is judged against that test.

### 1.2 Non-goals

- Not a published open-source framework. It is an internal baseline.
- Not a domain framework. No gaming, payments, or reporting concepts belong in `libs/framework`.
- Not a runtime platform. Deployment manifests, mesh, and infra live elsewhere; this
  repo only guarantees the contract those systems expect (health endpoints, signals,
  config surface, log/trace format).

### 1.3 Open decision: distribution model

Before hardening, one decision must be made, because it changes how `libs/framework`
is written.

| Option | How new projects consume it | Cost | Upgrade path |
|---|---|---|---|
| **A. Template fork** (current implicit model) | Copy the repo, delete what you don't need | Zero setup | None — fixes never propagate; N divergent copies |
| **B. Published package** `@snsoft/nest-framework` | `pnpm add`, monorepo keeps only `application` + `apps` | Needs versioning, changelog, release CI, stable public API | Semver bump |
| **C. Hybrid (recommended)** | Template fork now; `libs/framework` written to package rules from day one (no app imports, no `@package` alias, explicit peer deps) so it can be extracted later without rewrite | Discipline only | Extract when the second or third project lands |

**Recommendation: C.** The concrete implication is a hard constraint — see §3.2 —
that `libs/framework` may not import from `@application`, `@integrations`, or any
app, and may not read `process.env` at import time.

---

## 2. Current state

### 2.1 Inventory

| Area | Location | Maturity |
|---|---|---|
| Monorepo layout (`apps/*`, `libs/*`), path aliases | `nest-cli.json`, `tsconfig.json` | Solid |
| Secret/config loading (env + Vault, Zod-validated) | `libs/framework/src/secret` | Solid — best part of the repo |
| Structured logging (pino + trace/version/caller mixins) | `libs/framework/src/logger` | Solid |
| OpenTelemetry traces + metrics | `libs/framework/src/trace` | Works, mis-wired (§5.2) |
| API docs (OpenAPI + Scalar, Zod DTOs) | `libs/framework/src/scalar`, `swagger` | Solid |
| Connection modules (Redis, Redis Cluster, Pulsar, ClickHouse, Mongo) | `libs/framework/*`, `libs/application/connnections` | Solid pattern |
| Pulsar producer/consumer base classes | `libs/framework/src/pulsar` | Present, has correctness bugs (§5.1) |
| Idempotency helper | `libs/framework/src/utils` | Present, has a race (§5.1) |
| RFC-9457 problem-details **types** | `libs/framework/src/swagger` | Types only — no filter emits them |
| Auth, health, security, resilience, cache, jobs, persistence patterns | — | Absent |
| `apps/worker`, `apps/cron` | `apps/*` | Nest hello-world scaffolds |
| Docker, CI, hooks, `.env.example`, ADRs | — | Absent |

### 2.2 Identity leakage

The repo is meant to be generic but currently carries one project's identity in
places a fork would silently inherit:

- `package.json` `name: "api"`, no `repository`, no `engines`.
- `OTEL_SERVICE_NAME` defaults to `risk-event` (`libs/framework/src/trace/config.ts`).
- Swagger title/description hardcoded to `Risk Audit API` (`apps/api/src/main.ts`).
- `libs/application` holds gaming-domain integrations (`cpms-pcr-reader` and its
  ClickHouse schema, plus empty `fpms-*`, `bi-service`, `cpms-service` stubs).
- `apps/api/src/controllers` holds product endpoints (`data-report`).

None of this is wrong for the current product; all of it must be *isolated* so the
delete-and-replace step in §1.1 is a directory removal, not a search-and-replace.

---

## 3. Target architecture

### 3.1 Layers

```
L3  apps/*            Composition roots. One process each. Own bootstrap, own env schema,
                      own transport (HTTP / consumer / scheduler). No business logic.
                      apps/api  apps/worker  apps/cron  (+ future: apps/gateway, apps/admin)

L2  libs/application  The product. Feature modules, domain services, integrations with
                      other systems, persistence schemas. THE SWAPPABLE LAYER — a new
                      project replaces this wholesale.

L1  libs/platform     (NEW) Opinionated wiring that is reusable but environment-specific:
                      the standard bootstrap sequence, connection factories, the default
                      global filter/interceptor/guard set, health registry.
                      Knows framework + Nest. Knows nothing about the product.

L0  libs/framework    Infrastructure primitives. Pure capability modules: secrets, logger,
                      tracing, messaging, cache, http client, errors, docs, testing.
                      No product concepts. No process.env at import time. Publishable.
```

`libs/platform` is a new layer. It exists because today `libs/application` does two
unrelated jobs: it wires infrastructure (secrets, logger, Redis/Mongo/Pulsar
connections) *and* holds the product. A fork must keep the first and discard the
second, which is impossible while they share a module.

### 3.2 Dependency rules (enforced in CI)

| From | May import |
|---|---|
| `apps/*` | `platform`, `application`, `framework` |
| `libs/application` | `platform`, `framework` |
| `libs/platform` | `framework` |
| `libs/framework` | third-party only |

Additional constraints on `libs/framework`:

- No `@package` alias (it resolves to the app's `package.json`; breaks on extraction).
  Version/service metadata is **injected**, not imported.
- No top-level side effects. No `process.env` reads outside a factory function.
- Every module exposes `forRoot` / `forRootAsync` and takes its configuration as an
  argument. Nothing reads global state.
- `global: true` is opt-in via options, not the default — today all three connection
  modules force global scope, which makes multiple named connections collide
  conceptually and hides missing imports.

Enforcement: `eslint-plugin-boundaries` or `dependency-cruiser`, wired into `pnpm lint`.

### 3.3 Standard app shape

Every app in `apps/*` follows the same bootstrap, provided by
`libs/platform/src/bootstrap`:

```
main.ts
  └─ bootstrap(AppModule, {
       name, version, envSchema, transport: 'http' | 'headless',
       docs?: { title, description },
     })
       1. start OTel SDK          (BEFORE Nest — see §5.2)
       2. create Nest app, bufferLogs
       3. resolve env/secrets, attach pino logger, flush
       4. install global pipe / filter / interceptors / guards
       5. security middleware, CORS, versioning, docs
       6. enableShutdownHooks + SIGTERM/SIGINT drain
       7. listen or run
```

An app module contains: its env schema, its feature-module imports, its transport
concerns. Nothing else.

### 3.4 Capability contracts

The following are the modules `libs/framework` must expose. Marked ✅ present,
◐ partial, ✗ missing.

| # | Capability | Contract |
|---|---|---|
| ✅ | **Config & secrets** | `SecretsModule.forRoot/forRootAsync`, Zod schema per token, env + Vault providers, fail-fast on invalid schema |
| ✅ | **Logging** | pino, JSON in prod / pretty in dev, `trace_id`+`span_id`+`version` mixins, redaction |
| ◐ | **Tracing & metrics** | OTel SDK started before app code; sampler, exporters, propagators from injected config; `@Trace()` decorator and a metrics facade for counters/histograms |
| ✗ | **Request context** | AsyncLocalStorage carrying `requestId`, `traceId`, caller identity, tenant; readable anywhere; auto-propagated to outbound HTTP and produced messages |
| ◐ | **Errors** | Exception hierarchy (`DomainError`, `NotFoundError`, `ConflictError`, `ValidationError`, `UpstreamError`) + global filter that renders RFC-9457 `ProblemDetails`, maps Zod errors, logs 5xx with stack and 4xx without |
| ✗ | **HTTP client** | Typed outbound client: base URL from config, timeout, bounded retry with jitter, circuit breaker, trace-header propagation, request/response logging with redaction, Zod response parsing |
| ✅ | **Cache/Redis** | Standalone + cluster factories |
| ✗ | **Cache patterns** | `@Cacheable` / cache-aside helper with stampede protection; distributed lock (`SET NX PX` + token-checked release) |
| ◐ | **Messaging (Pulsar)** | Producer/consumer base classes with **ack-on-success only**, Zod payload validation, DLQ + retry policy, batch backoff, graceful drain |
| ✗ | **Outbox** | Transactional outbox writer + relay, for state-change-then-publish flows |
| ◐ | **Idempotency** | Atomic reserve/commit/release with TTL; usable from HTTP (`Idempotency-Key`), consumers, and cron |
| ✅ | **ClickHouse** | Async client factory + query helpers |
| ◐ | **Persistence (Mongo)** | Base schema (timestamps, soft delete, version), repository base class, transaction helper, migration runner |
| ✗ | **Health & readiness** | `/health/live`, `/health/ready`, `/health/startup`; every connection module registers an indicator; readiness gates traffic, liveness never depends on downstreams |
| ✗ | **Security** | helmet, CORS policy from config, body size limits, `@nestjs/throttler` rate limiting with Redis store |
| ✗ | **AuthN/AuthZ** | JWT access/refresh, `@Public()` / `@Roles()` / `@Permissions()` decorators, global auth guard (deny-by-default), token revocation via Redis, service-to-service auth |
| ✅ | **API docs** | OpenAPI from Zod DTOs, Scalar UI, URI versioning |
| ✗ | **API conventions** | Cursor + offset pagination DTOs, sort/filter grammar, standard list envelope, `Idempotency-Key` middleware for unsafe methods |
| ✗ | **Scheduling** | `@nestjs/schedule` wrapper with distributed lock (safe under >1 replica), per-job timeout, run history, manual trigger endpoint |
| ✗ | **Feature flags** | Simple provider interface (config-backed default) so product code never branches on env directly |
| ✗ | **Testing kit** | `createTestApp()` helper, module override builders, fake clock, in-memory/testcontainer fixtures for Redis/Mongo/Pulsar, contract-test helpers |

### 3.5 Target repository tree

```
apps/
  api/            HTTP surface
  worker/         Pulsar consumers            ← currently a hello-world
  cron/           Scheduled jobs              ← currently a hello-world
libs/
  framework/      L0 — see §3.4
  platform/       L1 — bootstrap, connections, global providers, health registry  (NEW)
  application/    L2 — product only
    modules/          feature modules
    integrations/     outbound systems, one folder per system
    persistence/      schemas, repositories, migrations
docs/
  architecture.md      this file
  adr/                 numbered decision records                                   (NEW)
  runbook.md           ports, envs, local bring-up, on-call basics                 (NEW)
tools/
  generators/          `pnpm gen:module`, `pnpm gen:integration`, `pnpm gen:app`   (NEW)
.github/workflows/     lint, typecheck, test, build, image publish                 (NEW)
docker/
  Dockerfile           multi-stage, per-app target                                 (NEW)
  compose.yaml         redis, mongo, pulsar, clickhouse, otel-collector            (NEW)
.env.example                                                                        (NEW)
CLAUDE.md / CONTRIBUTING.md                                                         (NEW)
```

---

## 4. Conventions

These are the rules a generated module must follow; the generators in
`tools/generators` should emit exactly this shape.

**Module layout.** One directory per bounded concern, with `index.ts` as the only
public surface:

```
modules/<feature>/
  <feature>.module.ts        wiring only
  <feature>.service.ts       orchestration; no transport types
  <feature>.repository.ts    persistence access
  dto/                       Zod schemas + createZodDto classes
  errors.ts                  feature-specific DomainError subclasses
  index.ts                   exports module + public types only
```

**Integrations.** One folder per external system, never per call:
`providers/` (connection + client), `schemas/` (their contract), and a service per
capability. `cpms-pcr-reader` already models this well — make it the documented
template and delete the empty stub files that currently imply structure that
does not exist.

**Injection tokens.** `Symbol('<SCOPE>_<NAME>')` where scope is unique across the
process. Today `apps/api/src/config` and `libs/application/src/config` both create
`Symbol('ENV_TOKEN')`; distinct symbols, identical descriptions, confusing logs.
Adopt `Symbol('API_ENV')`, `Symbol('APP_ENV')`, `Symbol('APP_SECRET')`.

**Config.** Shared infra config in `libs/application/config` (soon `platform`);
per-app config in `apps/<app>/config`; one Zod schema per token; secrets never
logged. Every variable also appears in `.env.example` with a comment.

**Errors.** Throw `DomainError` subclasses from services. Controllers never build
error responses. The global filter is the only place HTTP status is chosen.

**Naming.** kebab-case files with a role suffix (`.service.ts`, `.reader.ts`,
`.controller.ts`, `.module.ts`); PascalCase classes matching the file.

**Tests.** `*.spec.ts` next to source (unit), `apps/<app>/test/*.e2e-spec.ts` (e2e).
Delete generated placeholder specs rather than leaving `should be defined` as
coverage.

---

## 5. Gap register

Severity: **S1** breaks correctness or safety in production · **S2** blocks the
repo from serving as a base · **S3** quality and ergonomics.

### 5.1 S1 — correctness and safety defects in existing code

| ID | Finding | Location | Fix |
|---|---|---|---|
| G-01 | **Messages are acked even when handling fails.** `receive()` calls `handleMessage(...)` without awaiting, attaches a `.catch` that only logs, then acks unconditionally. Any handler failure silently drops the message. | `libs/framework/src/pulsar/pulsar-consumer.service.ts` | Await the handler; ack only on success; on failure `negativeAcknowledge` and rely on a configured DLQ policy |
| G-02 | **No DLQ / retry policy.** `ConsumerConfig` is passed through raw, so nothing forces `deadLetterPolicy`, redelivery delay, or max redeliveries. | same | Require a DLQ policy in the consumer options type; default `maxRedeliverCount` |
| G-03 | **Busy-loop on receive error.** The `while (this.running)` loop catches and immediately retries with no backoff — a broker outage becomes a hot spin logging at full rate. | same | Exponential backoff with jitter and a cap |
| G-04 | **Secrets are logged.** `SecretsModule` does `logger.debug({ secret }, ...)`, and production pino level is `debug`. Vault contents reach stdout. | `libs/framework/src/secret/secret.module.ts`, `libs/framework/src/logger/pino-logger.config.ts` | Log key names only; add secret paths to pino `redact`; set prod level from config with `info` default |
| G-05 | **Idempotency reserve is not atomic.** `setnx` then `expire` in two commands — a crash between them leaves a permanent key that blocks the identifier forever. | `libs/framework/src/utils/idempotency.service.ts` | Single `SET key val NX PX ttl`. Also `markProcessed(id, ttl)` ignores its `ttl` argument |
| G-06 | **No graceful shutdown.** `enableShutdownHooks()` is never called, so `OnModuleDestroy` on Pulsar producers/consumers and DB clients does not run on SIGTERM; in-flight work and unacked messages are lost on every deploy. | `apps/*/src/main.ts` | Enable shutdown hooks; add a drain sequence: stop consuming → finish in-flight → close producers → close connections, with a timeout |
| G-07 | **`bootstrap()` promises are unhandled.** `app.listen(...).then(...)` in api and bare `bootstrap()` calls elsewhere mean a startup failure exits with a rejected-promise warning rather than a non-zero exit and a log line. | `apps/*/src/main.ts` | `await`, `try/catch`, log fatal, `process.exit(1)` |

### 5.2 S1 — observability wiring

| ID | Finding | Location | Fix |
|---|---|---|---|
| G-08 | **OTel starts too late.** `otelSdk.start()` runs *after* `NestFactory.create()`. Auto-instrumentation patches modules at require time, so http/mongoose/ioredis loaded during module construction are never instrumented. | `apps/api/src/main.ts` | Start the SDK in a `--require`d preload file or as the first import of `main.ts`, before any Nest import |
| G-09 | **Duplicate, mis-targeted span exporter.** The SDK is given both `traceExporter` (configured URL) and `spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter())` — a second exporter with no URL, defaulting to localhost. Spans are exported twice, one path to nowhere. | `libs/framework/src/trace/index.ts` | Keep one: a `BatchSpanProcessor` wrapping the configured exporter |
| G-10 | **Tracing config is read at import time** via a module-level `getOtelConfig()`, so env must already be loaded, the service name cannot come from Vault, and the module cannot be reused per-app. | `libs/framework/src/trace/config.ts` | `createOtelSdk(config)` factory; service name and version injected by `bootstrap()` |
| G-11 | **Service name default is a product name** (`risk-event`), so a fork silently reports under the wrong service. | same | No default — fail fast if unset |
| G-12 | `@snsoft/nestjs-otel` is a dependency but unused; no metrics are emitted despite a metric exporter being configured. | `package.json` | Either wire an app-metrics facade (RED metrics per route, consumer lag, job duration) or drop the dep |

### 5.3 S2 — missing capabilities that block base-repo status

| ID | Gap | Why it blocks |
|---|---|---|
| G-13 | **No global exception filter.** `ProblemDetails` exists only as a Swagger type; actual responses are Nest defaults, so the documented error contract is fiction. | Every service would hand-roll error shape |
| G-14 | **No health/readiness endpoints.** Kubernetes cannot gate traffic; rolling deploys route to unready pods. `isConnected()` exists on Pulsar/Redis but is unexposed. | Undeployable to any orchestrator without per-project work |
| G-15 | **No authentication or authorisation.** `AuthController` is four empty stubs; no guard, no JWT, no deny-by-default. | Any API forked from here starts fully open |
| G-16 | **No security middleware** — no helmet, CORS, rate limiting, or body size limit. | Baseline hardening re-litigated per project |
| G-17 | **No outbound HTTP client abstraction.** `integrations/` contains five empty `.ts` files for services (`fpms-*`, `bi-service`, `cpms-service`, `pms-transaction-reader`) — the pattern is asserted but not implemented, and there is no retry/timeout/breaker/propagation story. | Integration-heavy services are the main use case |
| G-18 | **`apps/worker` and `apps/cron` are unmodified scaffolds** — hello-world controllers, no `ApplicationModule` import, no consumers, no jobs, and both default to port 3000 so they cannot run side by side. `@nestjs/schedule` is installed and unused. | Two of the three archetypes the base promises don't exist |
| G-19 | **No distributed job locking.** A cron app scaled past one replica double-runs every job. | Correctness trap in the archetype most likely to be copied |
| G-20 | **No request context propagation.** No correlation ID beyond the trace mixin; nothing to carry caller/tenant into logs, downstream calls, and produced messages. | Debuggability across services |
| G-21 | **No persistence conventions.** Mongoose is connected but there is no base schema, repository base, transaction helper, or migration runner. | Every service invents its own |
| G-22 | **No container or compose.** No `Dockerfile`, `.dockerignore`, or local dependency stack. | Cannot run or ship the base |
| G-23 | **No CI.** No workflow for lint / typecheck / test / build, no dependency-boundary check, no image publish. | Layer rules in §3.2 are unenforceable |
| G-24 | **No `.env.example`.** `.env*` is gitignored and no template is committed, so required variables are discoverable only by reading Zod schemas across three files. | Onboarding friction on every fork |

### 5.4 S2 — build, test, and type-safety defects

| ID | Finding | Location | Fix |
|---|---|---|---|
| G-25 | **Jest path aliases don't match tsconfig.** `moduleNameMapper` maps `^application/application` and `^framework/framework`, but the real aliases are `@application`, `@framework`, `@integrations`, `@package`. Any test importing framework code fails to resolve. | `package.json` (jest block) | Generate mappings from tsconfig (`pathsToModuleNameMapper`) |
| G-26 | **`pnpm test:e2e` points at a non-existent file** (`apps/api/test/jest-e2e.json`); api has no `test/` directory, while worker and cron have e2e specs that assert `Hello World!`. | `package.json` | Per-app e2e config + a root `test:e2e` that runs all |
| G-27 | **TypeScript is not strict.** `strict` unset, `noImplicitAny: false`, `strictBindCallApply: false`, and ESLint disables `no-explicit-any` while downgrading `no-floating-promises` to a warning — the exact rule that would have caught G-07. | `tsconfig.json`, `eslint.config.mjs` | `strict: true`, `noUncheckedIndexedAccess`, `no-floating-promises` as error; ratchet per package if needed |
| G-28 | **`sourceType: 'commonjs'`** in the ESLint config while tsconfig targets `nodenext` ESM resolution — inconsistent module assumptions. | `eslint.config.mjs` | Align to the actual emit |
| G-29 | **No coverage thresholds**, and placeholder specs (`should be defined`, `Hello World!`) inflate whatever coverage is measured. | `package.json` | Thresholds on `libs/framework` first; delete placeholders |
| G-30 | **No engine constraint** although `EnvSecretProvider` calls `process.loadEnvFile`, which requires Node ≥ 20.12. A fork on Node 18 fails at runtime, not install. | `package.json` | `engines.node`, `.nvmrc`, `packageManager` field |
| G-31 | **`callerMixin` parses webpack paths and `process.argv[1]`** to guess the source file — breaks under `--tsc` builds, ts-node, and tests. | `libs/framework/src/logger/mixins/caller.mixin.ts` | Guard it, or drop it in favour of source maps |
| G-32 | **`framework` imports `@package`** for the version string, coupling L0 to the consuming app's `package.json`. | `logger/mixins/version.mixin.ts`, `apps/api/src/main.ts` | Inject `serviceVersion` through bootstrap options |

### 5.5 S3 — hygiene

| ID | Finding |
|---|---|
| G-33 | Directory typo: `libs/application/src/connnections` (three n's). |
| G-34 | Empty placeholder files across `integrations/` (`bi-service`, `cpms-service`, `fpms-*`, `pms-transaction-reader`) — delete or implement. |
| G-35 | `libs/application/src/application.service.ts` is lorem-ipsum scaffolding still exported from the lib's public index. |
| G-36 | `PcrReader.getGameStats` computes `lowestGgrGamesPlayerGgr` and returns nothing; also builds a raw SQL `IN` from `[gameName, providerName]` while the outer query groups by `providerId` — likely a real query bug. |
| G-37 | `SecretProvider` interface imports `ZodType` and `z` without using them; `IdempotencyService` keeps both `options` and destructured copies. |
| G-38 | README is the stock NestJS readme; no CONTRIBUTING, no CLAUDE.md, no ADR log. |
| G-39 | `package.json` metadata is unset (`name: "api"`, empty description/author, no repository). |
| G-40 | Connection modules are unconditionally `global: true`; should be an option. |
| G-41 | Swagger title/description hardcoded per-product in `main.ts` rather than sourced from bootstrap options. |
| G-42 | No `dev:cron`/`dev:worker` parity (`dev:cron` lacks `--tsc`, both debug ports overlap at 9229), no `start:dev` aggregate, no `typecheck` script. |

---

## 6. Roadmap

Ordered so that each phase leaves the repo in a shippable state.

**Phase 1 — Make it correct (S1).**
G-01 → G-12. Fix message acking, DLQ, backoff, secret logging, idempotency atomicity,
shutdown, OTel ordering and duplicate exporter. No new structure, only defect repair.
*Exit test:* kill a pod mid-consume and lose nothing; a failing handler redelivers then
lands in DLQ; no secret appears in logs; traces show http/mongo/redis spans.

**Phase 2 — Make it safe and observable (G-13 … G-16, G-20).**
Error hierarchy + RFC-9457 filter, health/readiness/startup with indicators registered
by each connection module, helmet/CORS/throttler, request context.
*Exit test:* a thrown `NotFoundError` renders as a documented problem-details body;
`/health/ready` fails when Redis is down and `/health/live` does not.

**Phase 3 — Make it a base (G-17 … G-19, G-21, G-24, plus §3.1 `libs/platform`).**
Extract `libs/platform` and the shared `bootstrap()`; build the HTTP client; turn
`apps/worker` into a real consumer archetype and `apps/cron` into a locked-scheduler
archetype; persistence conventions; `.env.example`.
*Exit test:* create a new service by deleting `libs/application/*` and one app — it
still boots, traces, and passes health.

**Phase 4 — Make it deliverable (G-22, G-23, G-25 … G-32).**
Dockerfile + compose, CI with lint/typecheck/test/build and dependency-boundary
enforcement, strict TypeScript, fixed jest aliases and e2e configs, coverage
thresholds, engines.
*Exit test:* CI red on a cross-layer import; `docker compose up` gives a working local
stack.

**Phase 5 — Make it fast to start (G-33 … G-42, generators, docs).**
Hygiene sweep, `tools/generators` for module/integration/app, ADR log, runbook,
CLAUDE.md, README rewrite.
*Exit test:* `pnpm gen:module billing` produces a module matching §4 with a passing test.

---

## 7. Review checklist

Questions this spec deliberately leaves open for the team:

1. **Distribution model** (§1.3) — confirm hybrid, or commit to publishing now.
2. **Auth scope** — does the base ship a full JWT implementation, or only the guard
   and decorator contracts with a per-project provider?
3. **Persistence stance** — is Mongo the assumed default, or must the base be
   datastore-agnostic (which changes G-21 substantially)?
4. **Multi-tenancy** — in scope for request context and cache key strategy, or not?
5. **Which archetypes are first-class** — api / worker / cron today; do we also need
   a gRPC or GraphQL surface, and does that change the transport abstraction?
