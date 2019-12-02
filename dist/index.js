'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var tslib_1 = require('tslib');
var React = _interopDefault(require('react'));
var reactRouterDom = require('react-router-dom');
var react = require('@ionic/react');

let count = 0;
const generateId = () => (count++).toString();

const isDevMode = () => {
    return process && process.env && process.env.NODE_ENV === 'development';
};

const RESTRICT_SIZE = 25;
class LocationHistory {
    constructor() {
        this.locationHistory = [];
    }
    add(location) {
        this.locationHistory.push(location);
        if (this.locationHistory.length > RESTRICT_SIZE) {
            this.locationHistory.splice(0, 10);
        }
    }
    pop() {
        this.locationHistory.pop();
    }
    replace(location) {
        this.locationHistory.pop();
        this.locationHistory.push(location);
    }
    findLastLocationByUrl(url) {
        for (let i = this.locationHistory.length - 1; i >= 0; i--) {
            const location = this.locationHistory[i];
            if (location.pathname.toLocaleLowerCase() === url.toLocaleLowerCase()) {
                return location;
            }
        }
        return undefined;
    }
    previous() {
        return this.locationHistory[this.locationHistory.length - 2];
    }
    current() {
        return this.locationHistory[this.locationHistory.length - 1];
    }
}

/**
 * The holistic view of all the Routes configured for an application inside of an IonRouterOutlet.
 */
class ViewStacks {
    constructor() {
        this.viewStacks = {};
    }
    get(key) {
        return this.viewStacks[key];
    }
    set(key, viewStack) {
        this.viewStacks[key] = viewStack;
    }
    getKeys() {
        return Object.keys(this.viewStacks);
    }
    delete(key) {
        delete this.viewStacks[key];
    }
    findViewInfoByLocation(location, viewKey) {
        let view;
        let match;
        let viewStack;
        if (viewKey) {
            viewStack = this.viewStacks[viewKey];
            if (viewStack) {
                [...viewStack.views].reverse().some(matchView);
            }
        }
        else {
            const keys = this.getKeys();
            keys.some(key => {
                viewStack = this.viewStacks[key];
                return [...viewStack.views].reverse().some(matchView);
            });
        }
        const result = { view, viewStack, match };
        return result;
        function matchView(v) {
            const matchProps = {
                exact: v.routeData.childProps.exact,
                path: v.routeData.childProps.path || v.routeData.childProps.from,
                component: v.routeData.childProps.component
            };
            match = reactRouterDom.matchPath(location.pathname, matchProps);
            if (v._location &&
                location.pathname !== v._location.pathname) {
                match = null;
            }
            if (match) {
                view = v;
                return true;
            }
            return false;
        }
    }
    findViewInfoById(id = '') {
        let view;
        let viewStack;
        const keys = this.getKeys();
        keys.some(key => {
            const vs = this.viewStacks[key];
            view = vs.views.find(x => x.id === id);
            if (view) {
                viewStack = vs;
                return true;
            }
            else {
                return false;
            }
        });
        return { view, viewStack };
    }
}

const RouteManagerContext = /*@__PURE__*/ React.createContext({
    viewStacks: new ViewStacks(),
    syncView: () => { navContextNotFoundError(); },
    hideView: () => { navContextNotFoundError(); },
    setupIonRouter: () => Promise.reject(navContextNotFoundError()),
    removeViewStack: () => { navContextNotFoundError(); },
    removeCloneViews: () => { navContextNotFoundError(); },
});
function navContextNotFoundError() {
    console.error('IonReactRouter not found, did you add it to the app?');
}

/**
 * The View component helps manage the IonPage's lifecycle and registration
 */
