/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  Address,
  Contract,
  ContractState,
  TestContractResult,
  HexString,
  ContractFactory,
  EventSubscribeOptions,
  EventSubscription,
  CallContractParams,
  CallContractResult,
  TestContractParams,
  ContractEvent,
  subscribeContractEvent,
  subscribeContractEvents,
  testMethod,
  callMethod,
  multicallMethods,
  fetchContractState,
  Asset,
  ContractInstance,
  getContractEventsCurrentCount,
  TestContractParamsWithoutMaps,
  TestContractResultWithoutMaps,
  SignExecuteContractMethodParams,
  SignExecuteScriptTxResult,
  signExecuteMethod,
  addStdIdToFields,
  encodeContractFields,
  Narrow,
} from "@alephium/web3";
import { default as PixelFactoryContractJson } from "../PixelFactory.ral.json";
import { getContractByCodeHash, registerContract } from "./contracts";
import { Pixel, AllStructs } from "./types";
import { RalphMap } from "@alephium/web3";

// Custom types for the contract
export namespace PixelFactoryTypes {
  export type Fields = {
    maxX: bigint;
    maxY: bigint;
    burnMint: bigint;
    shinyMultiplier: bigint;
    resetBurnMultiplier: bigint;
    tokenIdToBurn: HexString;
    numPxMinted: bigint;
    balanceBurn: bigint;
  };

  export type State = ContractState<Fields>;

  export type PixelSetEvent = ContractEvent<{
    caller: Address;
    x: bigint;
    y: bigint;
    color: HexString;
    isShiny: boolean;
  }>;
  export type PixelResetEvent = ContractEvent<{
    caller: Address;
    firstMinter: Address;
    x: bigint;
    y: bigint;
  }>;

  export interface CallMethodTable {
    coordByteVecToCartesian: {
      params: CallContractParams<{ coord: HexString }>;
      result: CallContractResult<[bigint, bigint]>;
    };
    cartesianToByteVec: {
      params: CallContractParams<{ x: bigint; y: bigint }>;
      result: CallContractResult<HexString>;
    };
    getPixelFromCoordinates: {
      params: CallContractParams<{ x: bigint; y: bigint }>;
      result: CallContractResult<Pixel>;
    };
    setPixel: {
      params: CallContractParams<{
        x: bigint;
        y: bigint;
        color: HexString;
        amountToBurn: bigint;
        isShiny: boolean;
      }>;
      result: CallContractResult<null>;
    };
    resetPixel: {
      params: CallContractParams<{
        x: bigint;
        y: bigint;
        amountToBurn: bigint;
      }>;
      result: CallContractResult<null>;
    };
  }
  export type CallMethodParams<T extends keyof CallMethodTable> =
    CallMethodTable[T]["params"];
  export type CallMethodResult<T extends keyof CallMethodTable> =
    CallMethodTable[T]["result"];
  export type MultiCallParams = Partial<{
    [Name in keyof CallMethodTable]: CallMethodTable[Name]["params"];
  }>;
  export type MultiCallResults<T extends MultiCallParams> = {
    [MaybeName in keyof T]: MaybeName extends keyof CallMethodTable
      ? CallMethodTable[MaybeName]["result"]
      : undefined;
  };
  export type MulticallReturnType<Callss extends MultiCallParams[]> = {
    [index in keyof Callss]: MultiCallResults<Callss[index]>;
  };

  export interface SignExecuteMethodTable {
    coordByteVecToCartesian: {
      params: SignExecuteContractMethodParams<{ coord: HexString }>;
      result: SignExecuteScriptTxResult;
    };
    cartesianToByteVec: {
      params: SignExecuteContractMethodParams<{ x: bigint; y: bigint }>;
      result: SignExecuteScriptTxResult;
    };
    getPixelFromCoordinates: {
      params: SignExecuteContractMethodParams<{ x: bigint; y: bigint }>;
      result: SignExecuteScriptTxResult;
    };
    setPixel: {
      params: SignExecuteContractMethodParams<{
        x: bigint;
        y: bigint;
        color: HexString;
        amountToBurn: bigint;
        isShiny: boolean;
      }>;
      result: SignExecuteScriptTxResult;
    };
    resetPixel: {
      params: SignExecuteContractMethodParams<{
        x: bigint;
        y: bigint;
        amountToBurn: bigint;
      }>;
      result: SignExecuteScriptTxResult;
    };
  }
  export type SignExecuteMethodParams<T extends keyof SignExecuteMethodTable> =
    SignExecuteMethodTable[T]["params"];
  export type SignExecuteMethodResult<T extends keyof SignExecuteMethodTable> =
    SignExecuteMethodTable[T]["result"];

