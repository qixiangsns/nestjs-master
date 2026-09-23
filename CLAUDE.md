## What this system is

A multi-channel messaging platform: **SMS, email, Viber and WhatsApp**. Other microservices call the public
messaging API to send a message on a chosen channel; the platform picks a provider account according to routing
config, dispatches via that provider's integration, and records delivery status. Admins use a separate backoffice
API to manage providers, provider accounts, routing configs, admin users, and to inspect message logs.
