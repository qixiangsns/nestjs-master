# Project and Module Structure

Rules for where code goes and what it may import.

## Project layout

```
apps/<app>/                  # Deployable entrypoints, one Nest app each
libs/application/src/        # Domain code (@application)
├── modules/<module>/        # Domain modules (see "Module layout")
├── integrations/<provider>/ # Third-party API clients
├── connnections/            # Mongo, Redis and Pulsar connection wiring
└── config/                  # Shared env and secret schemas
libs/framework/src/<concern>/ # Technical building blocks with no domain logic (@framework)
docs/                        # Design notes and conventions
```

### What goes where

| Location                         | Contains                                                                                                                                    | Must not                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `apps/<app>/`                    | `main.ts`, the app module, controllers, HTTP request/response DTOs, app-specific env config, and consumers that delegate to module services | Hold business logic, Mongoose models, or provider calls. Move these into a module. |
| `libs/application/modules/`      | One folder per domain (a channel or a shared domain capability)                                                                             | Depend on a specific app                                                           |
| `libs/application/integrations/` | One folder per external provider: a client service plus its types, constants and errors                                                     | Know about modules, routing or persistence. Clients only translate API calls.      |
| `libs/application/connnections/` | Root connection modules configured from application config                                                                                  | Contain domain logic                                                               |
| `libs/application/config/`       | zod schemas for env and secrets shared by every app                                                                                         | Hold app-only settings. Those go in `apps/<app>/`.                                 |
| `libs/framework/<concern>/`      | Reusable infrastructure: drivers, logger, tracing, secrets, OpenAPI helpers, generic utils                                                  | Import `@application` or mention a channel, provider or domain term                |

Test for `framework` vs `application`: if the code would make sense unchanged in an unrelated NestJS project, it
belongs in `framework`. Otherwise it belongs in `application`.

### Apps

- Each app is a thin shell. Controllers validate input, call a module service, and map the result. Consumers
  read from a queue and call a module service.
- Group controllers by channel or resource: `controllers/<resource>/<resource>.controller.ts` with a matching
  `<resource>.dto.ts`.
- An app registers only the modules it uses.
- Every app is registered in `nest-cli.json` and has a `tsconfig.app.json`.

## Import rules

```
apps → @application, @framework
@application/modules/<a> → @application/modules/<b> (index.ts only), integrations, @framework
@application/integrations → @framework
@framework → nothing local
```

- Use path aliases only (`@application/...`, `@framework/...`). Don't use relative paths that cross a lib or app
  boundary.
- Import a module only through its barrel, `@application/modules/<module>`, never a nested path.
- Import framework code by concern folder, `@framework/<concern>`, through its `index.ts`.
- No import cycles between modules. If two modules need each other, move the shared part into a third module

## Module layout

Domain modules live in `libs/application/src/modules/<module>/`. A module is made of role folders. Create only
the folders the module needs, and don't leave empty folders behind.

```
modules/<module>/
├── <module>.module.ts        # Nest module wiring
├── index.ts                  # Public contract: the only import path for other code
├── models/                   # Plain domain types and const enums
├── dtos/                     # zod API request/response schemas (+ index.ts barrel)
├── schemas/                  # Mongoose schemas (+ index.ts exporting MongoSchemaModule)
├── repositories/             # Persistence, the only layer that touches Mongoose models
├── services/                 # Business logic, the module's injectable API
├── ports/                    # Interfaces the module needs from outside (e.g. provider sender)
├── adapters/                 # Port implementations, one subfolder per provider + factory
│   ├── <module>-<port>.factory.ts
│   └── <provider>/
├── caches/                   # In-memory / Redis caches
├── queues/                   # Pulsar topics, payload types and producers
├── signals/                  # Redis pub/sub signal channels, payload types and broadcaster
└── workers/                  # Long-running consumers and their manager/factory
```

A role that needs a new kind of folder should be added to this doc first, so the layout stays the same across
modules.

### Folder rules

| Folder          | Contains                                                                                                                                                     | Must not                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `models/`       | Interfaces, types, `as const` arrays and the union types derived from them                                                                                   | Import Nest, Mongoose, zod or other local files. Models are the bottom layer.   |
| `dtos/`         | zod schemas and `z.infer` types for HTTP contracts. Enum values come from `models/`.                                                                         | Contain logic or Mongoose types                                                 |
| `schemas/`      | `@Schema` classes. `index.ts` exports `MongoSchemaModule` (`MongooseModule.forFeature`).                                                                     | Be exported from the module's `index.ts`. The persistence shape stays internal. |
| `repositories/` | `@InjectModel` queries that map documents to `models/` types (`_id` → `id`)                                                                                  | Return Mongoose documents, or be exported                                       |
| `services/`     | Business logic. Depends on repositories, caches, dispatchers, adapter factories and other modules' services.                                                 | Touch Mongoose models directly                                                  |
| `ports/`        | TypeScript interfaces for a capability the module needs from outside                                                                                         | Contain implementations                                                         |
| `adapters/`     | A `<provider>/` subfolder per provider that implements a port by wrapping an `integrations/` client. A top-level factory picks the adapter by provider code. | Be imported anywhere outside `adapters/`, except through the factory            |
| `caches/`       | Read-through caches, invalidated by signals through `@OnEvent`                                                                                               | Be the source of truth                                                          |
| `queues/`       | `<name>.queues.ts`: topic constants and payload types. `<name>.dispatcher.ts`: the Pulsar producer.                                                          | Export the dispatcher. Only the contract file is public.                        |
| `signals/`      | `<name>.signals.ts`: channel constants and payload types. `<module>-signal.broadcaster.ts`: relays between Redis pub/sub and `EventEmitter2`.                | Export the broadcaster                                                          |
| `workers/`      | Consumer loop classes, a manager that owns them, and an injectable factory that builds the manager                                                           | Be registered as singletons when they hold per-account state                    |

### Dependency direction inside a module

```
controllers (apps/*) → services → repositories → schemas
                              ↘ caches, dispatchers, adapter factory → adapters → ports, integrations
everything → models
```

- Lower layers never import upper ones. For example, repositories don't import services.
- A module reaches another module only through that module's `index.ts` and its exported services.

### Naming

- Files: `<module>-<subject>.<role>.ts`. The role is one of `model`, `dto`, `schema`, `repository`, `service`,
  `port`, `adapter`, `factory`, `cache`, `queues`, `dispatcher`, `signals`, `broadcaster`, `worker`, `manager`.
- Adapters: `<module>-<port>-<provider>.adapter.ts`. Provider client factories: `<module>-<provider>-client.factory.ts`.
- Classes: the PascalCase form of the file name, keeping the role as a suffix (`...Service`, `...Repository`,
  `...Cache`, `...Dispatcher`, `...Factory`). Two roles drop the suffix: schema classes use the entity name,
  and adapters use `<Module><Port><Provider>`.
- Topic and signal constants: `<Module><Subject>Topic` / `<Module><Subject>Signal` objects declared with
  `as const satisfies Record<string, \`<module>.${string}\`>`, so every name carries the module prefix.

### Public contract (`index.ts`)

- **Export:** the Nest module, `models/`, `dtos/`, `services/`, the queue and signal contract files (topics and
  payloads), and the worker manager factory (export the manager with `export type`).
- **Keep internal:** schemas, repositories, ports, adapters, caches, dispatchers, broadcasters and worker classes.
- The Nest module's `exports` list contains only the services and factories that `index.ts` exports.
