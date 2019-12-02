import React, { ReactNode } from 'react';
import { ViewStacks } from './ViewStacks';
export interface RouteManagerContextState {
    syncView: (page: HTMLElement, viewId: string) => void;
    hideView: (viewId: string) => void;
    viewStacks: ViewStacks;
    setupIonRouter: (id: string, children: ReactNode, routerOutlet: HTMLIonRouterOutletElement) => void;
    removeViewStack: (stack: string) => void;
    removeCloneViews: () => void;
}
export declare const RouteManagerContext: React.Context<RouteManagerContextState>;
