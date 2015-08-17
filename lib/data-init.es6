import React from 'react';
import State from './state';

export default function(state) {
    return function(Component) {
        return class DataInit extends React.Component {
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
        };
    };
}
