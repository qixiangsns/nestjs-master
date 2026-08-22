import {
  CompositePropagator,
  W3CTraceContextPropagator,
  W3CBaggagePropagator,
} from '@opentelemetry/core';
import {
  BatchSpanProcessor,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { getOtelConfig } from './config';
import { MongooseInstrumentation } from '@opentelemetry/instrumentation-mongoose';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

const config = getOtelConfig();
const traceExporter = new OTLPTraceExporter({
  url: config.OTEL_ADDRESS,
});

const metricExporter = new OTLPMetricExporter({
  url: config.OTEL_METRIC_ADDRESS,
});

export const otelSdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: config.OTEL_SERVICE_NAME,
  }),
  traceExporter,
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
  }),
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
  contextManager: new AsyncLocalStorageContextManager(),
  textMapPropagator: new CompositePropagator({
    propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
  }),
  instrumentations: [
    getNodeAutoInstrumentations(),
    new NestInstrumentation(),
    new MongooseInstrumentation(),
    new IORedisInstrumentation(),
  ],
  sampler: new ParentBasedSampler({
    root: new TraceIdRatioBasedSampler(config.OTEL_SAMPLING_RATE), // 10% of root spans
  }),
});

// You can also use the shutdown method to gracefully shut down the SDK before process shutdown
// or on some operating system signal.
process.on('SIGTERM', () => {
  otelSdk
    .shutdown()
    .then()
    .catch((error) => {
      console.error('Error shutting down OpenTelemetry SDK:', error);
    });
});
export default otelSdk;
