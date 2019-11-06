import { AutoRelayConfig, PAGINATION_OBJECT, CONNECTIONARGS_OBJECT, ORM_CONNECTION, PREFIX, CONNECTION_BASE_OBJECT } from './auto-relay-config.service'
import { Container } from 'typedi'
import { ORMConnection } from '../orm';

class ORMMock extends ORMConnection {
  public autoRelayFactory(field: any, self: any, type: any, through?: any) {
    return (): any => { };
  }
}

describe('AutoRelayConfig', () => {

  let typeRelayConfig: AutoRelayConfig | null = null
  beforeEach(() => {
    typeRelayConfig = null;
  })

  afterEach(() => {
    Container.reset()
  })

  it('Should not instantiate without config', () => {
    expect(() => new (AutoRelayConfig as any)()).toThrow(/No config/);
  })

  it('Should not instantiate without orm', () => {
    expect(() => new AutoRelayConfig({ orm: undefined as any })).toThrow(/config\.orm must be a function/);
  })

  it('Should instantiate with basic config', () => {
    const autoRelay = new AutoRelayConfig({ orm: () => ORMMock })
    expect(autoRelay).toBeTruthy();
  })

  it('Should provide ORM_CONNECTION', () => {
    const autoRelay = new AutoRelayConfig({ orm: () => ORMMock })
    const test = Container.get(ORM_CONNECTION);

    expect(test()).toBe(ORMMock);
  })

  it('Should provide capitalized PREFIX', () => {
    const autoRelay = new AutoRelayConfig({ orm: () => ORMMock, microserviceName: "aPrefix" })

    const test = Container.get(PREFIX);
    expect(test).toEqual("APrefix")
  })

  it('Should make available supplied PAGINATION_OBJECT and CONNECTIONARGS_OBJECT', () => {
    const pagination = () => class TestA { };
    const connectionArgs = () => class TestB { };

    typeRelayConfig = new AutoRelayConfig({
      orm: () => ORMMock, objects: {
        connectionArgs,
        pageInfo: pagination
      }
    })


    const containerA = Container.get(PAGINATION_OBJECT);
    const containerB = Container.get(CONNECTIONARGS_OBJECT);

    expect(containerA().name).toBe(pagination().name);
    expect(containerB().name).toBe(connectionArgs().name);
    expect(containerA().name).toBe('TestA')
    expect(containerB().name).toBe('TestB')
  })

  it('Should generate PAGINATION_OBJECT and CONNECTIONARGS_OBJECT when none are given', () => {
    typeRelayConfig = new AutoRelayConfig({ orm: () => ORMMock });

    const containerA = Container.get(PAGINATION_OBJECT);
    const containerB = Container.get(CONNECTIONARGS_OBJECT);

    expect(containerA()).toBeTruthy()
    expect(containerB()).toBeTruthy()
  })

  describe('CONNECTION_BASE_OBJECT', () => {
    it('Should provide empty usable CONNECTION_BASE_OBJECT if none specified in config', () => {
      typeRelayConfig = new AutoRelayConfig({ orm: () => ORMMock });

      const test = Container.get(CONNECTION_BASE_OBJECT)

      expect(test()).toBeTruthy()
      expect(test()).toBe(Object)
    })

    it('Should provide CONNECTION_BASE_OBJECT if specified in config', () => {
      const TestFunc = () => class Test {};
      typeRelayConfig = new AutoRelayConfig({ orm: () => ORMMock, extends: { connection: TestFunc } });

      const test = Container.get(CONNECTION_BASE_OBJECT)

      expect(test()).toBeTruthy()
      expect(test).toBe(TestFunc)
    })

  })
})
