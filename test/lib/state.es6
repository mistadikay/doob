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

    describe('with initial data and options', () => {
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
});
