import { AutoRelayConfigArgs } from 'auto-relay';
import { TypeOrmConnection } from '@auto-relay/typeorm';
import { setUpTypeORM } from './suites/_typeorm';
import { AutoRelayRunner } from './helpers/auto-relay-runner';
import { SDLTests } from './suites/sdl';
import { RelayedQueryTests } from './suites/relayed-query';

const configs: [string, AutoRelayConfigArgs, () => void | Promise<void>][] = [
  [
    'TypeORM',
    { orm: () => TypeOrmConnection } as AutoRelayConfigArgs,
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

    SDLTests(name);
    RelayedQueryTests(name);
  }
}

run();