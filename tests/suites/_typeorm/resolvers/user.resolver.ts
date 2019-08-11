import { User } from '../entities/user';
import { Resolver, Query, Arg, Args, ArgsType, Field, Ctx } from "type-graphql";
import { getRepository } from 'typeorm';
import { RelayedQuery } from 'auto-relay';
import { Recipe } from '../entities/recipe';
import { RelayLimitOffset } from 'auto-relay';

@ArgsType()
export class UserArgType {
  @Field({ nullable: true })
  foo?: string;
  @Field({ nullable: true })
  bar?: number;
}

@Resolver(() => User)
export class UserResolver {

  @Query(() => [User])
  public async getAllUsers(): Promise<User[]> {
    return getRepository(User).find();
  }

  @RelayedQuery(() => User)
  public async getAllUsersPaginated(
    @Arg('anArg', { nullable: true }) anArg: string,
    @Args(() => UserArgType) moreArgs?: UserArgType,
    @RelayLimitOffset() pagination?: any,
    @Ctx() context?: any
  ): Promise<[number, User[]]> {

    return [1, [new User()]];
  }

}