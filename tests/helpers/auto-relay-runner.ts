import { Container } from 'typedi';
import { AutoRelayConfigArgs, AutoRelayConfig } from "auto-relay";
import { SDLTests } from '../suites/sdl';

export class AutoRelayRunner {
  constructor(protected readonly name: string, protected readonly config: AutoRelayConfigArgs, protected readonly runBefore?: () => Promise<void> | void) {
  }

  /**
   * Prepare for test suite
   * @param configAutoRelay wether or not to create an AutoRelayConfig object
   */
  public async beforeSuite(configAutoRelay=true) {
    Container.reset();
    
    if(configAutoRelay) {
      new AutoRelayConfig(this.config);
    }

    if(this.runBefore) {
      await this.runBefore();
    }
  }
}