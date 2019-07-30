import { Entity, PrimaryGeneratedColumn, OneToOne, ManyToOne, OneToMany, ManyToMany, createConnection, BaseEntity, Column, JoinColumn } from "typeorm";
import { TypeOrmConnection } from "./type-orm-connection";
import * as Faker from "faker"


@Entity()
class TestJoinThroughEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => TestEntity, test => test.joinThrough)
  test: TestEntity | undefined;

  @ManyToOne(() => TestThroughEntity, testThrough => testThrough.joinThrough)
  testThrough: TestThroughEntity | undefined;

  @Column()
  propOne: string = Faker.random.alphaNumeric(12)

  @Column()
  propTwo: string = Faker.random.alphaNumeric(12)
}

@Entity()
class TestOneToOneEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  propOne: string = Faker.random.alphaNumeric(12)

  @Column()
  propTwo: string = Faker.random.alphaNumeric(12)

  @OneToOne(() => TestEntity, test => test.oneToOne)
  @JoinColumn()
  testEntity: TestEntity | undefined;
}

@Entity()
export class TestEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  propOne: string = Faker.random.alphaNumeric(12)

  @Column()
  propTwo: string = Faker.random.alphaNumeric(12)

  @OneToOne(() => TestOneToOneEntity, testO => testO.testEntity)
  oneToOne: TestOneToOneEntity | undefined;

  @OneToMany(() => TestOneToManyEntity, testO => testO.test)
  oneToMany: TestOneToManyEntity[] | undefined;

  @OneToMany(() => TestJoinThroughEntity, joinT => joinT.test)
  joinThrough: TestJoinThroughEntity[] | undefined;
}


@Entity()
class TestOneToManyEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => TestEntity, test => test.oneToMany)
  test: TestEntity | undefined;

  @Column()
  propOne: string = Faker.random.alphaNumeric(12)

  @Column()
  propTwo: string = Faker.random.alphaNumeric(12)

}

@Entity()
class TestThroughEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToMany(() => TestJoinThroughEntity, joinT => joinT.testThrough)
  joinThrough!: TestJoinThroughEntity;

  @Column()
  propOne: string = Faker.random.alphaNumeric(12)

  @Column()
  propTwo: string = Faker.random.alphaNumeric(12)
}


const seed = async () => {

  for (let i = 0; i < 10; i++) {
    const test = new TestEntity();
    await test.save();
    test.oneToOne = new TestOneToOneEntity();
    await test.oneToOne.save();
    test.oneToMany = [];
    for (let j = 0; j < 5; j++) {
      const oneToM = new TestOneToManyEntity();
      await oneToM.save();
      test.oneToMany.push(oneToM);

      const through = new TestJoinThroughEntity();
      through.test = test;
      through.testThrough = new TestThroughEntity();
      await through.testThrough.save();

      await through.save();
    }

    await test.save();
  }

}

describe('Auto-relay Connection', () => {

  let typeOrm: TypeOrmConnection = new TypeOrmConnection();

  beforeAll(async () => {
    await createConnection({
      type: "sqlite",
      database: "test",
      entities: [
        TestEntity, TestOneToOneEntity, TestOneToManyEntity, TestThroughEntity, TestJoinThroughEntity
      ],
      dropSchema: true,
      synchronize: true,
      logging: true
    })

    await seed();
  }, 15000);

  beforeEach(() => {
    typeOrm = new TypeOrmConnection();
  })

  describe('Basic fetching', () => {
    it('Should fetch a basic entity', async () => {
      const relay = await typeOrm.autoRelayFactory('oneToMany', () => TestEntity, () => TestOneToManyEntity)();

      expect(relay).toBeTruthy();
    })
  })
})