class View extends React.Component {
    componentDidMount() {
        /**
         * If we can tell if view is a redirect, hide it so it will work again in future
         */
        const { view } = this.props;
        if (view.route.type === reactRouterDom.Redirect) {
            this.props.onHideView(view.id);
        }
        else if (view.route.type === reactRouterDom.Route && view.route.props.render) {
            if (view.route.props.render().type === reactRouterDom.Redirect) {
                this.props.onHideView(view.id);
            }
        }
    }
    componentWillUnmount() {
        if (this.ionPage) {
            this.ionPage.removeEventListener('ionViewWillEnter', this.ionViewWillEnterHandler.bind(this));
            this.ionPage.removeEventListener('ionViewDidEnter', this.ionViewDidEnterHandler.bind(this));
            this.ionPage.removeEventListener('ionViewWillLeave', this.ionViewWillLeaveHandler.bind(this));
            this.ionPage.removeEventListener('ionViewDidLeave', this.ionViewDidLeaveHandler.bind(this));
        }
    }
    ionViewWillEnterHandler() {
        this.context.ionViewWillEnter();
    }
    ionViewDidEnterHandler() {
        this.context.ionViewDidEnter();
    }
    ionViewWillLeaveHandler() {
        this.context.ionViewWillLeave();
    }
    ionViewDidLeaveHandler() {
        this.context.ionViewDidLeave();
    }
    registerIonPage(page) {
        this.ionPage = page;
        this.ionPage.addEventListener('ionViewWillEnter', this.ionViewWillEnterHandler.bind(this));
        this.ionPage.addEventListener('ionViewDidEnter', this.ionViewDidEnterHandler.bind(this));
        this.ionPage.addEventListener('ionViewWillLeave', this.ionViewWillLeaveHandler.bind(this));
        this.ionPage.addEventListener('ionViewDidLeave', this.ionViewDidLeaveHandler.bind(this));
        this.ionPage.classList.add('ion-page-invisible');
        if (isDevMode()) {
            this.ionPage.setAttribute('data-view-id', this.props.view.id);
        }
        this.props.onViewSync(page, this.props.view.id);
    }
    render() {
        return (React.createElement(react.NavContext.Consumer, null, value => {
            const newProvider = Object.assign({}, value, { registerIonPage: this.registerIonPage.bind(this) });
            return (React.createElement(react.NavContext.Provider, { value: newProvider }, this.props.children));
        }));
    }
    static get contextType() {
        return react.IonLifeCycleContext;
    }
}

/**
 * Manages the View's DOM lifetime by keeping it around long enough to complete page transitions before removing it.
 */
class ViewTransitionManager extends React.Component {
    constructor(props) {
        super(props);
        this.ionLifeCycleContext = new react.DefaultIonLifeCycleContext();
        this._isMounted = false;
        this.state = {
            show: true
        };
        this.ionLifeCycleContext.onComponentCanBeDestroyed(() => {
            if (!this.props.mount) {
                if (this._isMounted) {
                    this.setState({
                        show: false
                    }, () => {
                        this.context.hideView(this.props.id);
                        this.context.removeCloneViews();
                    });
                }
            }
        });
    }
    componentDidMount() {
        this._isMounted = true;
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    render() {
        const { show } = this.state;
        return (React.createElement(react.IonLifeCycleContext.Provider, { value: this.ionLifeCycleContext }, show && this.props.children));
    }
    static get contextType() {
        return RouteManagerContext;
    }
}

class StackManager extends React.Component {
    constructor(props) {
        super(props);
        this.routerOutletEl = React.createRef();
        this.id = this.props.id || generateId();
        this.handleViewSync = this.handleViewSync.bind(this);
        this.handleHideView = this.handleHideView.bind(this);
        this.state = {
            routerOutletReady: false
        };
    }
    componentDidMount() {
        this.context.setupIonRouter(this.id, this.props.children, this.routerOutletEl.current);
        this.routerOutletEl.current.addEventListener('routerOutletReady', () => {
            this.setState({
                routerOutletReady: true
            });
        });
    }
    componentWillUnmount() {
        this.context.removeViewStack(this.id);
    }
    handleViewSync(page, viewId) {
        this.context.syncView(page, viewId);
    }
    handleHideView(viewId) {
        this.context.hideView(viewId);
    }
    renderChild(item) {
        const component = React.cloneElement(item.route, {
            computedMatch: item.routeData.match
        });
        return component;
    }
    render() {
        const context = this.context;
        const viewStack = context.viewStacks.get(this.id);
        const views = (viewStack || { views: [] }).views.filter(x => x.show);
        const ionRouterOutlet = React.Children.only(this.props.children);
        const { routerOutletReady } = this.state;
        const childElements = routerOutletReady ? views.map(view => {
            return (React.createElement(ViewTransitionManager, { id: view.id, key: view.key, mount: view.mount },
                React.createElement(View, { onViewSync: this.handleViewSync, onHideView: this.handleHideView, view: view }, this.renderChild(view))));
        }) : React.createElement("div", null);
        const elementProps = {
            ref: this.routerOutletEl
        };
        if (isDevMode()) {
            elementProps['data-stack-id'] = this.id;
        }
        const routerOutletChild = React.cloneElement(ionRouterOutlet, elementProps, childElements);
        return routerOutletChild;
    }
    static get contextType() {
        return RouteManagerContext;
    }
}

class NavManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            goBack: this.goBack.bind(this),
            hasIonicRouter: () => true,
            navigate: this.navigate.bind(this),
            getStackManager: this.getStackManager.bind(this),
            getPageManager: this.getPageManager.bind(this),
            currentPath: this.props.location.pathname,
            registerIonPage: () => { return; },
            tabNavigate: this.tabNavigate.bind(this)
        };
        this.listenUnregisterCallback = this.props.history.listen((location) => {
            this.setState({
                currentPath: location.pathname
            });
        });
        if (document) {
            document.addEventListener('ionBackButton', (e) => {
                e.detail.register(0, () => {
                    this.props.history.goBack();
                });
            });
        }
    }
    componentWillUnmount() {
        if (this.listenUnregisterCallback) {
            this.listenUnregisterCallback();
        }
    }
    goBack(defaultHref) {
        this.props.onNavigateBack(defaultHref);
    }
    navigate(path, direction) {
        this.props.onNavigate('push', path, direction);
    }
    tabNavigate(path) {
        this.props.onNavigate('replace', path, 'back');
    }
    getPageManager() {
        return (children) => children;
    }
    getStackManager() {
        return StackManager;
    }
    render() {
        return (React.createElement(react.NavContext.Provider, { value: this.state }, this.props.children));
    }
}

