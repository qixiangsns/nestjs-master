import { Module } from '@nestjs/common';
import { ConnectionProvider } from './providers/connection.provider';
import { QueryClientProvider } from './providers/query.provider';

// Readers
import { PcrReader } from './readers/pcr.reader';
import { BonusPcrReader } from './readers/bonus-pcr.reader';
import { DynamicJackpotReader } from './readers/dynamic-jackpot.reader';

const ReaderServices = [PcrReader, BonusPcrReader, DynamicJackpotReader];

@Module({
  imports: [ConnectionProvider],
  providers: [QueryClientProvider, ...ReaderServices],
  exports: [...ReaderServices],
})
export class CpmsPcrReaderModule {}
