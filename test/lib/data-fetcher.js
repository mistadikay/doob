import chai, { expect } from 'chai';
import spies from 'chai-spies';
import React from 'react';
import ReactDOM from 'react-dom';

import { getRenderedDOM } from 'test/helpers/render';

import State from 'lib/state';
import DataInit from 'lib/data-init';
import DataFetcher from 'lib/data-fetcher';
import DataWatcher from 'lib/data-watcher';

chai.use(spies);

describe('data-fetcher', function() {
    beforeEach(function() {
        const firstPath = [ 'test', 'one' ];
        const secondPath = [ 'test', 'two' ];
        const thirdPath = [ 'test', 'three' ];
        const fourthPath = [ 'test', 'four' ];

        this.firstPath = firstPath;
        this.secondPath = secondPath;
        this.thirdPath = thirdPath;
        this.fourthPath = fourthPath;

        this.state = new State({
            shouldBeUnmounted: false,
            test: {
                modest: 'hi'
            }
        }, {
            asynchronous: false
        });

        this.callback = chai.spy(function() {});

        // component
        class Component extends React.Component {
            render() {
                return (
                    <div>
                        { this.props.test }
                        { this.props.two }
                        { this.props.three }
                        { this.props.four }
                    </div>
                );
            }
        }

        this.Component = DataWatcher(() => ({
            one: firstPath,
            two: secondPath,
            three: thirdPath,
            four: fourthPath
        }))(Component);
        const PatchedComponent = this.Component;

        // parent
        class ParentComponent extends React.Component {
            render() {
                return (
                    <PatchedComponent />
                );
            }
        }
        this.ParentComponent = DataFetcher([
            () => [
                {
                    path: firstPath,
                    callback: this.callback
                },
                {
                    path: thirdPath,
                    callback: this.callback
                }
            ]
        ])(ParentComponent);
        const PatchedParentComponent = this.ParentComponent;

        // parent2
        class ParentComponent2 extends React.Component {
            render() {
                return (
                    <PatchedComponent />
                );
            }
        }
        this.ParentComponent2 = DataFetcher([
            () => [
                {
                    path: secondPath,
                    callback: this.callback
                },
                {
                    path: thirdPath,
                    callback: this.callback
                }
            ]
        ])(ParentComponent2);
        const PatchedParentComponent2 = this.ParentComponent2;

        class AppComponent extends React.Component {
            _renderParent() {
                if (!this.props.shouldBeUnmounted) {
                    return <PatchedParentComponent />;
                }

                return null;
            }

            render() {
                return (
                    <div>
                        { this._renderParent() }
                        <PatchedParentComponent2 />
                    </div>
                );
            }
        }

        this.renderApp = function(state) {
            return getRenderedDOM(
                DataInit(state)(
                    DataWatcher(() => ({
                        shouldBeUnmounted: [ 'shouldBeUnmounted' ]
                    }))(AppComponent)
                )
            );
        };

        this.render = function(state) {
            return getRenderedDOM(
                DataInit(state)(
                    DataFetcher([
                        () => [
                            {
                                path: firstPath,
                                callback: this.callback
                            },
                            {
                                path: thirdPath,
                                callback: this.callback
                            }
                        ]
                    ])(this.Component)
                )
            );
        };
    });

    it('exists', function() {
        expect(DataFetcher).to.exist;
    });

    it('should throw error when missing state', function() {
        try {
            this.render();
        } catch (e) {
            expect(this.render).to.throw(Error);
        }
    });

    it('should be registered in state on mount', function() {
        this.render(this.state);
        this.render(this.state);
        this.render(this.state);

        expect(this.state._fetchers.length).to.be.equal(3);
    });

    it('should be unregistered from state when unmounted', function() {
        const mountedComponent = this.render(this.state);

        ReactDOM.unmountComponentAtNode(mountedComponent.parentNode);

        expect(this.state._fetchers.length).to.be.equal(0);
    });

    it('should call fetcher when mounted', function() {
        this.render(this.state);

        expect(this.callback).to.be.called();
    });

    it('should process correctly DataWatcher paths when mounted', function() {
        this.render(this.state);

        expect(this.state._watchingQueue).to.have.length(2);
        expect(this.state._watchingPaths).to.have.length(2);
        expect(this.state._watchingQueue[0]).to.be.deep.equal(this.secondPath);
        expect(this.state._watchingPaths[0]).to.be.deep.equal(this.firstPath);
    });

    it('should process correctly DataWatcher paths when unmounted', function() {
        const mountedComponent = this.render(this.state);

        ReactDOM.unmountComponentAtNode(mountedComponent.parentNode);

        expect(this.state._watchingQueue).to.have.length(0);
        expect(this.state._watchingPaths).to.have.length(0);
    });

    it('should process correctly DataWatcher paths when one of DataFetchers unmounted', function() {
        this.renderApp(this.state);
        this.state.setIn([ 'shouldBeUnmounted' ], true);

        expect(this.state._watchingQueue).to.have.length(3);
        expect(this.state._watchingPaths).to.have.length(2);
    });
});