class RouteManager extends React.Component {
    constructor(props) {
        super(props);
        this.locationHistory = new LocationHistory();
        this.listenUnregisterCallback = this.props.history.listen(this.historyChange.bind(this));
        this.handleNavigate = this.handleNavigate.bind(this);
        this.navigateBack = this.navigateBack.bind(this);
        this.state = {
            viewStacks: new ViewStacks(),
            hideView: this.hideView.bind(this),
            setupIonRouter: this.setupIonRouter.bind(this),
            removeViewStack: this.removeViewStack.bind(this),
            syncView: this.syncView.bind(this),
            removeCloneViews: this.removeCloneViews.bind(this),
        };
        this.locationHistory.add({
            hash: window.location.hash,
            key: generateId(),
            pathname: window.location.pathname,
            search: window.location.search,
            state: {}
        });
    }
    componentDidUpdate(_prevProps, prevState) {
        // Trigger a page change if the location or action is different
        if (this.state.location && prevState.location !== this.state.location || prevState.action !== this.state.action) {
            this.setActiveView(this.state.location, this.state.action);
        }
    }
    componentWillUnmount() {
        if (this.listenUnregisterCallback) {
            this.listenUnregisterCallback();
        }
    }
    hideView(viewId) {
        const viewStacks = Object.assign(new ViewStacks(), this.state.viewStacks);
        const { view } = viewStacks.findViewInfoById(viewId);
        if (view) {
            view.show = false;
            view.ionPageElement = undefined;
            view.isIonRoute = false;
            view.prevId = undefined;
            view.key = generateId();
            this.setState({
                viewStacks
            });
        }
    }
    historyChange(location, action) {
        location.state = Object.assign({}, (location.state || {}), { direction: this.currentDirection });
        this.currentDirection = undefined;
        if (action === 'PUSH') {
            this.locationHistory.add(location);
        }
        else if ((action === 'REPLACE' && location.state.direction === 'back') || action === 'POP') {
            this.locationHistory.pop();
        }
        else {
            this.locationHistory.replace(location);
        }
        this.maybeCloneView(location, action);
        this.setState({
            location,
            action
        });
    }
    maybeCloneView(location, action) {
        const direction = (location.state && location.state.direction) || 'forward';
        // clone view if location in history
        if (direction === 'forward' && action === 'PUSH') {
            let matchedViewInfo;
            let matchedStack;
            const viewStackKeys = this.state.viewStacks.getKeys();
            viewStackKeys.some(key => {
                const viewInfo = this.state.viewStacks.findViewInfoByLocation(location, key);
                if (viewInfo.view) {
                    matchedViewInfo = viewInfo;
                    matchedStack = this.state.viewStacks.get(key);
                    return true;
                }
                return false;
            });
            if (matchedViewInfo && matchedStack) {
                const { view, match } = matchedViewInfo;
                if (view.show) {
                    const cloneView = Object.assign({}, view, { _location: location, id: generateId(), key: generateId(), routeData: {
                            match,
                            childProps: view.routeData.childProps
                        }, ionPageElement: undefined, mount: false, show: false, isIonRoute: false, prevId: null });
                    matchedStack.views.push(cloneView);
                    matchedStack.activeViewIdQueue.push(cloneView.id);
                }
                else {
                    matchedStack.activeViewIdQueue.push(view.id);
                }
            }
        }
        return {
            location,
            action
        };
    }
    removeCloneViews() {
        let matchedViewInfo;
        let matchedStack;
        const viewStackKeys = this.state.viewStacks.getKeys();
        viewStackKeys.some(key => {
            const viewInfo = this.state.viewStacks.findViewInfoByLocation(this.state.location, key);
            if (viewInfo.view) {
                matchedViewInfo = viewInfo;
                matchedStack = this.state.viewStacks.get(key);
                return true;
            }
            return false;
        });
        if (matchedViewInfo && matchedStack) {
            const enteringView = matchedViewInfo.view;
            const enteringIndex = matchedStack.activeViewIdQueue.indexOf(enteringView.id);
            const removeViewIds = new Set(matchedStack.activeViewIdQueue.slice(enteringIndex + 1));
            const filteredViews = matchedStack.views.filter((v) => !(v._location && removeViewIds.has(v.id)));
            matchedStack.views = filteredViews;
            matchedStack.activeViewIdQueue = matchedStack.activeViewIdQueue.slice(0, enteringIndex + 1);
        }
    }
    setActiveView(location, action) {
        const viewStacks = Object.assign(new ViewStacks(), this.state.viewStacks);
        let direction = (location.state && location.state.direction) || 'forward';
        let leavingView;
        const viewStackKeys = viewStacks.getKeys();
        viewStackKeys.forEach(key => {
            const { view: enteringView, viewStack: enteringViewStack, match } = viewStacks.findViewInfoByLocation(location, key);
            if (!enteringView || !enteringViewStack) {
                return;
            }
            leavingView = viewStacks.findViewInfoById(this.activeIonPageId).view;
            if (enteringView.isIonRoute) {
                enteringView.show = true;
                enteringView.mount = true;
                enteringView.routeData.match = match;
                this.activeIonPageId = enteringView.id;
                if (leavingView) {
                    if (direction === 'forward') {
                        if (action === 'PUSH') {
                            /**
                             * If the page is being pushed into the stack by another view,
                             * record the view that originally directed to the new view for back button purposes.
                             */
                            enteringView.prevId = leavingView.id;
                        }
                        else if (action === 'POP') {
                            direction = leavingView.prevId === enteringView.id ? 'back' : 'none';
                        }
                        else {
                            direction = direction || 'back';
                            leavingView.mount = false;
                        }
                    }
                    if (direction === 'back' || action === 'REPLACE') {
                        leavingView.mount = false;
                        this.removeOrphanedViews(enteringView, enteringViewStack);
                    }
                }
                else {
                    // If there is not a leavingView, then we shouldn't provide a direction
                    direction = undefined;
                }
            }
            else {
                enteringView.show = true;
                enteringView.mount = true;
                enteringView.routeData.match = match;
            }
        });
        if (leavingView) {
            if (!leavingView.isIonRoute) {
                leavingView.mount = false;
                leavingView.show = false;
            }
        }
        this.setState({
            viewStacks
        }, () => {
            const { view: enteringView, viewStack } = this.state.viewStacks.findViewInfoById(this.activeIonPageId);
            if (enteringView && viewStack) {
                const enteringEl = enteringView.ionPageElement ? enteringView.ionPageElement : undefined;
                const leavingEl = leavingView && leavingView.ionPageElement ? leavingView.ionPageElement : undefined;
                if (enteringEl) {
                    // Don't animate from an empty view
                    const navDirection = leavingEl && leavingEl.innerHTML === '' ? undefined : direction === 'none' ? undefined : direction;
                    const shouldGoBack = !!enteringView.prevId || !!this.locationHistory.previous();
                    this.commitView(enteringEl, leavingEl, viewStack.routerOutlet, navDirection, shouldGoBack);
                }
                else if (leavingEl) {
                    leavingEl.classList.add('ion-page-hidden');
                    leavingEl.setAttribute('aria-hidden', 'true');
                }
                // Warn if an IonPage was not eventually rendered in Dev Mode
                if (isDevMode()) {
                    if (enteringView.routeData.match.url !== location.pathname) {
                        setTimeout(() => {
                            const { view } = this.state.viewStacks.findViewInfoById(this.activeIonPageId);
                            if (view.routeData.match.url !== location.pathname) {
                                console.warn('No IonPage was found to render. Make sure you wrap your page with an IonPage component.');
                            }
                        }, 100);
                    }
                }
            }
        });
    }
    removeOrphanedViews(view, viewStack) {
        // Note: This technique is a bit wonky for views that reference each other and get into a circular loop.
        // It can still remove a view that probably shouldn't be.
        const viewsToRemove = viewStack.views.filter(v => v.prevId === view.id);
        viewsToRemove.forEach(v => {
            // Don't remove if view is currently active
            if (v.id !== this.activeIonPageId) {
                this.removeOrphanedViews(v, viewStack);
                // If view is not currently visible, go ahead and remove it from DOM
                if (v.ionPageElement.classList.contains('ion-page-hidden')) {
                    v.show = false;
                    v.ionPageElement = undefined;
                    v.isIonRoute = false;
                    v.prevId = undefined;
                    v.key = generateId();
                }
                v.mount = false;
            }
        });
    }
    setupIonRouter(id, children, routerOutlet) {
        const views = [];
        let activeId;
        const ionRouterOutlet = React.Children.only(children);
        React.Children.forEach(ionRouterOutlet.props.children, (child) => {
            views.push(createViewItem(child, this.props.history.location));
        });
        this.registerViewStack(id, activeId, views, routerOutlet, this.props.location);
        function createViewItem(child, location) {
            const viewId = generateId();
            const key = generateId();
            const route = child;
            const matchProps = {
                exact: child.props.exact,
                path: child.props.path || child.props.from,
                component: child.props.component
            };
            const match = reactRouterDom.matchPath(location.pathname, matchProps);
            const view = {
                id: viewId,
                key,
                routeData: {
                    match,
                    childProps: child.props
                },
                route,
                mount: true,
                show: !!match,
                isIonRoute: false
            };
            if (match && view.isIonRoute) {
                activeId = viewId;
            }
            return view;
        }
    }
    registerViewStack(stack, activeId, stackItems, routerOutlet, _location) {
        this.setState(prevState => {
            const prevViewStacks = Object.assign(new ViewStacks(), prevState.viewStacks);
            const newStack = {
                id: stack,
                views: stackItems,
                routerOutlet,
                activeViewIdQueue: [],
            };
            if (activeId) {
                this.activeIonPageId = activeId;
            }
            prevViewStacks.set(stack, newStack);
            return {
                viewStacks: prevViewStacks
            };
        }, () => {
            this.setupRouterOutlet(routerOutlet);
        });
    }
    async setupRouterOutlet(routerOutlet) {
        const waitUntilReady = async () => {
            if (routerOutlet.componentOnReady) {
                routerOutlet.dispatchEvent(new Event('routerOutletReady'));
                return;
            }
            else {
                setTimeout(() => {
                    waitUntilReady();
                }, 0);
            }
        };
        await waitUntilReady();
        const canStart = () => {
            const config = react.getConfig();
            const swipeEnabled = config && config.get('swipeBackEnabled', routerOutlet.mode === 'ios');
            if (swipeEnabled) {
                const { view } = this.state.viewStacks.findViewInfoById(this.activeIonPageId);
                return !!(view && view.prevId);
            }
            else {
                return false;
            }
        };
        const onStart = () => {
            this.navigateBack();
        };
        routerOutlet.swipeHandler = {
            canStart,
            onStart,
            onEnd: _shouldContinue => true
        };
    }
    removeViewStack(stack) {
        const viewStacks = Object.assign(new ViewStacks(), this.state.viewStacks);
        viewStacks.delete(stack);
        this.setState({
            viewStacks
        });
    }
    syncView(page, viewId) {
        this.setState(state => {
            const viewStacks = Object.assign(new ViewStacks(), state.viewStacks);
            const { view } = viewStacks.findViewInfoById(viewId);
            view.ionPageElement = page;
            view.isIonRoute = true;
            return {
                viewStacks
            };
        }, () => {
            this.setActiveView(this.state.location || this.props.location, this.state.action);
        });
    }
    async commitView(enteringEl, leavingEl, ionRouterOuter, direction, showGoBack) {
        if (enteringEl === leavingEl) {
            return;
        }
        await ionRouterOuter.commit(enteringEl, leavingEl, {
            deepWait: true,
            duration: direction === undefined ? 0 : undefined,
            direction,
            showGoBack,
            progressAnimation: false
        });
        if (leavingEl && (enteringEl !== leavingEl)) {
            /** add hidden attributes */
            leavingEl.classList.add('ion-page-hidden');
            leavingEl.setAttribute('aria-hidden', 'true');
        }
    }
    handleNavigate(type, path, direction) {
        this.currentDirection = direction;
        if (type === 'push') {
            this.props.history.push(path);
        }
        else {
            this.props.history.replace(path);
        }
    }
    navigateBack(defaultHref) {
        const { view: activeIonPage } = this.state.viewStacks.findViewInfoById(this.activeIonPageId);
        if (activeIonPage) {
            const { view: enteringView } = this.state.viewStacks.findViewInfoById(activeIonPage.prevId);
            if (enteringView) {
                const lastLocation = this.locationHistory.findLastLocationByUrl(enteringView.routeData.match.url);
                if (lastLocation) {
                    this.handleNavigate('replace', lastLocation.pathname + lastLocation.search, 'back');
                }
                else {
                    this.handleNavigate('replace', enteringView.routeData.match.url, 'back');
                }
            }
            else {
                const currentLocation = this.locationHistory.previous();
                if (currentLocation) {
                    this.handleNavigate('replace', currentLocation.pathname + currentLocation.search, 'back');
                }
                else {
                    if (defaultHref) {
                        this.handleNavigate('replace', defaultHref, 'back');
                    }
                }
            }
        }
        else {
            if (defaultHref) {
                this.handleNavigate('replace', defaultHref, 'back');
            }
        }
    }
    render() {
        return (React.createElement(RouteManagerContext.Provider, { value: this.state },
            React.createElement(NavManager, Object.assign({}, this.props, { onNavigateBack: this.navigateBack, onNavigate: this.handleNavigate }), this.props.children)));
    }
}
const RouteManagerWithRouter = reactRouterDom.withRouter(RouteManager);
RouteManagerWithRouter.displayName = 'RouteManager';

class IonReactRouter extends React.Component {
    render() {
        const _a = this.props, { children } = _a, props = tslib_1.__rest(_a, ["children"]);
        return (React.createElement(reactRouterDom.BrowserRouter, Object.assign({}, props),
            React.createElement(RouteManagerWithRouter, null, children)));
    }
}

class IonReactHashRouter extends React.Component {
    render() {
        const _a = this.props, { children } = _a, props = tslib_1.__rest(_a, ["children"]);
        return (React.createElement(reactRouterDom.HashRouter, Object.assign({}, props),
            React.createElement(RouteManagerWithRouter, null, children)));
    }
}

exports.IonReactHashRouter = IonReactHashRouter;
exports.IonReactRouter = IonReactRouter;
exports.IonRouteManager = RouteManagerWithRouter;
//# sourceMappingURL=index.js.map
