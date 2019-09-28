/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-type-alias */
import { ClassType } from 'type-graphql'
import { GraphQLScalarType } from 'graphql'

export type ClassDecorator = <TFunction extends Function>(target: TFunction) => TFunction | void;
export type PropertyDecorator = (target: Object, propertyKey: string | symbol) => void;
export type MethodDecorator = <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void;
export type ParameterDecorator = (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;

export type MethodAndPropDecorator = MethodDecorator & PropertyDecorator;

export declare type TypeValue = ClassType | GraphQLScalarType | Function | object | symbol;
export declare type ReturnTypeFuncValue = TypeValue | [TypeValue];
export declare type TypeValueThunk = (type?: void) => TypeValue;
export declare type ClassTypeResolver = (of?: void) => ClassType;
export declare type ReturnTypeFunc = (returns?: void) => ReturnTypeFuncValue;

export declare type ClassValueThunk<T=any> = (type?: void) => ClassType<T>