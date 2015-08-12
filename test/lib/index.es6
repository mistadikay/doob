import { expect } from 'chai';
import {
    State,
    DataWatcher,
    DataFetcher,
    DataSender,
    DataInit
} from '../../lib/index';

describe('index', () => {
    it('state exists', () => {
        expect(State).to.exist;
    });
    it('DataWatcher exists', () => {
        expect(DataWatcher).to.exist;
    });
    it('DataFetcher exists', () => {
        expect(DataFetcher).to.exist;
    });
    it('DataSender exists', () => {
        expect(DataSender).to.exist;
    });
    it('DataInit exists', () => {
        expect(DataInit).to.exist;
    });
});
