import { getExamplePhoneNumber, oneTapStart, oneTapSubmit, parsedPhoneNumber } from './handlers';
import { IframeEmbeddedClient } from './IframeClient';
import { RPCManifest } from './manifest';

const HANDLER_MAP: RPCManifest = {
  oneTapStart,
  oneTapSubmit,
  parsedPhoneNumber,
  getExamplePhoneNumber,
};

const client = new IframeEmbeddedClient();

Object.entries(HANDLER_MAP).forEach(([handler, handlerImpl]) => client.registerHandler(handler, handlerImpl));
