import Baobab from 'baobab';
import isEqual from 'lodash.isequal';

export default class State {
    constructor(initialState = {}, options) {
        this._tree = new Baobab(initialState, options);
        this._watchingQueue = [];
        this._watchingPaths = [];
        this._fetchers = [];

        this._onPathGet = this._onPathGet.bind(this);
    }

    /**
     * Fetchers API
     */
    _onPathGet(e) {
        const path = e.data.path;

        this._fetchers.forEach(this._processFetcherWithPath.bind(this, path));
    }

    _isPathMatchedBy(cursorPath, matchersFactories) {
        return matchersFactories.some(matchersFactory => {
            return matchersFactory(cursorPath).some(matcher => {
                return matcher.path.every((chunk, i) => {
                    return isEqual(chunk, cursorPath[i]);
                });
            });
        });
    }

    _isPathMatched(cursorPath) {
        return this._fetchers.some(this._isPathMatchedBy.bind(this, cursorPath));
    }

    _processFetcherWithPath(cursorPath, matchersFactories) {
        const isDataExists = this.exists(cursorPath);

        matchersFactories.forEach(matchersFactory => {
            matchersFactory(cursorPath).forEach(matcher => {
                const matched = matcher.path.every((chunk, i) => {
                    return chunk === cursorPath[i];
                });

                // if cursor path is matched by some fetcher and
                // such data is not exists yet
                if (matched && !isDataExists) {
                    matcher.callback();
                }
            });
        });
    }

    _registerFetcher(fetcher) {
        // add `get`-listener if there is no fetchers yet
        if (this._fetchers.length === 0) {
            this._tree.on('get', this._onPathGet);
        }

        // move matched by new fetcher paths from queue
        this._watchingQueue = this._watchingQueue.filter(queuePath => {
            if (this._isPathMatchedBy(queuePath, fetcher)) {
                this._watchingPaths.push(queuePath);

                return false;
            }

            return true;
        });

        // process all watching paths with the new fetcher
        this._watchingPaths.forEach(watchingPath => {
            this._processFetcherWithPath(watchingPath, fetcher);
        });

        // store fetcher
        this._fetchers.push(fetcher);
    }

    _unregisterFetcher(fetcher) {
        // remove fetcher from registered fetchers
        this._fetchers = this._fetchers.filter(registeredFetcher => {
            return registeredFetcher !== fetcher;
        });

        // move watched by nobody paths to queue
        this._watchingPaths = this._watchingPaths.filter(watchingPath => {
            if (!this._isPathMatched(watchingPath)) {
                this._watchingQueue.push(watchingPath);

                return false;
            }

            return true;
        });

        // remove `get`-listener if there is no fetchers anymore
        if (this._fetchers.length === 0) {
            this._tree.off('get', this._onPathGet);
        }
    }

    _addToWatchingQueue(cursorPath) {
        // only if path is not matched by registered fetchers
        if (!this._isPathMatched(cursorPath)) {
            this._watchingQueue.push(cursorPath);
        }
    }

    _removeFromWatchingQueue(cursorPath) {
        // only if path is not matched by registered fetchers
        if (!this._isPathMatched(cursorPath)) {
            // remove it from watching
            this._watchingPaths = this._watchingPaths.filter(watchingPath => {
                return !isEqual(cursorPath, watchingPath);
            });

            // and from queue
            this._watchingQueue = this._watchingQueue.filter(watchingPath => {
                return !isEqual(cursorPath, watchingPath);
            });
        }
    }

    /**
     * Public API
     */
    getTree() {
        return this._tree;
    }

    get() {
        return this._tree.get();
    }

    getIn(cursorPath) {
        return this._tree.get(cursorPath);
    }

    set(data) {
        this._tree.set(data);
    }

    setIn(cursorPath, data) {
        this._tree.set(cursorPath, data);
    }

    unset() {
        this._tree.unset();
    }

    unsetIn(cursorPath) {
        this._tree.unset(cursorPath);
    }

    exists(path) {
        return this._tree.select(path).exists();
    }
}
