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
                    throwError(`missing state. It can happen if you forgot to set state in DataInit
                        or using any decorator before DataInit`, this.constructor.displayName);
                }

                this._initCursors(props);

                this.state = {
                    ...this.state,
                    data: this._getCurrentData()
                };

                this._updateDataState = this._updateDataState.bind(this);
            }

            componentDidMount() {
                Object.keys(this.cursors).forEach(branch => {
                    this.dataState.addWaitingCursor(this.cursors[branch]);
                });

                this._updateDataState();
                this._dataWatch();
            }

            componentWillReceiveProps(nextProps) {
                if (this._isChangedProps(nextProps)) {
                    this._reloadComponentData(nextProps);
                }
            }

            componentWillUnmount() {
                this._dataUnwatch();
            }

            _isChangedProps(nextProps) {
                return Object.keys(nextProps).some(key => nextProps[key] !== this.props[key]);
            }

            _reloadComponentData(props = this.props) {
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

            _isValidObjectPathChunk(pathChunk) {
                return Object.keys(pathChunk).every(key => this._isValidPathChunk(pathChunk[key]));
            }

            _isValidPathChunk(pathChunk) {
                return typeof pathChunk !== 'undefined';
            }

            _isValidPath(path) {
                return path.every(pathChunk => {
                    if (Array.isArray(pathChunk)) {
                        throw new Error(
                            `Something is wrong with the path ${path}.
                            This is totally unexpected, please create an issue with details:
                            https://github.com/mistadikay/doob/issues/new`
                        );
                    } else if (typeof pathChunk === 'object') {
                        return this._isValidObjectPathChunk(pathChunk);
                    }

                    return this._isValidPathChunk(pathChunk);
                });
            }

            _prepareArrayPathChunk(pathChunk) {
                const stateTree = this.dataState.getTree();
                const preparedCursorPath = this._prepareCursorPath(pathChunk);

                if (!this._isValidPath(preparedCursorPath)) {
                    return;
                }

                const pathChunkCursor = stateTree.select(preparedCursorPath);

                pathChunkCursor.once('update', ::this._reloadComponentData);

                return pathChunkCursor.get();
            }

            _prepareObjectPathChunk(pathChunk) {
                const preparedPathChunk = {};

                Object.keys(pathChunk).forEach(key => {
                    preparedPathChunk[key] = this._preparePathChunk(pathChunk[key]);
                });

                return preparedPathChunk;
            }

            _preparePathChunk(pathChunk) {
                if (Array.isArray(pathChunk)) {
                    return this._prepareArrayPathChunk(pathChunk);
                } else if (typeof pathChunk === 'object') {
                    return this._prepareObjectPathChunk(pathChunk);
                }

                return pathChunk;
            }

            _prepareCursorPath(path) {
                return path.map(::this._preparePathChunk);
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
                        resetComponentDataIn: ::this._resetDataIn
                    },
                    this.props.children
                );
            }
        };
    };
}
