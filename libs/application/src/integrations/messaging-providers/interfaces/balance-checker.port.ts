export interface BalanceChecker {
  getBalance(): Promise<number>;
}
