import React from 'react';
import { RouteManagerContext } from './RouteManagerContext';
interface ViewTransitionManagerProps {
    id: string;
    mount: boolean;
}
interface ViewTransitionManagerState {
    show: boolean;
}
/**
 * Manages the View's DOM lifetime by keeping it around long enough to complete page transitions before removing it.
 */
export declare class ViewTransitionManager extends React.Component<ViewTransitionManagerProps, ViewTransitionManagerState> {
    ionLifeCycleContext: {
        ionViewWillEnterCallback?: (() => void) | undefined;
        ionViewDidEnterCallback?: (() => void) | undefined;
        ionViewWillLeaveCallback?: (() => void) | undefined;
        ionViewDidLeaveCallback?: (() => void) | undefined;
        componentCanBeDestroyedCallback?: (() => void) | undefined;
        onIonViewWillEnter(callback: () => void): void;
        ionViewWillEnter(): void;
        onIonViewDidEnter(callback: () => void): void;
        ionViewDidEnter(): void;
        onIonViewWillLeave(callback: () => void): void;
        ionViewWillLeave(): void;
        onIonViewDidLeave(callback: () => void): void;
        ionViewDidLeave(): void;
        onComponentCanBeDestroyed(callback: () => void): void;
        componentCanBeDestroyed(): void;
    };
    _isMounted: boolean;
    context: React.ContextType<typeof RouteManagerContext>;
    constructor(props: ViewTransitionManagerProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
    static readonly contextType: React.Context<import("./RouteManagerContext").RouteManagerContextState>;
}
export {};
