Project focus: CRISP - Clear, Robust, Idiomatic, Simple, Performant

NestJs Framework Architecture

- Domain-to-db mapping (how the app translate db code to domain structure vice-versa to streamline logic handling)
- RFC9457 HTTP-API error handling (how server communicates error to the frontend, how the frontend can use the error object to localize, display, and handle the errors)
- Application error handling (how the server throws and handle business logic error/how the server documents the errors)
- Pulsar/Kafka consumption strategy (batch/rate-limited/memory-safe)
- Real Graceful Shutdown (pulsar consumer/cron/api - ensure new job stops, finish processing job)
- Script runner (commander.js) (Eg: seeder script, migration, manual job)
- Third-party API integration handling (types, interface, validation, error mapping, adapter/port design pattern)
- Translation (how the server can support localization when sending notifications/emails)
- Multi-databases setup (MongoDB/Posgres/MySQL) - (Query builder for minimal library locked-in and setup)
- NestJS v12 migration

Supplementary features

- File upload/file management strategy (direct client to S3/upload to temp folder/move to final destination upon confirmation)
- Authentication (access token + refresh token)
- Authorization (role-based access control)
- Time handling (timezone)
- Server liveness/readiness
- Caching pattern (cache stampede, rate limiter)

Requirement revamp

- API Design (ease of use/follow API standard/clear purpose)
- Database Schema Design
- SMS Message Log (support fast insert/support fast filter/full text search/event-based batch inserts)
- Structured and planned SLS logs for reporting
- Service Architecture (service per provider/clear/ease of adjustment)
- Routing strategy (token distribution/round-robin/phone-type based/provider-rate-based)
- Provider health delivery/check/alert/report
- Switchover strategy
- Configuration improvement (ease of use/clear instructions/different sender id for each account)
- Balance Report (send alert to team)
- API considers multiple sources (support cross-service/team/department)
- Infrastructure as a Service (IaaS) no-restart provider config sending capability (config set)
- Viber/Whatsapp/App Push routing might not consider multiple providers
- testcontainers for testing complex worklow and mock dependencies

Mission statement:

- provide messaging functionalities (email/sms/viber/whatsapp/push notifications)
- third-party providers management (rate-limit/integration/balance/delivery rate)
- phone type (decider)
- routing (config disable reroute)

- sdk [supplementary]
- multi-region sending capability [put aside]

Provider rate limit

- x qps per provider (regardless of IP/account) - mocean
- x qps per endpoint - infobip
- x qps per IP
- x qps per IP/account - PLDT

Migration Plan

- Integrate third-party APIs first
- New Specs design (module/api)
- Implement module by module
- FPMS migrates one API at a time

Repository management

- Monorepo design (frontend + backend): pnpm workspace/ none

Frontend Architecture

- SvelteKit for frontend framework
- Form handing (Tanstack Form + Zod validation)
- Localization (paraglide.js)
- Table (Tanstack Table)
- Typesafe backend API integration (typesafe response and request payload)
- Typesafe backend API error handling (translation/redirect/toast message/prompt action)
- Well-design/documented custom authentication handling for (access + refresh token)
- Http-polling for status update (Eg: notification/permissions update)
- Storybook for component testing/design
- [Supplementary] Lark OAuth2
- [Supplementary] E2E testing workflow to streamline agentic workflow
- ![Avoid] websocket expensive network connection
- ![Avoid] auth library limited flexibility (fight library pattern to implement custom logic)
- ![Avoid] remote action for version drifting between deployment
- ![Avoid] server components for heavy server rendering load (not suitable for self-hosting)
- [Skill] impeccable for frontend design
