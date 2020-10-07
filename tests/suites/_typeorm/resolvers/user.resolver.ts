import { User } from '../entities/user';
import { Resolver, Query, Arg, Args, ArgsType, Field, Ctx } from "type-graphql";
import { getRepository } from 'typeorm';
import { RelayedQuery, RelayLimitOffsetArgs, RelayLimitOffset } from 'auto-relay';
import { Recipe } from '../entities/recipe'
import { default as Faker } from 'faker'

@ArgsType()
export class UserArgType {
  @Field({ nullable: true })
  foo?: string;
  @Field({ nullable: true })
  bar?: number;
}

@Resolver(() => User)
export class UserResolver {

  protected static seeded: boolean = false

  @Query(() => [User])
  public async getAllUsers(): Promise<User[]> {
    return getRepository(User).find();
  }

  @RelayedQuery(() => User)
  public async getAllUsersPaginated(
    @Arg('anArg', { nullable: true }) anArg: string,
    @Args(() => UserArgType) moreArgs?: UserArgType,
    @RelayLimitOffset() pagination?: RelayLimitOffsetArgs,
    @Ctx() context?: any
  ): Promise<[User[], number]> {
    return getRepository(User).findAndCount({
      where: {},
      skip: pagination?.offset,
      take: pagination?.limit
    })
  }


  @RelayedQuery(() => User, { biDirectionalPageInfo: true })
  public async getAllUsersPaginatedBiDirectional(
    @Arg('anArg', { nullable: true }) anArg: string,
    @Args(() => UserArgType) moreArgs?: UserArgType,
    @RelayLimitOffset() pagination?: RelayLimitOffsetArgs,
    @Ctx() context?: any
  ): Promise<[User[], number]> {
    return this.getAllUsersPaginated(anArg, moreArgs, pagination, context)
  }

  public static async seed(): Promise<void> {
    if(!this.seeded) {
      this.seeded = true;
      const users: Partial<User>[] = Array.from({ length: 100 }, () => ({ email: Faker.internet.email(), nickname: Faker.name.firstName(), password: Faker.random.word() }));
      await getRepository(User).insert(users)
    }
  }
}