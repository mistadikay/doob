import { expect } from 'chai';
import State from '../../lib/state';

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

        it('exists()', () => {
            expect(state.exists('test')).to.be.true;
        });
    });
});
