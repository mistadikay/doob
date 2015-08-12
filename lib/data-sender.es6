import React from 'react';
import State from './state';
import throwError from './throw-error';

export default function(matchersFactories) {
    return function(Component) {
        return class DataSender extends React.Component {
            static contextTypes = {
                state: React.PropTypes.instanceOf(State)
            };

            constructor(props, context) {
                super(props, context);

                this.dataState = context.state;

                if (typeof this.dataState === 'undefined') {
                    throwError(`missing state. It can happen if you forgot to set state in DataInit
                        or using any decorator before DataInit`, this.constructor.displayName);
                }
            }

            componentDidMount() {
                if (super.componentDidMount) {
                    super.componentDidMount();
                }

                this.dataState._registerSender(matchersFactories);
            }

            componentWillUnmount() {
                if (super.componentWillUnmount) {
                    super.componentWillUnmount();
                }

                this.dataState._unregisterSender(matchersFactories);
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
