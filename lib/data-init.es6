import React from 'react';
import State from './state';

export default function(state) {
    return function(Component) {
        return class DataInit extends Component {
            static childContextTypes = {
                state: React.PropTypes.instanceOf(State)
            };

            constructor(props, context) {
                super(props, {
                    ...context,
                    state
                });
                this.rootState = state;
            }

            getChildContext() {
                return { state };
            }
        };
    };
}
