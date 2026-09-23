/**
 * Promotexter custom error codes
 * https://promotexter-api.redocly.app/errorcodes
 */
export const PromotexterErrorCode = {
  PARAM_VALIDATION: '200100', // Parameters validation error.
  NO_CREDIT: '200101', // The account has no credit.
  INCORRECT_COUNTRY_SETTING: '200102', // The country setting of the account is incorrect.
  INVALID_SENDER_NAME: '200201', // The sender name is invalid.
  INVALID_RECIPIENT: '200202', // The recipient is invalid.
  INVALID_MESSAGE_BODY: '200203', // The message body is invalid.
  INVALID_CALLBACK: '200204', // The callback is invalid.
  INTERNATIONAL_SENDING_NOT_ALLOWED: '200205', // International sending is not allowed.
  DUPLICATE_CALL_NOT_ALLOWED: '200206', // Duplicate call is not allowed.
  INVALID_SUBJECT: '200207', // subject is invalid.
  INVALID_HTML: '200208', // html is invalid.
  EMAIL_RECIPIENT_BLACKLISTED: '200209', // Email recipient is blacklisted.
  INVALID_GROUP_NAME: '200210', // groupName is invalid.
  EMAIL_RECIPIENT_OPTED_OUT: '200211', // Email recipient has previously opted-out.
  DATA_NO_LONGER_AVAILABLE: '200212', // Data is no longer available.
  FILTER_REQUIRED: '200213', // At least one filter is required.
  UNSUBSCRIBE_LINK_PLACEHOLDER_REQUIRED: '200214', // %Unsubscribe_Link% placeholder is required.
  INVALID_COUNTRY_MOBILE_PREFIX: '200215', // Invalid Country Mobile Prefix.
  INVALID_PARAMETER_VALUE: '200216', // Invalid Parameter Value.
  INVALID_DATE_FORMAT: '200217', // Invalid Date Format.
  CODE_PLACEHOLDER_REQUIRED: '200218', // Code placeholder is required.
  CODE_LENGTH_BELOW_MINIMUM: '200219', // codelength value did not meet minimum value.
  CODE_LENGTH_EXCEEDED: '200220', // codelength value exceeded.
  CODE_LENGTH_NOT_NUMERIC: '200221', // codelength value should only be numeric.
  INVALID_CODE_TYPE: '200222', // codetype is invalid.
  EXPIRATION_BELOW_MINIMUM: '200223', // expiration value did not meet minimum value.
  EXPIRATION_EXCEEDED: '200224', // expiration value exceeded.
  EXPIRATION_NOT_NUMERIC: '200225', // expiration value should be numeric; Transaction ID is required.
  SMS_FALLBACK_LIMIT_EXCEEDED: '200226', // SMS Fallback message limit exceeded; Viber message length exceeded.
  ID_REQUIRED: '200227', // id is required.
  INVALID_ID: '200228', // id is invalid.
  TRANSACTION_EXPIRED: '200229', // Transaction has expired.
  CODE_REQUIRED: '200230', // code is required.
  INVALID_CODE: '200231', // code is invalid.
  CAPTION_LENGTH_EXCEEDED: '200232', // Caption length exceeded.
  INVALID_CONTENT_COMBINATION: '200233', // Invalid content combination.
  INVALID_TRANSACTION_TYPE: '200234', // Invalid transaction type.
  INVALID_TTL_VALUE: '200235', // Invalid TTL value.
  CHANNEL_ID_NOT_WHITELISTED: '200236', // Channel ID must be whitelisted to the account.
  URL_NOT_SAFELISTED: '200237', // URL/s is not safelisted.
  INVALID_ATTEMPT_LIMIT_VALUE: '200238', // Invalid attemptLimit value.
  CODE_ATTEMPT_LIMIT_REACHED: '200239', // Incorrect code attempt limit reached.
  INVALID_ATTACHMENT: '200242', // Attachment is invalid.
  ATTACHMENT_SIZE_EXCEEDED: '200243', // Attachment size limit exceeded.
  TOKEN_EXPIRED: '200244', // Token has expired.
  TOKEN_REQUIRED: '200245', // Token is required.
  INVALID_TOKEN_EXPIRATION: '200246', // Invalid client-generated token expiration value (min: 1 sec; max: 1 min).
  RECIPIENT_BLACKLISTED: '200247', // The recipient is blacklisted.
  INCORRECT_TEMPLATE_ID: '200248', // Template ID is incorrect.
  INCORRECT_TEMPLATE_VARIABLE_OR_LANGUAGE: '200249', // Template variable or language is incorrect.
  INVALID_TARGET_DEVICE: '200261', // Target device value is invalid.
  MESSAGE_NOT_ROUTABLE: '200301', // The message is not routable.
  UNAUTHORIZED_ACCESS: '40001', // Unauthorized Access.
  TOO_MANY_REQUESTS: '40002', // Too many requests.
  REQUEST_PARAM_VALIDATION: '40003', // Parameters validation error.
  BAD_REQUEST: '40004', // Bad request (+Error Description).
  ENDPOINT_NOT_FOUND: '40005', // Endpoint doesn't exist.
  BASE_ERROR: '40006', // Base Error.
  UNAUTHORIZED_IP: '40007', // Unauthorized IP.
  GENERAL_ERROR: '50000', // General Error.
  INTERNAL_BAD_REQUEST: '50001', // Bad Request.
  GENERAL_ERROR_ALT: '50002', // General Error.
  GENERAL_ERROR_ALT2: '50003', // General Error.
  SMS_SERVICE_UNAVAILABLE: '500101', // The SMS Service is unavailable.
} as const;

export type PromotexterErrorCode = (typeof PromotexterErrorCode)[keyof typeof PromotexterErrorCode];
