// Type declarations for "smpp" (https://github.com/farhadi/node-smpp)
// Derived from lib/smpp.js. Command/TLV/error tables live in lib/defs.js,
// so those parts are typed loosely on purpose.

declare module 'smpp' {
  import { EventEmitter } from 'events';
  import * as net from 'net';
  import * as tls from 'tls';

  // ---------------------------------------------------------------------------
  // PDU
  // ---------------------------------------------------------------------------

  /** Fields of a PDU. Known fields are typed; any TLV/other field is allowed. */
  export interface PDUFields {
    command_length?: number;
    command_id?: number;
    command_status?: number;
    sequence_number?: number;

    system_id?: string;
    password?: string;
    system_type?: string;
    interface_version?: number;
    addr_ton?: number;
    addr_npi?: number;
    address_range?: string;

    service_type?: string;
    source_addr_ton?: number;
    source_addr_npi?: number;
    source_addr?: string;
    dest_addr_ton?: number;
    dest_addr_npi?: number;
    destination_addr?: string;
    esm_class?: number;
    protocol_id?: number;
    priority_flag?: number;
    schedule_delivery_time?: string;
    validity_period?: string;
    registered_delivery?: number;
    replace_if_present_flag?: number;
    data_coding?: number;
    sm_default_msg_id?: number;
    sm_length?: number;
    short_message?: string | Buffer | ShortMessage;
    message_payload?: string | Buffer;
    message_id?: string;
    receipted_message_id?: string;

    [field: string]: any;
  }

  export interface ShortMessage {
    udh?: Buffer | Buffer[];
    message: string | Buffer;
  }

  export class PDU implements PDUFields {
    constructor(command: string, options?: PDUFields);

    command: string;
    command_length: number;
    command_id: number;
    command_status: number;
    sequence_number: number;
    [field: string]: any;

    /** True if this PDU is a `*_resp` (or `generic_nack`) command. */
    isResponse(): boolean;
    /** Build the matching response PDU (e.g. for a received deliver_sm). */
    response(options?: PDUFields): PDU;
    toBuffer(): Buffer;

    static commandLength(stream: NodeJS.ReadableStream): number | undefined;
    static fromStream(stream: NodeJS.ReadableStream, commandLength?: number): PDU | false | undefined;
    static fromBuffer(buffer: Buffer): PDU;
  }

  // ---------------------------------------------------------------------------
  // Callbacks
  // ---------------------------------------------------------------------------

  export type ResponseCallback = (pdu: PDU) => void;
  export type SendCallback = (pdu: PDU) => void;
  export type FailureCallback = (pdu: PDU, err?: Error) => void;

  // ---------------------------------------------------------------------------
  // Session
  // ---------------------------------------------------------------------------

  export interface SessionDebugListener {
    (type: string | null, msg: string | null, payload?: unknown): void;
  }

  export interface SessionOptions extends tls.ConnectionOptions {
    /** e.g. "smpp://host:2775" or "ssmpp://host:3550" (TLS) */
    url?: string;
    /** Use TLS. Implied by an `ssmpp:` URL. */
    tls?: boolean;
    /** Log to console. Default false. */
    debug?: boolean;
    debugListener?: SessionDebugListener | null;
    /** Milliseconds. Default 30000. Set 0 to disable. */
    connectTimeout?: number;
    /** Send enquire_link automatically every N ms. */
    auto_enquire_link_period?: number;
  }

  export interface SessionMetricsContext {
    mode: 'client' | 'server' | null;
    remoteAddress: string | null;
    remotePort: number | null;
    remoteTls: boolean;
    sessionId: number | null;
    session: Session;
  }

  /** Bind-type PDU options. */
  export interface BindOptions extends PDUFields {
    system_id: string;
    password: string;
  }

  /** submit_sm options. */
  export interface SubmitSmOptions extends PDUFields {
    destination_addr: string;
    short_message: string | Buffer | ShortMessage;
  }

  export type CommandShortcut<O extends PDUFields = PDUFields> = {
    (
      options: O,
      responseCallback?: ResponseCallback,
      sendCallback?: SendCallback,
      failureCallback?: FailureCallback,
    ): boolean;
    (responseCallback?: ResponseCallback): boolean;
  };

  export class Session extends EventEmitter {
    /**
     * Client mode: pass connection options.
     * Server mode: pass `{ socket }` (done for you by Server).
     */
    constructor(options: SessionOptions);

    options: SessionOptions;
    socket: net.Socket | tls.TLSSocket;
    sequence: number;
    paused: boolean;
    closed: boolean;
    remoteAddress: string | null;
    remotePort: number | null;
    proxyProtocolProxy: { address: string; port: number } | false | null;
    /** Set on sessions created by a Server. */
    server?: Server;

    /** Reconnect using the original options. */
    connect(): void;

    send(
      pdu: PDU,
      responseCallback?: ResponseCallback,
      sendCallback?: SendCallback,
      failureCallback?: FailureCallback,
    ): boolean;

    pause(): void;
    resume(): void;
    /** Graceful end. */
    close(callback?: () => void): void;
    /** Immediate destroy. */
    destroy(callback?: () => void): void;

