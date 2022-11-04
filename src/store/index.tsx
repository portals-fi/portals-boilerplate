import { createContext, ReactElement, useContext, useReducer } from "react";
import reducer, { IAction, initialState, IState } from "./Reducer";

const StateContext = createContext<IState | any>(initialState);

interface StateProps {
  children: ReactElement;
}

export const StoreProvider = ({ children }: StateProps): ReactElement => {
  return (
    <StateContext.Provider value={useReducer(reducer, initialState)}>
      {children}
    </StateContext.Provider>
  );
};

export const useStore = () =>
  useContext<[IState, (action: IAction) => void]>(StateContext);
