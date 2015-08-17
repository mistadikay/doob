import chai, { expect } from 'chai';
import spies from 'chai-spies';
import React from 'react';

import { getRenderedDOM } from 'test/helpers/render';

import State from 'lib/state';
import DataInit from 'lib/data-init';
import DataFetcher from 'lib/data-fetcher';

chai.use(spies);

describe('data-fetcher', function() {
    beforeEach(function() {
        const path = [ 'test', 'huyest' ];

        this.state = new State({
            test: {
            }
        }, {
            asynchronous: false
        });

        this.callback = chai.spy(function() {});

        this.render = function(state) {
            return getRenderedDOM(
                DataInit(state)(
                    DataFetcher(
                        () => ({
                            parentProp: [ 'parentStuff' ]
                        })
                    )(this.Component)
                )
            );
        };

        this.Component = class extends React.Component {
            render() {
                return (
                    <div></div>
                );
            }
        };

        this.matchersFactories = [
            () => [
                {
                    path,
                    callback: this.callback
                }
            ]
        ];
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
});
