import { batch } from "react-redux";
import { AnyAction, combineReducers, createStore, Middleware, Store } from "redux";
import serial, { SerialState } from "./reducers/serial";
import wizard, { WizardState } from "./reducers/wizard";

export interface RootState {
  serial: SerialState;
  wizard: WizardState;
}

export class Loadable<T> {
  readonly loading: boolean;
  readonly value?: T;

  static new<T>(): Loadable<T> {
    return new Loadable<T>();
  }

  constructor(loading?: boolean, value?: T) {
    this.loading = loading || false;
    this.value = value;
  }
}

const reducers = combineReducers<RootState>({
  serial,
  wizard,
});

const batcher: Middleware = (store) => (next) => {
  let queuedActions: AnyAction[] = [];
  let timeout: number | undefined = undefined;

  return (action: AnyAction) => {
    if (!action.batch) {
      return next(action);
    }
    queuedActions.push(action);

    if (!timeout) {
      timeout = window.setTimeout(() => {
        batch(() => {
          queuedActions.forEach((action) => next(action));
        });
        queuedActions = [];
        timeout = undefined;
      }, 500);
    }
  };
};

export default function configureStore(): Store {
  console.log("load enhancer");
  console.log("create store");
  const store = createStore(reducers);
  return store;
}