  export type Maps = { pixels?: Map<HexString, Pixel> };
}

class Factory extends ContractFactory<
  PixelFactoryInstance,
  PixelFactoryTypes.Fields
> {
  encodeFields(fields: PixelFactoryTypes.Fields) {
    return encodeContractFields(
      addStdIdToFields(this.contract, fields),
      this.contract.fieldsSig,
      AllStructs
    );
  }

  eventIndex = { PixelSet: 0, PixelReset: 1 };
  consts = {
    ErrorCodes: {
      OutsideGrid: BigInt("0"),
      PixelNotExist: BigInt("1"),
      NotEnoughFunds: BigInt("2"),
    },
  };

  at(address: string): PixelFactoryInstance {
    return new PixelFactoryInstance(address);
  }

  tests = {
    coordByteVecToCartesian: async (
      params: TestContractParams<
        PixelFactoryTypes.Fields,
        { coord: HexString },
        PixelFactoryTypes.Maps
      >
    ): Promise<
      TestContractResult<[bigint, bigint], PixelFactoryTypes.Maps>
    > => {
      return testMethod(
        this,
        "coordByteVecToCartesian",
        params,
        getContractByCodeHash
      );
    },
    cartesianToByteVec: async (
      params: TestContractParams<
        PixelFactoryTypes.Fields,
        { x: bigint; y: bigint },
        PixelFactoryTypes.Maps
      >
    ): Promise<TestContractResult<HexString, PixelFactoryTypes.Maps>> => {
      return testMethod(
        this,
        "cartesianToByteVec",
        params,
        getContractByCodeHash
      );
    },
    getPixelFromCoordinates: async (
      params: TestContractParams<
        PixelFactoryTypes.Fields,
        { x: bigint; y: bigint },
        PixelFactoryTypes.Maps
      >
    ): Promise<TestContractResult<Pixel, PixelFactoryTypes.Maps>> => {
      return testMethod(
        this,
        "getPixelFromCoordinates",
        params,
        getContractByCodeHash
      );
    },
    setPixel: async (
      params: TestContractParams<
        PixelFactoryTypes.Fields,
        {
          x: bigint;
          y: bigint;
          color: HexString;
          amountToBurn: bigint;
          isShiny: boolean;
        },
        PixelFactoryTypes.Maps
      >
    ): Promise<TestContractResult<null, PixelFactoryTypes.Maps>> => {
      return testMethod(this, "setPixel", params, getContractByCodeHash);
    },
    resetPixel: async (
      params: TestContractParams<
        PixelFactoryTypes.Fields,
        { x: bigint; y: bigint; amountToBurn: bigint },
        PixelFactoryTypes.Maps
      >
    ): Promise<TestContractResult<null, PixelFactoryTypes.Maps>> => {
      return testMethod(this, "resetPixel", params, getContractByCodeHash);
    },
  };

  stateForTest(
    initFields: PixelFactoryTypes.Fields,
    asset?: Asset,
    address?: string,
    maps?: PixelFactoryTypes.Maps
  ) {
    return this.stateForTest_(initFields, asset, address, maps);
  }
}

// Use this object to test and deploy the contract
export const PixelFactory = new Factory(
  Contract.fromJson(
    PixelFactoryContractJson,
    "=18-2+b7=2-2+76=273-1+3=183-1+e=84+7a7e0214696e73657274206174206d617020706174683a2000=299-1+2=280+7a7e021472656d6f7665206174206d617020706174683a2000=38",
    "e34a83a6d85ce5d5bbccfde7d7db90f1964ca5b09993b7902798fea2b4579d89",
    AllStructs
  )
);
registerContract(PixelFactory);

// Use this class to interact with the blockchain
export class PixelFactoryInstance extends ContractInstance {
  constructor(address: Address) {
    super(address);
  }

  maps = {
    pixels: new RalphMap<HexString, Pixel>(
      PixelFactory.contract,
      this.contractId,
      "pixels"
    ),
  };

  async fetchState(): Promise<PixelFactoryTypes.State> {
    return fetchContractState(PixelFactory, this);
  }

  async getContractEventsCurrentCount(): Promise<number> {
    return getContractEventsCurrentCount(this.address);
  }

  subscribePixelSetEvent(
    options: EventSubscribeOptions<PixelFactoryTypes.PixelSetEvent>,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvent(
      PixelFactory.contract,
      this,
      options,
      "PixelSet",
      fromCount
    );
  }

  subscribePixelResetEvent(
    options: EventSubscribeOptions<PixelFactoryTypes.PixelResetEvent>,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvent(
      PixelFactory.contract,
      this,
      options,
      "PixelReset",
      fromCount
    );
  }

