import { components } from "api/portals-schema";

export declare type Maybe<T> = Partial<T> | null | undefined;
export declare type STATUS_TYPE = "connected" | "disconnected" | "onboarding";
export declare type SupportedNetworks =
  | "polygon"
  | "ethereum"
  | "optimism"
  | "fantom"
  | "arbitrum"
  | "avalanche"
  | "bsc";

export interface IState {
  network: {
    available: SupportedNetworks[];
    selected: SupportedNetworks;
  };
  platforms: components["schemas"]["SupportedPlatformsV2Response"][];
  accounts: {
    list: string[];
    status: STATUS_TYPE;
    selected: string;
    selectedBalances: components["schemas"]["BalanceResponseDto"][];
  };
}

export const initialState: IState = {
  network: {
    available: [],
    selected: "ethereum",
  },
  platforms: [],
  accounts: {
    list: [],
    status: "disconnected",
    selected: "",
    selectedBalances: [],
  },
};

export enum actionTypes {
  SET_SELECTED_NETWORK = "SET_SELECTED_NETWORK",
  SET_AVAILABLE_NETWORKS = "SET_AVAILABLE_NETWORKS",
  SET_PLATFORMS_LIST = "SET_PLATFORMS_LIST",
  SET_ACCOUNTS_LIST = "SET_ACCOUNTS_LIST",
  SET_ACCOUNT_STATUS = "SET_ACCOUNT_STATUS",
  SET_SELECTED_ACCOUNT = "SET_SELECTED_ACCOUNT",
  SET_SELECTED_ACCOUNT_BALANCES = "SET_SELECTED_ACCOUNT_BALANCES",
}

export type IAction =
  | {
      type: actionTypes.SET_SELECTED_NETWORK;
      value: SupportedNetworks;
    }
  | {
      type: actionTypes.SET_AVAILABLE_NETWORKS;
      value: SupportedNetworks[];
    }
  | {
      type: actionTypes.SET_PLATFORMS_LIST;
      value: components["schemas"]["SupportedPlatformsV2Response"][];
    }
  | {
      type: actionTypes.SET_ACCOUNTS_LIST;
      value: string[];
    }
  | {
      type: actionTypes.SET_ACCOUNT_STATUS;
      value: STATUS_TYPE;
    }
  | {
      type: actionTypes.SET_SELECTED_ACCOUNT;
      value: string;
    }
  | {
      type: actionTypes.SET_SELECTED_ACCOUNT_BALANCES;
      value: components["schemas"]["BalanceResponseDto"][];
    };

const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case actionTypes.SET_AVAILABLE_NETWORKS:
      return {
        ...state,
        network: {
          ...state.network,
          available: action.value,
        },
      };
    case actionTypes.SET_SELECTED_NETWORK:
      return {
        ...state,
        network: {
          ...state.network,
          selected: action.value,
        },
      };
    case actionTypes.SET_PLATFORMS_LIST:
      return {
        ...state,
        platforms: action.value,
      };
    case actionTypes.SET_ACCOUNTS_LIST:
      return {
        ...state,
        accounts: {
          ...state.accounts,
          list: action.value,
          selected: action.value[0] || "",
        },
      };
    case actionTypes.SET_ACCOUNT_STATUS:
      return {
        ...state,
        accounts: {
          ...state.accounts,
          status: action.value,
        },
      };
    case actionTypes.SET_SELECTED_ACCOUNT:
      return {
        ...state,
        accounts: {
          ...state.accounts,
          selected: action.value,
        },
      };
    case actionTypes.SET_SELECTED_ACCOUNT_BALANCES:
      return {
        ...state,
        accounts: {
          ...state.accounts,
          selectedBalances: action.value,
        },
      };
    default:
      return state;
  }
};

export default reducer;
