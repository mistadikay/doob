import Baobab from 'baobab';
import isEqual from 'lodash.isequal';

export default class State {
    constructor(initialState = {}, options) {
        this._tree = new Baobab(initialState, options);
        this._watchingQueue = [];
        this._watchingPaths = [];
        this._fetchers = [];
        this._senders = [];

        this._onPathGet = this._onPathGet.bind(this);
        this._onPathWrite = this._onPathWrite.bind(this);
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
        if (this._isPathMatched(cursorPath)) {
            this._watchingPaths.push(cursorPath);
        } else {
            this._watchingQueue.push(cursorPath);
        }
    }

    _removeFromWatchingQueue(cursorPath) {
        // remove from watching paths if path is matched by any registered fetchers
        if (this._isPathMatched(cursorPath)) {
            this._watchingPaths.splice(this._watchingPaths.indexOf(cursorPath), 1);

        // otherwise remove from queue
        } else {
            this._watchingQueue.splice(this._watchingQueue.indexOf(cursorPath), 1);
        }
    }

    /**
     * Senders API
     */
    _onPathWrite(e) {
        const path = e.data.path;

        this._senders.forEach(this._processSenderWithPath.bind(this, path));
    }

    _processSenderWithPath(cursorPath, matchersFactories) {
        const isDataExists = this.exists(cursorPath);

        // it's intentionally undefined by default
        // because Baobab returns undefined if there is no value in path
        let value;

        // we retrieve value only if it is exists
        // so DataFetcher wouldn't trigger when we don't want to
        if (isDataExists) {
            value = this.getIn(cursorPath);
        }

        matchersFactories.forEach(matchersFactory => {
            matchersFactory(cursorPath).forEach(matcher => {
                const matched = matcher.path.every((chunk, i) => {
                    return chunk === cursorPath[i];
                });

                // trigger callback if path is matched
                if (matched) {
                    matcher.callback(value);
                }
            });
        });
    }

    _registerSender(sender) {
        // add `write`-listener if there is no senders yet
        if (this._senders.length === 0) {
            this._tree.on('write', this._onPathWrite);
        }

        // store sender
        this._senders.push(sender);
    }

    _unregisterSender(sender) {
        // remove sender from registered senders
        this._senders = this._senders.filter(registeredSender => {
            return registeredSender !== sender;
        });

        // remove `write`-listener if there is no senders anymore
        if (this._senders.length === 0) {
            this._tree.off('write', this._onPathWrite);
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
