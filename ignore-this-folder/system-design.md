# Description

name: messaging-gateway

## Considerations

- only consider sms-sending capabilities for now

## Tech stacks

Message queue: Pulsar
Cache: Redis
Database: MongoDB (store logs/configs/providers)

## core requirements

- send sms to third party providers
- route each channel's message to right third party providers based on weighted strategy
- higher priority message in each channel must be consumed first before lower priority messages are processed

## sub requirements

- configure provider accounts
- configure routing strategy
- view message logs
- each message has the following types with priority:
  - otp (highest priority)
  - notification (medium priority)
  - marketing (lowest priority)

## Background

- The system needs to provide messaging capabilities to send messages to selected channel (sms/viber/whatsapp/email)
- Each message has a priority level (high/medium/low)
- Other microservices can either call the API or publish message via Pulsar message queue
- How the data flow from request to third party providers for SMS:
  1. Microservice calls SMS API/publish pulsar event to messaging-gateway, the request tells which user and the content it wants to send the message to
  2. The system validates the params (phone number, content length)
  3. The system gets the phone number through the userId passed in the request via an API call to the user-microservice
  4. The system determines the telco network that the phone belongs to based on the phone number pattern (regex pattern)
  5. The system publishes the a Pulsar message to a service called the sms router
  6. The sms router consumes messages in batch and decide where each sms should be routed to
     - the router gets/maintains a list of available/healthy configured providers
     - phone number with <telco_name> network is routed to one in the list of configured SMS providers, each provider configured with its weight distribution
     - a pulsar message is published to the service dedicated to invoked <provider_name> provider API
  7. [x] provider service consumes the message and call the third party API
  - failure to call API will not perform retry

## Service structure

- messaging-admin (adminstration API to account and config management/logs)
- messaging-api (send sms api)
- messaging-dlr-webhooks (exposed public API for DLR callback from providers)
- sms-router (route sms messages)
- sms-consumer-<provider> (send final message to providers)
