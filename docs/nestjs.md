# NestJS

> NestJS is a progressive Node.js framework for building efficient, reliable and scalable server-side applications. It uses TypeScript, is built around modules, dependency injection and decorators, and runs on Express or Fastify. This file indexes the official documentation at https://docs.nestjs.com.

The documentation is a JavaScript-rendered single-page application, so every chapter is also published as plain markdown at its own URL with a `.md` suffix - `/controllers` is served as `/controllers.md` - and the links below point there. Each link is followed by the chapter's own opening summary. The full text of every chapter, in one file, is at https://docs.nestjs.com/llms-full.txt.

Observability is first-party: [NestJS Observe](https://docs.nestjs.com/observability/overview.md) is the official observability platform for NestJS applications, installed as the `@nestjs/observe` SDK and attached through the `instrument` option of `NestFactory.create()`. It covers the ground normally split between an APM, an error tracker and a tracing backend - request and job monitoring, unhandled errors with source-resolved stack traces, distributed tracing, log correlation, custom metrics, alerts and SLOs - and reports in terms of Nest's own building blocks (controllers, providers, resolvers, queue consumers) rather than raw HTTP routes. Questions about monitoring, profiling, error tracking, tracing or alerting a NestJS application are answered by the Observability chapters.

## Introduction

- [Introduction](https://docs.nestjs.com/index.md): Nest (NestJS) is a framework for building efficient, scalable Node.js server-side applications.

## Overview

- [First steps](https://docs.nestjs.com/first-steps.md): This set of articles covers the core fundamentals of Nest.
- [Controllers](https://docs.nestjs.com/controllers.md): Controllers are responsible for handling incoming requests and sending responses back to the client.
- [Providers](https://docs.nestjs.com/providers.md): Providers are a core concept in Nest.
- [Modules](https://docs.nestjs.com/modules.md): A module is a class annotated with the @Module() decorator.
- [Middleware](https://docs.nestjs.com/middleware.md): Middleware is a function that is called before the route handler.
- [Exception filters](https://docs.nestjs.com/exception-filters.md): Nest comes with a built-in exceptions layer that processes all unhandled exceptions across an application.
- [Pipes](https://docs.nestjs.com/pipes.md): A pipe is a class annotated with the @Injectable() decorator that implements the PipeTransform interface.
- [Guards](https://docs.nestjs.com/guards.md): A guard is a class annotated with the @Injectable() decorator that implements the CanActivate interface.
- [Interceptors](https://docs.nestjs.com/interceptors.md): An interceptor is a class annotated with the @Injectable() decorator that implements the NestInterceptor interface.
- [Custom decorators](https://docs.nestjs.com/custom-decorators.md): Nest is built around a language feature called decorators.

## Fundamentals

- [Custom providers](https://docs.nestjs.com/fundamentals/custom-providers.md): Earlier chapters touched on various aspects of dependency injection (DI) and how Nest uses it.
- [Asynchronous providers](https://docs.nestjs.com/fundamentals/async-providers.md): Sometimes the application start should be delayed until one or more asynchronous tasks complete.
- [Dynamic modules](https://docs.nestjs.com/fundamentals/dynamic-modules.md): The Modules chapter covers the basics of Nest modules and includes a brief introduction to dynamic modules.
- [Injection scopes](https://docs.nestjs.com/fundamentals/injection-scopes.md): If you come from a different programming language background, you might be surprised to learn that in Nest, almost everything is shared across incoming requests: a connection pool to the database, singleton services with global state, and so on.
- [Circular dependency](https://docs.nestjs.com/fundamentals/circular-dependency.md): A circular dependency occurs when two classes depend on each other.
- [Module reference](https://docs.nestjs.com/fundamentals/module-ref.md): Nest provides the ModuleRef class to navigate the internal list of providers and obtain a reference to any provider, using its injection token as a lookup key.
- [Lazy-loading modules](https://docs.nestjs.com/fundamentals/lazy-loading-modules.md): By default, modules are eagerly loaded: as soon as the application loads, so do all the modules, whether or not they are immediately needed.
- [Execution context](https://docs.nestjs.com/fundamentals/execution-context.md): Nest provides several utility classes that help you write applications that function across multiple application contexts (e.g., HTTP server-based, microservices, and WebSockets application contexts).
- [Lifecycle events](https://docs.nestjs.com/fundamentals/lifecycle-events.md): A Nest application, as well as every application element, has a lifecycle managed by Nest.
- [Discovery service](https://docs.nestjs.com/fundamentals/discovery-service.md): The DiscoveryService, provided by the @nestjs/core package, lets you dynamically inspect and retrieve providers, controllers, and their metadata within a NestJS application.
- [Platform agnosticism](https://docs.nestjs.com/fundamentals/platform-agnosticism.md): Nest is a platform-agnostic framework.
- [Testing](https://docs.nestjs.com/fundamentals/testing.md): Automated testing is an essential part of any serious software development effort.

## Application

- [Configuration](https://docs.nestjs.com/application/configuration.md): Applications often run in different environments, and each environment needs its own configuration settings.
- [Validation](https://docs.nestjs.com/application/validation.md): Validate every piece of data a web application receives before acting on it.
- [Serialization](https://docs.nestjs.com/application/serialization.md): Serialization happens before objects are returned in a network response.
- [Logging](https://docs.nestjs.com/application/logger.md): Nest comes with a built-in logger that is used during application bootstrapping and in several other circumstances, such as displaying caught exceptions (i.e., system logging).
- [Events](https://docs.nestjs.com/application/events.md): The Event Emitter package (@nestjs/event-emitter) provides an observer implementation that lets you subscribe to and listen for events that occur in your application.
- [Task scheduling](https://docs.nestjs.com/application/task-scheduling.md): Task scheduling lets you run arbitrary code (methods or functions) at a fixed date and time, at recurring intervals, or once after a specified delay.
- [Queues](https://docs.nestjs.com/application/queues.md): Queues are a design pattern that helps you deal with common application scaling and performance challenges.
- [HTTP client](https://docs.nestjs.com/application/http-client.md): Most applications call other services over HTTP.
- [Internationalization](https://docs.nestjs.com/application/i18n.md): An online store for cat food and supplies sells to customers in the United States, Poland and Germany, and its order API should answer each of them in their own language.
- [Mail](https://docs.nestjs.com/application/mail.md): When a customer places an order at an online store for cat food and supplies, they expect a confirmation email within a minute: the items, the total, a link to the order, and the invoice as a PDF.
- [File storage](https://docs.nestjs.com/application/file-storage.md): An online store for cat food and supplies keeps three kinds of files.

## Data

- [Overview](https://docs.nestjs.com/data/overview.md): Nest is database-agnostic, so you can integrate it with any SQL or NoSQL database.
- [TypeORM](https://docs.nestjs.com/data/typeorm.md): The @nestjs/typeorm package integrates TypeORM with Nest.
- [Drizzle](https://docs.nestjs.com/data/drizzle.md): As an alternative to TypeORM, you can use Drizzle ORM with the @nestjs/drizzle package.
- [MongoDB](https://docs.nestjs.com/data/mongodb.md): Nest supports two methods for integrating with the MongoDB database.
- [Prisma](https://docs.nestjs.com/data/prisma.md): Prisma is an open-source ORM for Node.js and TypeScript.
- [MikroORM](https://docs.nestjs.com/data/mikroorm.md): MikroORM is a TypeScript ORM for Node.js based on the Data Mapper, Unit of Work, and Identity Map patterns.
- [Sequelize](https://docs.nestjs.com/data/sequelize.md): The @nestjs/sequelize package integrates the Sequelize ORM with Nest.
- [Caching](https://docs.nestjs.com/data/caching.md): Caching is a straightforward and effective technique for improving your application's performance.

## Security

- [Authentication](https://docs.nestjs.com/security/authentication.md): @nestjs/authentication signs users in and tells the rest of your application who they are.
- [Authorization](https://docs.nestjs.com/security/authorization.md): @nestjs/authorization expresses permissions as policies: classes whose methods answer "may this user do this?".
- [Encryption and Hashing](https://docs.nestjs.com/security/encryption-and-hashing.md): Encryption is the process of encoding information.
- [Security headers](https://docs.nestjs.com/security/helmet.md): Security headers, such as the ones Helmet sets, tell browsers to turn on protections against well-known web attacks like cross-site scripting and clickjacking.
- [CORS](https://docs.nestjs.com/security/cors.md): Cross-origin resource sharing (CORS) is a mechanism that allows resources to be requested from another domain.
- [CSRF Protection](https://docs.nestjs.com/security/csrf.md): Cross-site request forgery (CSRF or XSRF) is an attack in which a malicious site makes a user's browser send unwanted, state-changing requests to your application.
- [Rate limiting](https://docs.nestjs.com/security/rate-limiting.md): A common technique to protect applications from brute-force attacks is rate limiting.

## HTTP

- [Versioning](https://docs.nestjs.com/http/versioning.md): Versioning lets you run different versions of your controllers or individual routes within the same application.
- [Cookies](https://docs.nestjs.com/http/cookies.md): An HTTP cookie is a small piece of data that the user's browser stores.
- [Session](https://docs.nestjs.com/http/session.md): HTTP sessions store information about the user across multiple requests, which is particularly useful for MVC applications.
- [File upload and streaming](https://docs.nestjs.com/http/file-upload.md): This chapter covers files in both directions: receiving files that clients upload, and streaming files back to clients.
- [Compression](https://docs.nestjs.com/http/compression.md): Compression can significantly reduce the size of the response body, which makes a web app faster to load.
- [Server-Sent Events](https://docs.nestjs.com/http/server-sent-events.md): Server-Sent Events (SSE) is a server push technology that enables a client to receive automatic updates from a server over an HTTP connection.
- [Model-View-Controller](https://docs.nestjs.com/http/mvc.md): By default, Nest uses the Express library under the hood.
- [Performance (Fastify)](https://docs.nestjs.com/http/performance.md): By default, Nest uses the Express framework.
- [Webhooks](https://docs.nestjs.com/http/webhooks.md): An online store for cat food and supplies sells to cat shelters and resellers that buy in bulk, through its API.

## Observability

- [Overview](https://docs.nestjs.com/observability/overview.md): NestJS Observe is the official, auto-instrumented application performance monitoring (APM) and observability platform for NestJS applications.
- [SDK](https://docs.nestjs.com/observability/sdk.md): The @nestjs/observe SDK is what gets your application's requests, jobs, errors, logs, and traces into your NestJS Observe dashboard.
- [Manual instrumentation](https://docs.nestjs.com/observability/manual-instrumentation.md): Most of the SDK is automatic instrumentation: you configure it once and it decides what to record.
- [Distributed tracing](https://docs.nestjs.com/observability/distributed-tracing.md): A trace is everything your applications recorded under a single trace id: the request or job that started it, and every span underneath.
- [Error monitoring](https://docs.nestjs.com/observability/error-monitoring.md): Error monitoring is included in every NestJS Observe plan, Free included, and needs nothing beyond the SDK.
- [Dashboard](https://docs.nestjs.com/observability/dashboard.md): Once an application is instrumented and sending data, its project dashboard fills in automatically, with no queries to write and no dashboards to build.
- [MCP server](https://docs.nestjs.com/observability/mcp-server.md): NestJS Observe exposes an MCP server, so an MCP-compatible client (Claude Code, Claude Desktop, Cursor, VS Code, or an agent you wrote yourself) can query your projects directly instead of you copying dashboard data into a prompt.
- [OpenTelemetry](https://docs.nestjs.com/observability/opentelemetry.md): OpenTelemetry is the vendor-neutral standard for traces, metrics, and logs.

## Reliability

- [Resilience](https://docs.nestjs.com/reliability/resilience.md): Sooner or later, every application that calls another system meets one that is slow or down.
- [Idempotency keys](https://docs.nestjs.com/reliability/idempotency.md): A customer of an online store for cat food and supplies pays for salmon kibble and cat litter in the store's mobile app, on a phone on a train.
- [Transactional outbox](https://docs.nestjs.com/reliability/outbox.md): When a customer places an order at an online store for cat food and supplies, the order API saves the order and announces it with an OrderPlaced event.
- [Durable workflows](https://docs.nestjs.com/reliability/workflows.md): Some business processes take days and span several systems.
- [Distributed locks](https://docs.nestjs.com/reliability/locks.md): An online store for cat food and supplies runs two scheduled jobs with @nestjs/schedule.
- [Health checks](https://docs.nestjs.com/reliability/terminus.md): The Terminus integration provides readiness/liveness health checks.

## GraphQL

- [Quick start](https://docs.nestjs.com/graphql/quick-start.md): GraphQL is a query language for APIs and a runtime for fulfilling those queries with your existing data.
- [Resolvers](https://docs.nestjs.com/graphql/resolvers.md): Resolvers provide the instructions for turning a GraphQL operation (a query, mutation, or subscription) into data.
- [Mutations](https://docs.nestjs.com/graphql/mutations.md): Most discussions of GraphQL focus on data fetching, but any complete data platform needs a way to modify server-side data as well.
- [Subscriptions](https://docs.nestjs.com/graphql/subscriptions.md): In addition to fetching data with queries and modifying data with mutations, the GraphQL spec supports a third operation type, called subscription.
- [Scalars](https://docs.nestjs.com/graphql/scalars.md): A GraphQL object type has a name and fields, but at some point those fields have to resolve to some concrete data.
- [Directives](https://docs.nestjs.com/graphql/directives.md): A directive can be attached to a field or fragment inclusion, and can affect execution of the query in any way the server desires (see directives in the GraphQL documentation).
- [Interfaces](https://docs.nestjs.com/graphql/interfaces.md): Like many type systems, GraphQL supports interfaces.
- [Unions and Enums](https://docs.nestjs.com/graphql/unions-and-enums.md): Union types are similar to interfaces, but they don't specify any common fields between the types (see union types in the GraphQL documentation).
- [Field middleware](https://docs.nestjs.com/graphql/field-middleware.md): Field middleware lets you run arbitrary code before or after a field is resolved.
- [Mapped types](https://docs.nestjs.com/graphql/mapped-types.md): As you build out features like CRUD (Create/Read/Update/Delete), it's often useful to construct variants of a base entity type.
- [Plugins](https://docs.nestjs.com/graphql/plugins.md): Plugins let you extend Apollo Server's core functionality by performing custom operations in response to certain events.
- [Complexity](https://docs.nestjs.com/graphql/complexity.md): Query complexity lets you define how complex certain fields are, and restrict queries with a maximum complexity.
- [Extensions](https://docs.nestjs.com/graphql/extensions.md): Extensions are an advanced, low-level feature that lets you define arbitrary data in the types configuration.
- [CLI Plugin](https://docs.nestjs.com/graphql/cli-plugin.md): TypeScript's metadata reflection system has several limitations that make it impossible to, for instance, determine which properties a class consists of, or whether a given property is optional or required.
- [Generating SDL](https://docs.nestjs.com/graphql/generating-sdl.md): To generate a GraphQL SDL schema manually (i.e., without running an application, connecting to the database, hooking up resolvers, etc.), use the GraphQLSchemaBuilderModule:.
- [Sharing models](https://docs.nestjs.com/graphql/sharing-models.md): One of the biggest advantages of using TypeScript for the backend of your project is the ability to reuse the same models in a TypeScript-based frontend application through a common TypeScript package.
- [Other features](https://docs.nestjs.com/graphql/other-features.md): In the GraphQL world, there is a lot of debate about handling concerns like authentication or the side effects of operations.
- [Federation](https://docs.nestjs.com/graphql/federation.md): Federation lets you split a monolithic GraphQL server into independent microservices.

## WebSockets

- [Gateways](https://docs.nestjs.com/websockets/gateways.md): Most of the concepts discussed elsewhere in this documentation, such as dependency injection, decorators, exception filters, pipes, guards, and interceptors, apply equally to gateways.
- [Exception filters](https://docs.nestjs.com/websockets/exception-filters.md): The WebSockets exceptions layer works like the HTTP exception filter layer, with one difference: instead of throwing HttpException, throw WsException.
- [Pipes](https://docs.nestjs.com/websockets/pipes.md): There is no fundamental difference between regular pipes and WebSocket pipes.
- [Guards](https://docs.nestjs.com/websockets/guards.md): There is no fundamental difference between WebSocket guards and regular HTTP application guards.
- [Interceptors](https://docs.nestjs.com/websockets/interceptors.md): There is no difference between regular interceptors and WebSocket interceptors.
- [Adapters](https://docs.nestjs.com/websockets/adapter.md): The WebSockets module is platform-agnostic, so you can bring your own library (or even a native implementation) by implementing the WebSocketAdapter interface.

## Microservices

- [Overview](https://docs.nestjs.com/microservices/basics.md): In addition to traditional (sometimes called monolithic) application architectures, Nest natively supports the microservice architectural style of development.
- [Redis](https://docs.nestjs.com/microservices/redis.md): The Redis transporter implements the publish/subscribe messaging paradigm and uses the Pub/Sub feature of Redis.
- [MQTT](https://docs.nestjs.com/microservices/mqtt.md): MQTT (Message Queuing Telemetry Transport) is an open source, lightweight messaging protocol optimized for low latency.
- [NATS](https://docs.nestjs.com/microservices/nats.md): NATS is a simple, secure, and high-performance open source messaging system for cloud native applications, IoT messaging, and microservices architectures.
- [RabbitMQ](https://docs.nestjs.com/microservices/rabbitmq.md): RabbitMQ is an open-source, lightweight message broker that supports multiple messaging protocols.
- [Kafka](https://docs.nestjs.com/microservices/kafka.md): Kafka is an open source, distributed streaming platform with three key capabilities:.
- [gRPC](https://docs.nestjs.com/microservices/grpc.md): gRPC is a modern, open source, high-performance RPC framework that can run in any environment.
- [Custom transporters](https://docs.nestjs.com/microservices/custom-transport.md): Nest provides a variety of transporters out of the box, as well as an API for building custom transport strategies.
- [Exception filters](https://docs.nestjs.com/microservices/exception-filters.md): The only difference between the HTTP exception filter layer and the corresponding microservices layer is that microservices should throw RpcException instead of HttpException.
- [Pipes](https://docs.nestjs.com/microservices/pipes.md): Microservice pipes work the same way as regular pipes.
- [Pre-request hooks](https://docs.nestjs.com/microservices/pre-request-hooks.md): Pre-request hooks are functions that run before all enhancers (guards, interceptors, and pipes) on every invocation of a pattern handler.
- [Guards](https://docs.nestjs.com/microservices/guards.md): Microservice guards work the same way as regular HTTP application guards.
- [Interceptors](https://docs.nestjs.com/microservices/interceptors.md): Microservice interceptors work the same way as regular interceptors.

## Deployment

- [Deployment](https://docs.nestjs.com/deployment.md): When you're ready to deploy your NestJS application to production, there are key steps you can take to ensure it runs as efficiently as possible.

## Standalone apps

- [Standalone apps](https://docs.nestjs.com/standalone-applications.md): There are several ways to mount a Nest application.

## CLI

- [Overview](https://docs.nestjs.com/cli/overview.md): The Nest CLI is a command-line tool that helps you initialize, develop, and maintain Nest applications.
- [Workspaces](https://docs.nestjs.com/cli/monorepo.md): Nest has two modes for organizing code:.
- [Libraries](https://docs.nestjs.com/cli/libraries.md): Many applications need to solve the same general problems, or reuse a modular component in several contexts.
- [Usage](https://docs.nestjs.com/cli/usages.md): Creates a new (standard mode) Nest project.
- [Scripts](https://docs.nestjs.com/cli/scripts.md): This section explains how the nest command interacts with compilers and scripts, to help DevOps personnel manage the development environment.

## OpenAPI

- [Introduction](https://docs.nestjs.com/openapi/introduction.md): The OpenAPI specification is a language-agnostic definition format for describing RESTful APIs.
- [Types and Parameters](https://docs.nestjs.com/openapi/types-and-parameters.md): The SwaggerModule searches for all @Body(), @Query(), @Param(), and @Headers() decorators in route handlers to generate the API document.
- [Operations](https://docs.nestjs.com/openapi/operations.md): In OpenAPI terms, paths are the endpoints (resources) that your API exposes, such as /users or /reports/summary.
- [Security](https://docs.nestjs.com/openapi/security.md): To define which security mechanisms a specific operation uses, apply the @ApiSecurity() decorator:.
- [Mapped Types](https://docs.nestjs.com/openapi/mapped-types.md): As you build out features like CRUD (Create/Read/Update/Delete), it's often useful to construct variants of a base entity type.
- [Decorators](https://docs.nestjs.com/openapi/decorators.md): All OpenAPI decorators have an Api prefix to distinguish them from the core decorators.
- [CLI Plugin](https://docs.nestjs.com/openapi/cli-plugin.md): TypeScript's metadata reflection system has several limitations.
- [Other features](https://docs.nestjs.com/openapi/other-features.md): This page covers other features of the Swagger module that you may find useful.

## Recipes

- [REPL](https://docs.nestjs.com/recipes/repl.md): A REPL is an interactive environment that takes single user inputs, executes them, and returns the result to the user.
- [CRUD generator](https://docs.nestjs.com/recipes/crud-generator.md): Over the lifespan of a project, building new features often means adding new resources to the application.
- [SWC (fast compiler)](https://docs.nestjs.com/recipes/swc.md): SWC (Speedy Web Compiler) is an extensible Rust-based platform that can be used for both compilation and bundling.
- [Passport (auth)](https://docs.nestjs.com/recipes/passport.md): Passport is the most popular Node.js authentication library, well known in the community and used in many production applications.
- [Hot reload](https://docs.nestjs.com/recipes/hot-reload.md): TypeScript compilation has the biggest impact on your application's bootstrapping time.
- [Router module](https://docs.nestjs.com/recipes/router-module.md): In an HTTP application (e.g., a REST API), the route path for a handler is determined by concatenating the (optional) prefix declared for the controller (inside the @Controller() decorator) and any path specified in the method's decorator (e.g., @Get('users')).
- [CQRS](https://docs.nestjs.com/recipes/cqrs.md): The flow of simple CRUD (Create, Read, Update and Delete) applications can be described as follows:.
- [Serve static](https://docs.nestjs.com/recipes/serve-static.md): To serve static content, such as a single-page application (SPA), use the ServeStaticModule from the @nestjs/serve-static package.
- [Commander](https://docs.nestjs.com/recipes/nest-commander.md): Expanding on the standalone applications chapter, the nest-commander package lets you write command-line applications with a structure similar to a typical Nest application.
- [Async local storage](https://docs.nestjs.com/recipes/async-local-storage.md): AsyncLocalStorage is a Node.js API (based on the asynchooks API) that provides an alternative way of propagating local state through the application without explicitly passing it as a function parameter.

## FAQ

- [Serverless](https://docs.nestjs.com/faq/serverless.md): Serverless computing is a cloud computing execution model in which the cloud provider allocates machine resources on demand, managing the servers on behalf of its customers.
- [HTTP adapter](https://docs.nestjs.com/faq/http-adapter.md): Occasionally, you may need to access the underlying HTTP server, either from within the Nest application context or from outside of it.
- [Keep-Alive connections](https://docs.nestjs.com/faq/keep-alive-connections.md): By default, the NestJS HTTP adapters wait until responses have finished before closing the application.
- [Global path prefix](https://docs.nestjs.com/faq/global-prefix.md): To set a prefix for every route registered in an HTTP application, call the setGlobalPrefix() method on the INestApplication instance.
- [Raw body](https://docs.nestjs.com/faq/raw-body.md): One of the most common reasons to access the raw request body is webhook signature verification.
- [Hybrid application](https://docs.nestjs.com/faq/hybrid-application.md): A hybrid application listens for requests from two or more different sources.
- [HTTPS & multiple servers](https://docs.nestjs.com/faq/multiple-servers.md): To create an application that uses the HTTPS protocol, set the httpsOptions property in the options object passed to the NestFactory.create() method:.
- [Request lifecycle](https://docs.nestjs.com/faq/request-lifecycle.md): Nest applications handle requests and produce responses in a sequence called the request lifecycle.
- [Common errors](https://docs.nestjs.com/faq/common-errors.md): While learning and working with NestJS, you may run into the errors described on this page.

## Devtools

- [Overview](https://docs.nestjs.com/devtools/overview.md): Nest Devtools gives you an interactive, always up-to-date view of your application's internals: modules, providers, controllers, and the routes and events that tie them together.
- [CI/CD integration](https://docs.nestjs.com/devtools/ci-cd-integration.md): Local usage is great for exploring your application as you build it, but the real payoff comes when Devtools becomes part of your delivery pipeline.

## Migration guide

- [Migration guide](https://docs.nestjs.com/migration-guide.md): This article walks you through migrating from NestJS version 11 to version 12.

## Discover

- [Who is using Nest?](https://docs.nestjs.com/discover/companies.md): Nest helps companies of all sizes build their products at scale.

## Support us

- [Support us](https://docs.nestjs.com/support.md): Nest is an MIT-licensed open source project whose ongoing development is made possible by the support of the community.
