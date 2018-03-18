declare module "eep";

declare type MessageHandler = (message: any) => void;

declare type SourceConnectFunction = (handler: MessageHandler, rawEnv?: any, isRetry?: boolean) => void;

declare type SourceClient = {
  connect: SourceConnectFunction;
};

declare type SpoutMapFunction = (message: string) => SpoutMessage | undefined;

declare type SpoutMapper = {
  map: SpoutMapFunction;
};

declare type SourceName = "gdax" | "okex";

declare type BufferMessage = {
  $source: SourceName;
  $its: number;
};

declare type SpoutMessage = BufferMessage & {
  $pair: string;
};

declare type SpoutMessageHandler = (pattern: string, channel: string, message: string) => void;

declare type BoltExecuteFunction = (handler: SpoutMessageHandler, rawEnv?: any) => void;

declare type Bolt = {
  execute: BoltExecuteFunction;
};
