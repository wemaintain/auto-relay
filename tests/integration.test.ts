import { ExtendedConnection } from './suites/_typeorm/connection';
import { AutoRelayConfigArgs } from 'auto-relay';
import { TypeOrmConnection } from '@auto-relay/typeorm';
import { setUpTypeORM } from './suites/_typeorm';
import { AutoRelayRunner } from './helpers/auto-relay-runner';
import { SDLTests } from './suites/sdl';
import { RelayedQueryTests } from './suites/relayed-query';
import { RelayedFieldResolverTests } from './suites/relayed-field-resolver';
import { ConnectionTests } from './suites/connection';
import { ExtendedPageInfo } from './suites/_typeorm/page-info';
import { ExtendingPageInfo } from './suites/extending';

const configs: [string, AutoRelayConfigArgs, () => void | Promise<void>][] = [
  [
    'TypeORM',
    { orm: () => TypeOrmConnection, extends: { pageInfo: () => ExtendedPageInfo, connection: () => ExtendedConnection } } as AutoRelayConfigArgs,
    () => setUpTypeORM()
  ],
]

const run = () => {
  for(let i = 0; i < configs.length; i++) {
    const [name, config, before] = configs[i];

    const runner = new AutoRelayRunner(name, config, before);
    beforeAll(async () => {
      await runner.beforeSuite();
    })

    describe(name, () => {
      SDLTests(name)
      RelayedQueryTests(name)
      RelayedFieldResolverTests(name)
      ConnectionTests(name)
      ExtendingPageInfo(name)
    })
  }
}

run();