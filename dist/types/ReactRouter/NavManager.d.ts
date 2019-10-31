import { RouterDirection } from '@ionic/core';
import { NavContextState } from '@ionic/react';
import { Location as HistoryLocation, UnregisterCallback } from 'history';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { LocationHistory } from '../utils/LocationHistory';
import { StackManager } from './StackManager';
import { ViewItem } from './ViewItem';
import { ViewStack } from './ViewStacks';
interface NavManagerProps extends RouteComponentProps {
    findViewInfoByLocation: (location: HistoryLocation) => {
        view?: ViewItem;
        viewStack?: ViewStack;
    };
    findViewInfoById: (id: string) => {
        view?: ViewItem;
        viewStack?: ViewStack;
    };
    getActiveIonPage: () => {
        view?: ViewItem;
        viewStack?: ViewStack;
    };
    onNavigate: (type: 'push' | 'replace', path: string, state?: any) => void;
}
export declare class NavManager extends React.Component<NavManagerProps, NavContextState> {
    listenUnregisterCallback: UnregisterCallback | undefined;
    locationHistory: LocationHistory;
    constructor(props: NavManagerProps);
    componentWillUnmount(): void;
    goBack(defaultHref?: string): void;
    navigate(path: string, direction?: RouterDirection | 'none'): void;
    tabNavigate(path: string): void;
    getPageManager(): (children: any) => any;
    getStackManager(): typeof StackManager;
    render(): JSX.Element;
}
export {};
