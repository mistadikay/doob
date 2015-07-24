import React from 'react';
import State from './state';
import throwError from './throw-error';

export default function(branches) {
    return function(Component) {
        return class DataFetcher extends Component {
            static contextTypes = {
                state: React.PropTypes.instanceOf(State)
            };

            constructor(props, context) {
                super(props, context);

                this.dataState = context.state;

                if (typeof this.dataState === 'undefined') {
                    throwError('missing state. It can happen if you forgot to set state in DataInit or using any decorator before DataInit', this.constructor.displayName);
                }
            }

            componentDidMount() {
                if (super.componentDidMount) {
                    super.componentDidMount();
                }

                branches.forEach(({ path, callback }) => this.dataState.on('get', path, callback));
            }

            componentWillUnmount() {
                if (super.componentWillUnmount) {
                    super.componentWillUnmount();
                }

                branches.forEach(({ path, callback }) => this.dataState.off('get', path, callback));
            }
        };
    };
}
