import { NavDirection } from '@ionic/core';
import { RouterDirection } from '@ionic/react';
import { Action as HistoryAction, Location as HistoryLocation, UnregisterCallback } from 'history';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { RouteManagerContextState } from './RouteManagerContext';
import { ViewItem } from './ViewItem';
import { ViewStack } from './ViewStacks';
interface RouteManagerState extends RouteManagerContextState {
    location?: HistoryLocation;
    action?: HistoryAction;
}
declare class RouteManager extends React.Component<RouteComponentProps, RouteManagerState> {
    listenUnregisterCallback: UnregisterCallback | undefined;
    activeIonPageId?: string;
    currentDirection?: RouterDirection;
    constructor(props: RouteComponentProps);
    componentDidUpdate(_prevProps: RouteComponentProps, prevState: RouteManagerState): void;
    componentWillUnmount(): void;
    hideView(viewId: string): void;
    historyChange(location: HistoryLocation, action: HistoryAction): void;
    setActiveView(location: HistoryLocation, action: HistoryAction): void;
    fixLocation(location: HistoryLocation, action: HistoryAction): {
        location: HistoryLocation<any>;
        action: HistoryAction;
    };
    removeCloneView(): void;
    removeOrphanedViews(view: ViewItem, viewStack: ViewStack): void;
    setupIonRouter(id: string, children: any, routerOutlet: HTMLIonRouterOutletElement): Promise<void>;
    registerViewStack(stack: string, activeId: string | undefined, stackItems: ViewItem[], routerOutlet: HTMLIonRouterOutletElement, _location: HistoryLocation): Promise<unknown>;
    removeViewStack(stack: string): void;
    syncView(page: HTMLElement, viewId: string): void;
    transitionView(enteringEl: HTMLElement, leavingEl: HTMLElement, ionRouterOutlet: HTMLIonRouterOutletElement | undefined, direction: NavDirection | undefined, showGoBack: boolean): void;
    private commitView;
    handleNavigate(type: 'push' | 'replace', path: string, direction?: RouterDirection): void;
    render(): JSX.Element;
}
export declare const RouteManagerWithRouter: React.ComponentClass<Pick<RouteComponentProps<{}, import("react-router").StaticContext, any>, never>, any> & import("react-router").WithRouterStatics<typeof RouteManager>;
export {};
