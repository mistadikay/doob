import { expect } from 'chai';
import React from 'react';

import { render } from 'test/helpers/render';

import State from 'lib/state';
import DataInit from 'lib/data-init';

describe('data-init', function() {
    it('exists', function() {
        expect(DataInit).to.exist;
    });

    it('should pass state context to the children', function() {
        let parentState = null;
        let childState = null;

        class Component extends React.Component {
            static contextTypes = {
                state: React.PropTypes.instanceOf(State)
            };

            constructor(props, context) {
                super(props, context);

                childState = context.state;
            }

            render() {
                return (
                    <div></div>
                );
            }
        }

        const state = new State();

        @DataInit(state)
        class WrapperComponent extends React.Component {
            static contextTypes = {
                state: React.PropTypes.instanceOf(State)
            };

            constructor(props, context) {
                super(props, context);

                parentState = context.state;
            }

            render() {
                return (
                    <div>
                        { React.createElement(Component) }
                    </div>
                );
            }
        }

        render(WrapperComponent);

        expect(parentState).to.be.an.instanceof(State);
        expect(childState).to.be.an.instanceof(State);
    });
});
