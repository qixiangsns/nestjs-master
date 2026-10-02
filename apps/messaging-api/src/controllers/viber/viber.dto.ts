import { createZodDto } from 'nestjs-zod';
import {
  SendViberMktSchema,
  SendViberNotifSchema,
  SendViberOtpSchema,
  SendViberResponseSchema,
} from '@application/modules/viber';

export class SendViberOtpDto extends createZodDto(SendViberOtpSchema) {}
export class SendViberNotifDto extends createZodDto(SendViberNotifSchema) {}
export class SendViberMktDto extends createZodDto(SendViberMktSchema) {}
export class SendViberResponseDto extends createZodDto(SendViberResponseSchema) {}
