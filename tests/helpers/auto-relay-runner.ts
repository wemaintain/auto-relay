import { Container } from 'typedi';
import { AutoRelayConfigArgs, AutoRelayConfig } from "auto-relay";
import { SDLTests } from '../suites/sdl';

export class AutoRelayRunner {
  constructor(protected readonly name: string, protected readonly config: AutoRelayConfigArgs, protected readonly runBefore?: () => Promise<void> | void) {
  }

  public async beforeSuite() {
    Container.reset();
    new AutoRelayConfig(this.config);
    if(this.runBefore) {
      await this.runBefore();
    }
  }
}