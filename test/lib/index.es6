import { expect } from 'chai';
import {
    state,
    DataWatcher
} from '../../lib/index';

describe('doob', () => {
    it('state exists', () => {
        expect(state).to.exist;
    });
    it('DataWatcher exists', () => {
        expect(DataWatcher).to.exist;
    });
});
