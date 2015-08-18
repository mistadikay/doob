import chai, { expect } from 'chai';
import spies from 'chai-spies';
import React from 'react';

import { getRenderedDOM } from 'test/helpers/render';

import State from 'lib/state';
import DataInit from 'lib/data-init';
import DataFetcher from 'lib/data-fetcher';
import DataWatcher from 'lib/data-watcher';

chai.use(spies);

describe('data-fetcher', function() {
    beforeEach(function() {
        const firstPath = [ 'test', 'huyest' ];
        const secondPath = [ 'test', 'modest' ];
        const thirdPath = [ 'test', 'chest' ];

        this.firstPath = firstPath;
        this.secondPath = secondPath;
        this.thirdPath = thirdPath;

        this.state = new State({
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
                    <div>{ this.props.test }</div>
                );
            }
        }

        this.Component = DataWatcher(() => ({
            test: firstPath,
            two: secondPath
        }))(Component);

        this.matchersFactories = [
            () => [
                {
                    path: secondPath,
                    callback: this.callback
                }
            ]
        ];

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
        } catch(e) {
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

        React.unmountComponentAtNode(mountedComponent.parentNode);

        expect(this.state._fetchers.length).to.be.equal(0);
    });

    it('should call fetcher when mounted', function() {
        this.render(this.state);

        expect(this.callback).to.be.called();
    });

    it('should process correctly DataWatcher paths when mounted', function() {
        this.render(this.state);

        expect(this.state._watchingQueue).to.have.length(1);
        expect(this.state._watchingPaths).to.have.length(1);
        expect(this.state._watchingQueue[0]).to.be.deep.equal(this.secondPath);
        expect(this.state._watchingPaths[0]).to.be.deep.equal(this.firstPath);
    });

    it('should process correctly DataWatcher paths when unmounted', function() {
        const mountedComponent = this.render(this.state);

        React.unmountComponentAtNode(mountedComponent.parentNode);

        expect(this.state._watchingQueue).to.have.length(0);
        expect(this.state._watchingPaths).to.have.length(0);
    });
});
