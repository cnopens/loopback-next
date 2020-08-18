// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  BindingScope,
  Component,
  Constructor,
  CoreBindings,
  createBindingFromClass,
  inject,
  ProviderMap,
  Server,
} from '@loopback/core';
import {ProtoBooter} from './booters/proto.booter';
import {GrpcGenerator} from './grpc.generator';
import {DefaultGrpcSequence} from './grpc.sequence';
import {GrpcServer} from './grpc.server';
import {GrpcBindings} from './keys';
import {ServerProvider} from './providers/server.provider';
import {GrpcServerConfig} from './types';
/**
 * Grpc Component for LoopBack 4.
 */
export class GrpcComponent implements Component {
  /**
   * Export GrpcProviders
   */
  providers: ProviderMap = {
    [GrpcBindings.GRPC_SERVER.toString()]: ServerProvider,
  };

  /**
   * Export Grpc Server
   */
  servers: {[name: string]: Constructor<Server>} = {
    GrpcServer,
  };

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) app: Application,
    @inject(GrpcBindings.CONFIG) config: GrpcServerConfig,
  ) {
    // Set default configuration for this component
    config = {
      host: '127.0.0.1',
      port: 3000,
      ...config,
    };
    // Bind host, port, proto path, package and sequence
    app.bind(GrpcBindings.HOST).to(config.host);
    app.bind(GrpcBindings.PORT).to(config.port);

    app
      .bind(GrpcBindings.GRPC_GENERATOR)
      .toClass(GrpcGenerator)
      .inScope(BindingScope.SINGLETON);

    const sequenceBinding = createBindingFromClass(
      config.sequence ?? DefaultGrpcSequence,
      {key: GrpcBindings.GRPC_SEQUENCE},
    );
    app.add(sequenceBinding);

    const booterBindings = createBindingFromClass(ProtoBooter);
    app.add(booterBindings);
  }
}
