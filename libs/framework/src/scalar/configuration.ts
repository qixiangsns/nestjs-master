import { apiReference } from '@scalar/nestjs-api-reference';
import { ApiReferenceConfigurationWithSource } from '@scalar/types';
type NestJSReferenceConfiguration = ApiReferenceConfigurationWithSource & { withFastify?: boolean };

export const createApiReference = (option: Partial<NestJSReferenceConfiguration>) => {
  return apiReference(option);
};

export const DEFAULT_OPTIONS = {
  theme: 'deepSpace',
  showDeveloperTools: 'never',
  hideModels: true,

  defaultHttpClient: {
    clientKey: 'axios',
    targetKey: 'js',
  },
  hiddenClients: [
    'c',
    'swift',
    'dart',
    'ruby',
    'r',
    'powershell',
    'php',
    'ocaml',
    'objc',
    'kotlin',
    'fsharp',
    'clojure',
    'csharp',
  ],
  mcp: {
    disabled: true,
  },
  hideClientButton: true,
  agent: {
    disabled: true,
  },
} as const satisfies Partial<NestJSReferenceConfiguration>;
