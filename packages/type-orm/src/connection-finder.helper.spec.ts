import { Entity, PrimaryGeneratedColumn, Column, createConnection, createConnections, getConnection } from "typeorm"
import { connectionFinderForEntity } from "./connection-finder.helper"

@Entity()
class EntityA {
  @PrimaryGeneratedColumn()
  public id!: string

}

@Entity()
class EntityB {
  @PrimaryGeneratedColumn()
  public id!: string
}

@Entity()
class EntityC {
  @PrimaryGeneratedColumn()
  public id!: string
}

@Entity()
class EntityD {
  @PrimaryGeneratedColumn()
  public id!: string
}


describe("ConnectionFinder", () => {
  beforeAll(async () => {
    await createConnections([
      {
        type: 'sqlite',
        database: ":memory:",
        synchronize: true,
        dropSchema: true,
        entities: [EntityA, EntityB]
      },
      {
        type: 'sqlite',
        name: 'second',
        database: ":memory:",
        synchronize: true,
        dropSchema: true,
        entities: [EntityB, EntityC]
      }
    ])
  })

  it('should find connection for Entity in a single connection', () => { 
    const test1 = connectionFinderForEntity(() => EntityA)
    const test2 = connectionFinderForEntity(() => EntityC)

    expect(test1.name).toEqual(getConnection().name)
    expect(test2.name).toEqual(getConnection('second').name)
  })

  it('should find any connection for Entity in multiple connections', () => { 
    const test = connectionFinderForEntity(() => EntityB)

    expect(test.name).toBeOneOf(['default', 'second'])
  })
  
  it('should throw for entity in no connections', () => {
    expect(() => connectionFinderForEntity(() => EntityD)).toThrowError(/find connection/)
  })

})