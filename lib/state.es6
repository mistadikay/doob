import Baobab from 'baobab';
import isEqual from 'lodash.isequal';

export default class State {
    constructor(initialState = {}, options) {
        this._tree = new Baobab(initialState, options);
        this._gettersQueue = [];
        this._fetchers = [];

        this._onPathGetter = this._onPathGetter.bind(this);
    }

    _onPathGetter(e) {
        this._fetchPath(e.data.path);
    }

    _isPathMatchedByFetchers(cursorPath) {
        return this._fetchers.some(fetcher => {
            return fetcher.some(matchersFactory => {
                return matchersFactory(cursorPath).some(matcher => {
                    return matcher.path.every((chunk, i) => {
                        return isEqual(chunk, cursorPath[i]);
                    });
                });
            });
        });
    }

    _fetchPathWith(cursorPath, fetcher) {
        fetcher.forEach(matchersFactory => {
            matchersFactory(cursorPath).forEach(matcher => {
                const matched = matcher.path.every((chunk, i) => {
                    return chunk === cursorPath[i];
                });

                // if cursor path is matched by some fetcher and
                // such data is not exists yet
                if (matched && !this.exists(cursorPath)) {
                    matcher.callback();
                }
            });
        });
    }

    _fetchPath(cursorPath) {
        this._fetchers.forEach(this._fetchPathWith.bind(this, cursorPath));
    }

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

    exists(path) {
        return this._tree.select(path).exists();
    }

    registerFetcher(fetcher) {
        // add `get`-listener if there is no fetchers yet
        if (this._fetchers.length === 0) {
            this._tree.on('get', this._onPathGetter);
        }

        // process queue with the new fetcher
        this._gettersQueue.forEach(queueCursorPath => {
            this._fetchPathWith(queueCursorPath, fetcher);
        });

        // store fetcher
        this._fetchers.push(fetcher);
    }

    unregisterFetcher(fetcher) {
        // remove fetcher from registered fetchers
        this._fetchers = this._fetchers.filter(registeredFetcher => {
            return registeredFetcher !== fetcher;
        });

        // remove `get`-listener if there is no fetchers anymore
        if (this._fetchers.length === 0) {
            this._tree.off('get', this._onPathGetter);
        }
    }

    addToGettersQueue(cursorPath) {
        // only if path is not matched by registered fetchers
        if (!this._isPathMatchedByFetchers(cursorPath)) {
            this._gettersQueue.push(cursorPath);
        }
    }

    removeFromGettersQueue(cursorPath) {
        // remove from getters queue exactly this cursorPath
        this._gettersQueue = this._gettersQueue.filter(
            queueCursorPath => cursorPath !== queueCursorPath
        );
    }
}
