import chai, { expect } from 'chai';
import spies from 'chai-spies';
import React from 'react';

import { getRenderedDOM } from 'test/helpers/render';

import State from 'lib/state';
import DataInit from 'lib/data-init';
import DataSender from 'lib/data-sender';
import DataWatcher from 'lib/data-watcher';

chai.use(spies);

describe('data-sender', function() {
    beforeEach(function() {
        const firstPath = [ 'test', 'one' ];
        const secondPath = [ 'test', 'two' ];
        const thirdPath = [ 'test', 'three' ];

        this.state = new State({
            shouldBeUnmounted: false,
            test: {
            }
        }, {
            asynchronous: false
        });

        this.callback = chai.spy(function() {});

        class Component extends React.Component {
            render() {
                return (
                    <div></div>
                );
            }
        }
        this.Component = Component;

        // parent
        class ParentComponent extends React.Component {
            render() {
                return (
                    <Component />
                );
            }
        }
        this.ParentComponent = DataSender([
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
                    <Component />
                );
            }
        }
        this.ParentComponent2 = DataSender([
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
                    DataSender([
                        () => [
                            {
                                path: firstPath,
                                callback: this.callback
                            }
                        ]
                    ])(this.Component)
                )
            );
        };
    });

    it('exists', function() {
        expect(DataSender).to.exist;
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

        expect(this.state._senders.length).to.be.equal(3);
    });

    it('should be unregistered from state when unmounted', function() {
        const mountedComponent = this.render(this.state);

        React.unmountComponentAtNode(mountedComponent.parentNode);

        expect(this.state._senders.length).to.be.equal(0);
        expect(this.state._tree.listeners('write').length).to.be.equal(0);
    });

    it('should remain write callback when one of the senders unmounted', function() {
        this.renderApp(this.state);
        this.state.setIn([ 'shouldBeUnmounted' ], true);

        expect(this.state._tree.listeners('write').length).to.be.equal(1);
    });

    it('should not call callback when data changed on different path', function() {
        this.render(this.state);
        this.state.setIn([ 'hello' ], 'test');

        expect(this.callback).to.not.have.been.called.once;
    });
});
