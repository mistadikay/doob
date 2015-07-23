import state from './state';

export default function(Component) {
    return class DataWatcher extends Component {
        constructor(props) {
            super(props);

            this.cursors = {};
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
                state.addWaitingCursor(this.cursors[branch]);
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

        _reloadData(props) {
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

        _initCursors(props = this.props) {
            const stateTree = state.getTree();

            this.cursorPaths = this.constructor.data(props, this.state);

            Object.keys(this.cursorPaths)
                .filter(branch => {
                    return this.cursorPaths[branch].every(pathChunk => typeof pathChunk !== 'undefined');
                })
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
    };
}
