/** Where a payload failed its schema: building the request, or reading the server's reply. */
export enum EApiPayloadStage {
  REQUEST = 'request',
  RESPONSE = 'response',
}