  subscribeAllEvents(
    options: EventSubscribeOptions<
      PixelFactoryTypes.PixelSetEvent | PixelFactoryTypes.PixelResetEvent
    >,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvents(
      PixelFactory.contract,
      this,
      options,
      fromCount
    );
  }

  view = {
    coordByteVecToCartesian: async (
      params: PixelFactoryTypes.CallMethodParams<"coordByteVecToCartesian">
    ): Promise<
      PixelFactoryTypes.CallMethodResult<"coordByteVecToCartesian">
    > => {
      return callMethod(
        PixelFactory,
        this,
        "coordByteVecToCartesian",
        params,
        getContractByCodeHash
      );
    },
    cartesianToByteVec: async (
      params: PixelFactoryTypes.CallMethodParams<"cartesianToByteVec">
    ): Promise<PixelFactoryTypes.CallMethodResult<"cartesianToByteVec">> => {
      return callMethod(
        PixelFactory,
        this,
        "cartesianToByteVec",
        params,
        getContractByCodeHash
      );
    },
    getPixelFromCoordinates: async (
      params: PixelFactoryTypes.CallMethodParams<"getPixelFromCoordinates">
    ): Promise<
      PixelFactoryTypes.CallMethodResult<"getPixelFromCoordinates">
    > => {
      return callMethod(
        PixelFactory,
        this,
        "getPixelFromCoordinates",
        params,
        getContractByCodeHash
      );
    },
    setPixel: async (
      params: PixelFactoryTypes.CallMethodParams<"setPixel">
    ): Promise<PixelFactoryTypes.CallMethodResult<"setPixel">> => {
      return callMethod(
        PixelFactory,
        this,
        "setPixel",
        params,
        getContractByCodeHash
      );
    },
    resetPixel: async (
      params: PixelFactoryTypes.CallMethodParams<"resetPixel">
    ): Promise<PixelFactoryTypes.CallMethodResult<"resetPixel">> => {
      return callMethod(
        PixelFactory,
        this,
        "resetPixel",
        params,
        getContractByCodeHash
      );
    },
  };

  transact = {
    coordByteVecToCartesian: async (
      params: PixelFactoryTypes.SignExecuteMethodParams<"coordByteVecToCartesian">
    ): Promise<
      PixelFactoryTypes.SignExecuteMethodResult<"coordByteVecToCartesian">
    > => {
      return signExecuteMethod(
        PixelFactory,
        this,
        "coordByteVecToCartesian",
        params
      );
    },
    cartesianToByteVec: async (
      params: PixelFactoryTypes.SignExecuteMethodParams<"cartesianToByteVec">
    ): Promise<
      PixelFactoryTypes.SignExecuteMethodResult<"cartesianToByteVec">
    > => {
      return signExecuteMethod(
        PixelFactory,
        this,
        "cartesianToByteVec",
        params
      );
    },
    getPixelFromCoordinates: async (
      params: PixelFactoryTypes.SignExecuteMethodParams<"getPixelFromCoordinates">
    ): Promise<
      PixelFactoryTypes.SignExecuteMethodResult<"getPixelFromCoordinates">
    > => {
      return signExecuteMethod(
        PixelFactory,
        this,
        "getPixelFromCoordinates",
        params
      );
    },
    setPixel: async (
      params: PixelFactoryTypes.SignExecuteMethodParams<"setPixel">
    ): Promise<PixelFactoryTypes.SignExecuteMethodResult<"setPixel">> => {
      return signExecuteMethod(PixelFactory, this, "setPixel", params);
    },
    resetPixel: async (
      params: PixelFactoryTypes.SignExecuteMethodParams<"resetPixel">
    ): Promise<PixelFactoryTypes.SignExecuteMethodResult<"resetPixel">> => {
      return signExecuteMethod(PixelFactory, this, "resetPixel", params);
    },
  };

  async multicall<Calls extends PixelFactoryTypes.MultiCallParams>(
    calls: Calls
  ): Promise<PixelFactoryTypes.MultiCallResults<Calls>>;
  async multicall<Callss extends PixelFactoryTypes.MultiCallParams[]>(
    callss: Narrow<Callss>
  ): Promise<PixelFactoryTypes.MulticallReturnType<Callss>>;
  async multicall<
    Callss extends
      | PixelFactoryTypes.MultiCallParams
      | PixelFactoryTypes.MultiCallParams[]
  >(callss: Callss): Promise<unknown> {
    return await multicallMethods(
      PixelFactory,
      this,
      callss,
      getContractByCodeHash
    );
  }
}
