export const ViberAccountTopic = {
  AccountEnabled: 'viber.account.enabled',
  AccountDisabled: 'viber.account.disabled',
} as const satisfies Record<string, `viber.${string}`>;
