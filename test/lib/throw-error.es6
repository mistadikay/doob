import { expect } from 'chai';
import throwError from 'lib/throw-error';

describe('throw-error', () => {
    it('exists', () => {
        expect(throwError).to.exist;
    });

    it('should throw error for component', () => {
        try {
            throwError('wat', 'Test');
        } catch (e) {
            expect(e.message).to.equal('doob, Test component: wat');
        }
    });

    it('should throw error for unknown component', () => {
        try {
            throwError('wat');
        } catch (e) {
            expect(e.message).to.equal('doob, unknown component: wat');
        }
    });
});
