import { CompositePropagator, W3CTraceContextPropagator, W3CBaggagePropagator } from '@opentelemetry/core';
import { BatchSpanProcessor, ParentBasedSampler, TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { getOtelConfig } from './setup.config';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

export function startTracing() {
  const config = getOtelConfig();
  const traceExporter = new OTLPTraceExporter({
    url: config.OTEL_ADDRESS,
  });

  const metricReaders = config.OTEL_METRIC_ADDRESS
    ? [new PeriodicExportingMetricReader({ exporter: new OTLPMetricExporter({ url: config.OTEL_METRIC_ADDRESS }) })]
    : [];

  const otelSdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: config.OTEL_SERVICE_NAME,
    }),
    spanProcessors: [new BatchSpanProcessor(traceExporter)],
    metricReaders,
    contextManager: new AsyncLocalStorageContextManager(),
    textMapPropagator: new CompositePropagator({
      propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
    }),
    // Already includes the NestJS core, Mongoose and IORedis instrumentations.
    instrumentations: [
      getNodeAutoInstrumentations({
        // Noise reduction
        '@opentelemetry/instrumentation-winston': { enabled: false },
        '@opentelemetry/instrumentation-net': { enabled: false },
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-router': { enabled: false },
        '@opentelemetry/instrumentation-dns': { enabled: false },
        // Using @opentelemetry/instrumentation-ioredis
        '@opentelemetry/instrumentation-redis': { enabled: false },
        // Using @opentelemetry/instrumentation-mongoose
        '@opentelemetry/instrumentation-mongodb': { enabled: false },
      }),
    ],
    sampler: new ParentBasedSampler({
      root: new TraceIdRatioBasedSampler(config.OTEL_SAMPLING_RATE),
    }),
  });

  otelSdk.start();

  process.on('SIGTERM', () => {
    otelSdk
      .shutdown()
      .then()
      .catch((error) => {
        console.error('Error shutting down OpenTelemetry SDK:', error);
      });
  });

  return otelSdk;
}