    // Command shortcuts (generated from defs.commands) -----------------------
    bind_transmitter: CommandShortcut<BindOptions>;
    bind_receiver: CommandShortcut<BindOptions>;
    bind_transceiver: CommandShortcut<BindOptions>;
    outbind: CommandShortcut;
    unbind: CommandShortcut;
    generic_nack: CommandShortcut;
    submit_sm: CommandShortcut<SubmitSmOptions>;
    submit_multi: CommandShortcut;
    deliver_sm: CommandShortcut;
    data_sm: CommandShortcut;
    query_sm: CommandShortcut;
    cancel_sm: CommandShortcut;
    replace_sm: CommandShortcut;
    enquire_link: CommandShortcut;
    alert_notification: CommandShortcut;

    bind_transmitter_resp: CommandShortcut;
    bind_receiver_resp: CommandShortcut;
    bind_transceiver_resp: CommandShortcut;
    unbind_resp: CommandShortcut;
    submit_sm_resp: CommandShortcut;
    submit_multi_resp: CommandShortcut;
    deliver_sm_resp: CommandShortcut;
    data_sm_resp: CommandShortcut;
    query_sm_resp: CommandShortcut;
    cancel_sm_resp: CommandShortcut;
    replace_sm_resp: CommandShortcut;
    enquire_link_resp: CommandShortcut;

    /** Commands added with addCommand() are available here. */
    [command: string]: any;

    // Events ------------------------------------------------------------------
    on(event: 'connect' | 'secureConnect' | 'close', listener: () => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    on(event: 'pdu' | 'send', listener: (pdu: PDU) => void): this;
    on(event: 'debug', listener: (type: string | null, msg: string | null, payload?: unknown) => void): this;
    on(
      event: 'metrics',
      listener: (
        event: string | null,
        value: number | null,
        payload: Record<string, unknown>,
        context: SessionMetricsContext,
      ) => void,
    ): this;
    /** Incoming command by name, e.g. 'deliver_sm', 'enquire_link', 'submit_sm'. */
    on(event: string | symbol, listener: (pdu: PDU) => void): this;

    once(event: 'connect' | 'secureConnect' | 'close', listener: () => void): this;
    once(event: 'error', listener: (err: Error) => void): this;
    once(event: string | symbol, listener: (...args: any[]) => void): this;
  }

  // ---------------------------------------------------------------------------
  // Server
  // ---------------------------------------------------------------------------

  export interface ServerOptions extends tls.TlsOptions {
    /** If both `key` and `cert` are set, a TLS server is created. */
    debug?: boolean;
    debugListener?: SessionDebugListener | null;
    /** Accept PROXY protocol headers (HAProxy etc.). */
    enable_proxy_protocol_detection?: boolean;
    [option: string]: any;
  }

  export type SessionListener = (session: Session) => void;

  export class Server extends net.Server {
    constructor(options?: ServerOptions, listener?: SessionListener);
    constructor(listener: SessionListener);

    sessions: Session[];
    tls: boolean;
    isProxiedServer: boolean;
    options: ServerOptions;

    on(event: 'session', listener: SessionListener): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
  }

  export class SecureServer extends tls.Server {
    constructor(options?: ServerOptions, listener?: SessionListener);
    constructor(listener: SessionListener);

    sessions: Session[];
    tls: boolean;
    options: ServerOptions;

    on(event: 'session', listener: SessionListener): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
  }

  // ---------------------------------------------------------------------------
  // Factory functions
  // ---------------------------------------------------------------------------

  export function createServer(options?: ServerOptions, listener?: SessionListener): Server | SecureServer;
  export function createServer(listener: SessionListener): Server;

  /** Connect with an options object (or URL inside options). */
  export function connect(options: SessionOptions, listener?: (session: Session) => void): Session;
  /** Connect with a URL such as "smpp://host:2775" or "ssmpp://host:3550". */
  export function connect(url: string, listener?: (session: Session) => void): Session;
  /** Connect with just a listener (localhost:2775). */
  export function connect(listener: (session: Session) => void): Session;
  /** Legacy: connect(host, port, listener). */
  export function connect(host: string, port: number, listener?: (session: Session) => void): Session;

  export const createSession: typeof connect;

  // ---------------------------------------------------------------------------
  // Extension points and definitions
  // ---------------------------------------------------------------------------

  export interface CommandDefinition {
    id: number;
    command?: string;
    params?: Record<string, unknown>;
    [key: string]: unknown;
  }

  export interface TLVDefinition {
    id: number;
    tag?: string;
    type?: unknown;
    [key: string]: unknown;
  }

  export function addCommand(command: string, options: CommandDefinition): void;
  export function addTLV(tag: string, options: TLVDefinition): void;

  // Re-exported from lib/defs.js
  export const commands: Record<string, CommandDefinition>;
  export const commandsById: Record<number, CommandDefinition>;
  export const tlvs: Record<string, TLVDefinition>;
  export const tlvsById: Record<number, TLVDefinition>;
  export const errors: Record<string, number>;
  export const consts: Record<string, number>;
  export const encodings: Record<string, unknown>;

  // Common ESME_* status codes are re-exported at top level (exports[error]).
  export const ESME_ROK: number;
  export const ESME_RINVMSGLEN: number;
  export const ESME_RINVCMDLEN: number;
  export const ESME_RINVCMDID: number;
  export const ESME_RINVBNDSTS: number;
  export const ESME_RALYBND: number;
  export const ESME_RSYSERR: number;
  export const ESME_RINVSRCADR: number;
  export const ESME_RINVDSTADR: number;
  export const ESME_RBINDFAIL: number;
  export const ESME_RINVPASWD: number;
  export const ESME_RINVSYSID: number;
  export const ESME_RSUBMITFAIL: number;
  export const ESME_RTHROTTLED: number;
  export const ESME_RUNKNOWNERR: number;
}
