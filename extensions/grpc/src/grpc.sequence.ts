// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {invokeMethod} from '@loopback/core';
import debugFactory from 'debug';
import {ServerUnaryCall} from 'grpc';
import {GrpcBindings} from './keys';
import {GrpcRequestContext} from './request-context';

const debug = debugFactory('loopback:grpc:sequence');

/**
 *Interface for gRPC sequence
 */
export interface GrpcSequenceHandler {
  /**
   * Handle a gRPC request/response
   * @param reqCtx - gRPC request context
   */
  handle<Req = unknown, Res = unknown>(
    reqCtx: GrpcRequestContext<Req, Res>,
  ): Promise<Res | void>;
}

/**
 * GRPC Sequence
 */
export class DefaultGrpcSequence implements GrpcSequenceHandler {
  constructor() {}

  async invoke<Req = unknown, Res = unknown>(
    reqCtx: GrpcRequestContext<Req, Res>,
    args?: Req,
  ) {
    const controller: {[method: string]: Function} = await reqCtx.get(
      GrpcBindings.GRPC_CONTROLLER,
    );
    const method = await reqCtx.get(GrpcBindings.GRPC_METHOD_NAME);
    // Do something before call
    debug('Calling %s.%s', controller.constructor.name, method, reqCtx);
    return invokeMethod(controller, method, reqCtx, [args ?? reqCtx]);
  }

  async handle<Req = unknown, Res = unknown>(
    reqCtx: GrpcRequestContext<Req, Res>,
  ): Promise<Res | void> {
    const method = reqCtx.operation.method;
    if (method.requestStream === true && method.responseStream === true) {
      return this.invoke(reqCtx);
    } else if (
      method.requestStream === true &&
      method.responseStream === false
    ) {
      return this.invoke(reqCtx);
    } else if (
      method.requestStream === false &&
      method.responseStream === true
    ) {
      return this.invoke(reqCtx);
    } else if (
      method.requestStream === false &&
      method.responseStream === false
    ) {
      return this.invoke(
        reqCtx,
        (reqCtx.request as ServerUnaryCall<Req>).request,
      );
    }
  }
}
