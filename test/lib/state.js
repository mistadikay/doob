import chai, { expect } from 'chai';
import spies from 'chai-spies';

import State from 'lib/state';

chai.use(spies);

describe('state', () => {
    it('exists', () => {
        expect(State).to.exist;
    });

    describe('default', () => {
        const state = new State();

        it('is instance of State', () => {
            expect(state instanceof State).to.be.true;
        });

        it('is empty data', () => {
            expect(Object.keys(state.get()).length).to.be.equal(0);
        });
    });

    describe('initial data and options', () => {
        const state = new State({
            test: 'hello'
        }, {
            immutable: false
        });

        it('has initial data', () => {
            expect(state.getIn('test')).to.be.equal('hello');
        });

        it('has options', () => {
            expect(() => {
                state.get().test = 'bye';
            }).to.not.throw();
        });
    });

    describe('public API', () => {
        const initialState = {
            test: 'hello'
        };
        let state = null;

        beforeEach(function() {
            state = new State(initialState, {
                asynchronous: false
            });
        });

        it('getTree()', () => {
            expect(state.getTree()).to.be.equal(state.getTree().root.tree);
        });

        it('get()', () => {
            expect(state.get()).to.be.equal(initialState);
        });

        it('getIn()', () => {
            expect(state.getIn('test')).to.be.equal('hello');
        });

        it('set()', () => {
            state.set({
                what: 'the fuck'
            });
            expect(state.getIn('what')).to.be.equal('the fuck');
        });

        it('setIn()', () => {
            state.setIn('test', 'bye');
            expect(state.getIn('test')).to.be.equal('bye');
        });

        it('unset()', () => {
            state.unset();
            expect(state.get()).to.be.undefined;
        });

        it('unsetIn()', () => {
            state.unsetIn('test');
            expect(state.getIn('test')).to.be.undefined;
        });

        it('exists()', () => {
            expect(state.exists('test')).to.be.true;
        });
    });

    describe('DataFetcher helpers', () => {
        const path = [ 'test', 'huyest' ];
        let state = null;
        let callback = null;
        let matchersFactories = null;

        beforeEach(function() {
            state = new State({
                test: {
                }
            }, {
                asynchronous: false
            });
            callback = chai.spy(function() {});
            matchersFactories = [
                () => [
                    { path, callback }
                ]
            ];
        });

        describe('_registerFetcher()', () => {
            it('should register fetcher', () => {
                state._registerFetcher(matchersFactories);
                expect(state._fetchers.length).to.be.equal(1);
            });
        });

        describe('_processFetcherWithPath()', () => {
            it('should add only one listener for each fetcher', () => {
                state._registerFetcher(matchersFactories);
                state._registerFetcher(matchersFactories);
                state.getIn(path);
                expect(callback).to.have.been.called.twice;
            });
        });

        describe('_unregisterFetcher()', () => {
            it('should unregister', () => {
                state._registerFetcher(matchersFactories);
                state._unregisterFetcher(matchersFactories);
                state.getIn(path);
                expect(callback).to.not.have.been.called.once;
                expect(state._fetchers.length).to.be.equal(0);
            });
        });
    });

    describe('DataSender helpers', () => {
        const path = [ 'test', 'huyest' ];
        let state = null;
        let callback = null;
        let matchersFactories = null;

        beforeEach(function() {
            state = new State({}, {
                asynchronous: false
            });
            callback = chai.spy(function() {});
            matchersFactories = [
                () => [
                    { path, callback }
                ]
            ];
        });

        describe('_registerSender()', () => {
            it('should register sender', () => {
                state._registerSender(matchersFactories);
                expect(state._senders.length).to.be.equal(1);
            });
        });

        describe('_processSenderWithPath()', () => {
            it('should add only one listener for each sender', () => {
                state._registerSender(matchersFactories);
                state._registerSender(matchersFactories);
                state.setIn(path, 'hello');
                expect(callback).to.have.been.called.twice;
            });

            it('should have a value in the callback', () => {
                state._registerSender(matchersFactories);
                state.setIn(path, 'hello');
                expect(callback).to.have.been.called.with('hello');
            });

            it('should have an undefined value in the callback', () => {
                state._registerSender(matchersFactories);
                state.setIn(path, 'hello');
                state.unsetIn(path);
                expect(callback).to.have.been.called.with(undefined);
            });
        });

        describe('_unregisterSender()', () => {
            it('should unregister', () => {
                state._registerSender(matchersFactories);
                state._unregisterSender(matchersFactories);
                state.setIn(path, 'hello');
                expect(callback).to.not.have.been.called.once;
                expect(state._senders.length).to.be.equal(0);
            });
        });
    });
});
