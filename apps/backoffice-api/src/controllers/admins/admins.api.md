Get Admin List
GET /admins
Search, filter, and paginate admin accounts.

Get Admin Info
GET /admins/{admin_id}
Retrieve details for a specific admin.

Patch Admin Info
PATCH /admins/{admin_id}
Partially update profile details (name, email, role, etc.).

Reset Password (Admin action)
POST /admins/{admin_id}/change-password
Force-reset another admin's password (e.g., generates temporary token/password).

Reset 2FA Secret
POST /admins/{admin_id}/reset-tfa
Clears 2FA registration so the target admin can re-enroll.

Freeze / Unfreeze Account
PATCH /admins/{admin_id}/status
Toggle or set account status (e.g., active, suspended).
