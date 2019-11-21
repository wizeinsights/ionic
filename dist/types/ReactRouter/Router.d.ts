import { RouterDirection } from '@ionic/react';
import { Action as HistoryAction, Location as HistoryLocation, UnregisterCallback } from 'history';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { LocationHistory } from '../utils/LocationHistory';
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
    locationHistory: LocationHistory;
    constructor(props: RouteComponentProps);
    componentDidUpdate(_prevProps: RouteComponentProps, prevState: RouteManagerState): void;
    componentWillUnmount(): void;
    hideView(viewId: string): void;
    historyChange(location: HistoryLocation, action: HistoryAction): void;
    maybeCloneView(location: HistoryLocation, action: HistoryAction): {
        location: HistoryLocation<any>;
        action: HistoryAction;
    };
    removeCloneViews(): void;
    setActiveView(location: HistoryLocation, action: HistoryAction): void;
    removeOrphanedViews(view: ViewItem, viewStack: ViewStack): void;
    setupIonRouter(id: string, children: any, routerOutlet: HTMLIonRouterOutletElement): void;
    registerViewStack(stack: string, activeId: string | undefined, stackItems: ViewItem[], routerOutlet: HTMLIonRouterOutletElement, _location: HistoryLocation): void;
    setupRouterOutlet(routerOutlet: HTMLIonRouterOutletElement): Promise<void>;
    removeViewStack(stack: string): void;
    syncView(page: HTMLElement, viewId: string): void;
    private commitView;
    handleNavigate(type: 'push' | 'replace', path: string, direction?: RouterDirection): void;
    navigateBack(defaultHref?: string): void;
    render(): JSX.Element;
}
export declare const RouteManagerWithRouter: React.ComponentClass<Pick<RouteComponentProps<{}, import("react-router").StaticContext, any>, never>, any> & import("react-router").WithRouterStatics<typeof RouteManager>;
export {};
