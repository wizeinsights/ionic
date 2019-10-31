import { IonLifeCycleContext } from '@ionic/react';
import React from 'react';
import { ViewItem } from './ViewItem';
interface ViewProps extends React.HTMLAttributes<HTMLElement> {
    onViewSync: (page: HTMLElement, viewId: string) => void;
    onHideView: (viewId: string) => void;
    view: ViewItem;
}
/**
 * The View component helps manage the IonPage's lifecycle and registration
 */
export declare class View extends React.Component<ViewProps, {}> {
    context: React.ContextType<typeof IonLifeCycleContext>;
    ionPage?: HTMLElement;
    componentDidMount(): void;
    componentWillUnmount(): void;
    ionViewWillEnterHandler(): void;
    ionViewDidEnterHandler(): void;
    ionViewWillLeaveHandler(): void;
    ionViewDidLeaveHandler(): void;
    registerIonPage(page: HTMLElement): void;
    render(): JSX.Element;
    static readonly contextType: React.Context<import("@ionic/react").IonLifeCycleContextInterface>;
}
export {};
