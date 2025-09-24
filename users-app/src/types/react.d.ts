declare module 'react' {
  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }

  export type ReactNode = ReactElement | string | number | ReactFragment | ReactPortal | boolean | null | undefined;

  export interface ReactFragment {
    key?: string | number | null;
    children?: ReactNode;
  }

  export interface ReactPortal extends ReactElement {
    children: ReactNode;
  }

  export type Key = string | number;

  export type JSXElementConstructor<P> = ((props: P) => ReactElement<any, any> | null) | (new (props: P) => Component<any, any>);

  export interface Component<P = {}, S = {}> {
    props: P;
    state: S;
    context: any;
    refs: any;
    forceUpdate(callback?: () => void): void;
    render(): ReactElement<any, any> | null;
    setState<K extends keyof S>(state: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null), callback?: () => void): void;
  }

  export function useState<S>(initialState: S | (() => S)): [S, (value: S | ((prevState: S) => S)) => void];
  export function useState<S = undefined>(): [S | undefined, (value: S | ((prevState: S | undefined) => S | undefined)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
  export function useMemo<T>(factory: () => T, deps: any[] | undefined): T;
  export function useRef<T>(initialValue: T): { current: T };
  export function useRef<T = undefined>(): { current: T | undefined };
  export function createElement<P extends {}>(type: string | JSXElementConstructor<P>, props: P | null, ...children: ReactNode[]): ReactElement<P>;
  export function Fragment(props: { children?: ReactNode }): ReactElement<{ children?: ReactNode }>;
  export default React;
}

declare namespace React {
  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }

  export type ReactNode = ReactElement | string | number | ReactFragment | ReactPortal | boolean | null | undefined;

  export interface ReactFragment {
    key?: string | number | null;
    children?: ReactNode;
  }

  export interface ReactPortal extends ReactElement {
    children: ReactNode;
  }

  export type Key = string | number;

  export type JSXElementConstructor<P> = ((props: P) => ReactElement<any, any> | null) | (new (props: P) => Component<any, any>);

  export interface Component<P = {}, S = {}> {
    props: P;
    state: S;
    context: any;
    refs: any;
    forceUpdate(callback?: () => void): void;
    render(): ReactElement<any, any> | null;
    setState<K extends keyof S>(state: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null), callback?: () => void): void;
  }

  export function useState<S>(initialState: S | (() => S)): [S, (value: S | ((prevState: S) => S)) => void];
  export function useState<S = undefined>(): [S | undefined, (value: S | ((prevState: S | undefined) => S | undefined)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
  export function useMemo<T>(factory: () => T, deps: any[] | undefined): T;
  export function useRef<T>(initialValue: T): { current: T };
  export function useRef<T = undefined>(): { current: T | undefined };
  export function createElement<P extends {}>(type: string | JSXElementConstructor<P>, props: P | null, ...children: ReactNode[]): ReactElement<P>;
  export function Fragment(props: { children?: ReactNode }): ReactElement<{ children?: ReactNode }>;
}
