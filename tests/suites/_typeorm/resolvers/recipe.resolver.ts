import { Resolver, Query } from "type-graphql";
import { getRepository, getConnection } from 'typeorm';
import { Recipe } from '../entities/recipe';


@Resolver(() => Recipe)
export class RecipeResolver {

  @Query(() => [Recipe])
  public async recipes(): Promise<Recipe[]> {
    return getRepository(Recipe).find();
  }

}