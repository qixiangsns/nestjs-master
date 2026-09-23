# Manage accounts

POST /viber/accounts
GET /viber/accounts
PATCH /viber/accounts/{account_id}

# Manage providers

GET /viber/providers

# Manage logs

GET /viber/logs

# Test API

POST /viber/send

# Routing management

GET /viber/route-config
GET /viber/:id/route-config
POST /viber/route-config
PATCH /viber/:id/route-config

PATCH /viber/route-config/:id/status
PATCH /viber/route-config/:id/channel
