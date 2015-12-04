import React from 'react';
import State from './state';

module.exports = function(state) {
    return function(Component) {
        class DataInit extends React.Component {
            static childContextTypes = {
                state: React.PropTypes.instanceOf(State)
            };

            constructor(props, context) {
                super(props, {
                    ...context,
                    state
                });
            }

            getChildContext() {
                return { state };
            }

            render() {
                return React.createElement(
                    Component,
                    this.props,
                    this.props.children
                );
            }
        }

        return DataInit;
    };
};
