import React from 'react';
import State from './state';
import throwError from './throw-error';

export default function(dataFactory) {
    return function(Component) {
        return class DataWatcher extends React.Component {
            static contextTypes = {
                state: React.PropTypes.instanceOf(State)
            };

            constructor(props, context) {
                super(props, context);

                this.cursors = {};
                this.dataState = context.state;

                if (typeof this.dataState === 'undefined') {
                    throwError('missing state. It can happen if you forgot to set state in DataInit or using any decorator before DataInit', this.constructor.displayName);
                }

                this._initCursors(props);

                this.state = {
                    ...this.state,
                    data: this._getCurrentData()
                };

                this._updateDataState = this._updateDataState.bind(this);
            }

            componentDidMount() {
                if (super.componentDidMount) {
                    super.componentDidMount();
                }

                Object.keys(this.cursors).forEach(branch => {
                    this.dataState.addWaitingCursor(this.cursors[branch]);
                });

                this._updateDataState();
                this._dataWatch();
            }

            componentWillUnmount() {
                if (super.componentWillUnmount) {
                    super.componentWillUnmount();
                }

                this._dataUnwatch();
            }

            reloadComponentData(props = this.props) {
                this._dataUnwatch();
                this._initCursors(props);
                this._updateDataState();
                this._dataWatch();
            }

            _resetData() {
                this._resetDataIn(Object.keys(this.cursors));
            }

            _resetDataIn(cursorsTypes) {
                cursorsTypes.forEach(cursorType => {
                    const cursor = this.cursors[cursorType];

                    if (cursor.exists()) {
                        cursor.unset();
                    }
                });
                this._updateDataState();
            }

            _isValidPath(path) {
                return path.every(
                    pathChunk => typeof pathChunk !== 'undefined'
                );
            }

            _prepareCursorPath(path) {
                const stateTree = this.dataState.getTree();

                return path.map(pathChunk => {
                    if (Array.isArray(pathChunk)) {
                        const preparedCursorPath = this._prepareCursorPath(pathChunk);

                        if (!this._isValidPath(preparedCursorPath)) {
                            return;
                        }

                        const pathChunkCursor = stateTree.select(preparedCursorPath);

                        pathChunkCursor.once('update', ::this.reloadComponentData);

                        return pathChunkCursor.get();
                    }

                    return pathChunk;
                });
            }

            _prepareCursorPaths(props) {
                const cursorPaths = dataFactory(props);

                Object.keys(cursorPaths).forEach(branch => {
                    cursorPaths[branch] = this._prepareCursorPath(cursorPaths[branch]);
                });

                return cursorPaths;
            }

            _initCursors(props) {
                const stateTree = this.dataState.getTree();

                this.cursorPaths = this._prepareCursorPaths(props);

                Object.keys(this.cursorPaths)
                    .filter(branch => this._isValidPath(this.cursorPaths[branch]))
                    .forEach(branch => {
                        this.cursors[branch] = stateTree.select(this.cursorPaths[branch]);
                    });
            }

            _dataWatch() {
                Object.keys(this.cursors).forEach(
                    cursorType => this.cursors[cursorType].on('update', this._updateDataState)
                );
            }

            _dataUnwatch() {
                Object.keys(this.cursors).forEach(
                    cursorType => this.cursors[cursorType].off('update', this._updateDataState)
                );
            }

            _getCurrentData() {
                const data = {};

                Object.keys(this.cursors).forEach(branch => {
                    data[branch] = this.cursors[branch].get();
                });

                return data;
            }

            _updateDataState() {
                this.setState({
                    data: this._getCurrentData()
                });
            }

            render() {
                return React.createElement(
                    Component,
                    {
                        ...this.props,
                        ...this.state.data,
                        cursors: this.cursors,
                        resetComponentData: ::this._resetData,
                        resetComponentDataIn: ::this._resetDataIn,
                        reloadComponentData: ::this.reloadComponentData
                    },
                    this.props.children
                );
            }
        };
    };
}
