/* eslint-disable */

/**
 * This file combines the packages jest-environment-jsdom-global and jest-fixed-jsdom
 * so we can run msw tests properly. It's just a copy of both files smashed together
 * into a single class.
 */

const JSDOMEnvironment = require('jest-environment-jsdom').default;

module.exports = class StytchJSDOMEnvironment extends JSDOMEnvironment {
  constructor(...args) {
    super(...args);

    this.customExportConditions = args.customExportConditions || [''];

    this.global.TextDecoder = TextDecoder;
    this.global.TextEncoder = TextEncoder;
    this.global.TextDecoderStream = TextDecoderStream;
    this.global.TextEncoderStream = TextEncoderStream;
    this.global.Request = Request;
    this.global.Response = Response;

    // We're not going to enable these unlike jest-fixed-jsdom, these Node.js implementation
    // may have subtle differences from JSDOM / Browser implementation

    // this.global.ReadableStream = ReadableStream;
    // this.global.Blob = Blob;
    // this.global.Headers = Headers;

    // Node FormData does not implement taking in a HTMLFormElement so this breaks some test
    // this.global.FormData = FormData;

    this.global.fetch = fetch;
    // this.global.AbortController = AbortController;
    // this.global.AbortSignal = AbortSignal;
    // this.global.structuredClone = structuredClone;
    // this.global.URL = URL;
    // this.global.URLSearchParams = URLSearchParams;

    this.global.BroadcastChannel = BroadcastChannel;
    this.global.TransformStream = TransformStream;
    this.global.WritableStream = WritableStream;
  }

  async setup() {
    await super.setup();
    this.global.jsdom = this.dom;
  }

  async teardown() {
    this.global.jsdom = undefined;
    await super.teardown();
  }
};
