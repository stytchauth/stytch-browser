import { oneTapStart, oneTapSubmit, parsedPhoneNumber } from './handlers';
import { RPCManifest } from './manifest';
import { IframeEmbeddedClient } from './IframeClient';

const HANDLER_MAP: RPCManifest = {
  oneTapStart,
  oneTapSubmit,
  parsedPhoneNumber,
};

const client = new IframeEmbeddedClient();

Object.entries(HANDLER_MAP).forEach(([handler, handlerImpl]) => client.registerHandler(handler, handlerImpl));
