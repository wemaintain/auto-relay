import { AutoRelayConfig } from './auto-relay-config.service'
import {Container} from 'typedi'
describe('AutoRelayConfig', () => {
  let typeRelayConfig: AutoRelayConfig | null = null
  beforeEach(() => {
    typeRelayConfig = null;
  })

  it('Should instantiate without config', () => {
    typeRelayConfig = new AutoRelayConfig();
    expect(typeRelayConfig).toBeTruthy();
  })

  it('Should make available supplied PAGINATION_OBJECT and CONNECTIONARGS_OBJECT', () => {
    const pagination = () => class TestA{};
    const connectionArgs = () => class TestB{};

    typeRelayConfig = new AutoRelayConfig({ orm: 'type-orm', objects: {
        connectionArgs,
        pagination
      }
    })


    const containerA: () => typeof Object = Container.get('PAGINATION_OBJECT');
    const containerB: () => typeof Object = Container.get('CONNECTIONARGS_OBJECT');

    expect(containerA().name).toBe(pagination().name);
    expect(containerB().name).toBe(connectionArgs().name);
    expect(containerA().name).toBe('TestA')
    expect(containerB().name).toBe('TestB')
  })

  it('Should generate PAGINATION_OBJECT and CONNECTIONARGS_OBJECT when none are given', () => {
    typeRelayConfig = new AutoRelayConfig({ orm: 'type-orm' });

    const containerA: () => typeof Object = Container.get('PAGINATION_OBJECT');
    const containerB: () => typeof Object = Container.get('CONNECTIONARGS_OBJECT');

    expect(containerA()).toBeTruthy()
    expect(containerB()).toBeTruthy()
  })
})
