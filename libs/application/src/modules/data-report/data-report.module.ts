import { Module } from '@nestjs/common';
import { CpmsPcrReaderModule } from '@integrations/cpms-pcr-reader';

@Module({
  imports: [CpmsPcrReaderModule],
  controllers: [],
  providers: [],
})
export class DataReportModule {}
