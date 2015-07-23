import { expect } from 'chai';
import {
    state
} from '../../lib/index';

describe('doob', () => {
    it('state exists', () => {
        expect(state).to.exist;
    });
});
