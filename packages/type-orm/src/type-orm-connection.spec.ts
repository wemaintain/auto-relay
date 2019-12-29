import { Entity, PrimaryGeneratedColumn, Column, createConnection, createConnections, getConnection } from "typeorm"
import { connectionFinderForEntity } from "./connection-finder.helper"
import { TypeOrmConnection } from "./type-orm-connection"

@Entity()
class EntityA {
  @PrimaryGeneratedColumn()
  public id!: string

  public notColumn!: string

  @Column()
  public columnSameName!: string

  @Column({ name: 'columnDBName' })
  public columnFieldName!: string

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


describe("TypeORM Connection", () => {

  let ormConnection: TypeOrmConnection

  beforeAll(async () => {
    await createConnection(
      {
        type: 'sqlite',
        database: ":memory:",
        synchronize: true,
        dropSchema: true,
        entities: [EntityA, EntityB, EntityC]
      }
    )
  })

  beforeEach(() => {
    ormConnection = new TypeOrmConnection()
  })

  describe('getColumnsOfFields', () => {
    it('should not contain fields that are not columns', () => {
      const test = ormConnection.getColumnsOfFields(() => EntityA, ["notColumn"])

      expect(test.notColumn).toBeUndefined()
    })

    it('should contain fields that are columns', () => {
      const test = ormConnection.getColumnsOfFields(() => EntityA, ["id", "notColumn", "columnSameName"])

      expect(Object.keys(test)).toHaveLength(2)
      expect(test.id).toEqual('id')
      expect(test.columnSameName).toEqual('columnSameName')
    })

    it('Should contain fields that are columns with their dbNames', () => {
      const test = ormConnection.getColumnsOfFields(() => EntityA, ["id", "notColumn", "columnSameName", "columnFieldName"])

      expect(Object.keys(test)).toHaveLength(3)
      expect(test.id).toEqual('id')
      expect(test.columnSameName).toEqual('columnSameName')
      expect(test.columnFieldName).toEqual('columnDBName')
    })

  })

})