import * as fs from 'node:fs';
import * as path from 'node:path';
import { OpenAPIObject } from '@nestjs/swagger';

/** Saves the spec to a JSON file (input for Hey API). */
export function saveOpenApiDocument(document: OpenAPIObject, filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(document, null, 2));
}
