import React, { ReactNode } from 'react';
import { ViewStacks } from './ViewStacks';
export interface RouteManagerContextState {
    syncView: (page: HTMLElement, viewId: string) => void;
    hideView: (viewId: string) => void;
    viewStacks: ViewStacks;
    setupIonRouter: (id: string, children: ReactNode, routerOutlet: HTMLIonRouterOutletElement) => Promise<void>;
    removeViewStack: (stack: string) => void;
    removeCloneView: (viewId: string) => void;
}
export declare const RouteManagerContext: React.Context<RouteManagerContextState>;
