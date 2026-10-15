export const ViberAccountSignal = {
  AccountEnabled: 'viber.account.enabled',
  AccountDisabled: 'viber.account.disabled',
} as const satisfies Record<string, `viber.${string}`>;

export type AccountEnabledSignal = {
  accountId: string;
};

export type AccountDisabledSignal = {
  accountId: string;
};
