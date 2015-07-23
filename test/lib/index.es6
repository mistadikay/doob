import { expect } from 'chai';
import {
    State,
    DataWatcher,
    DataInit
} from '../../lib/index';

describe('doob', () => {
    it('state exists', () => {
        expect(State).to.exist;
    });
    it('DataWatcher exists', () => {
        expect(DataWatcher).to.exist;
    });
    it('DataInit exists', () => {
        expect(DataInit).to.exist;
    });
});
