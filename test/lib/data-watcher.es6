import chai, { expect } from 'chai';
import spies from 'chai-spies';
import React from 'react';

import { getRenderedDOM } from 'test/helpers/render';

import State from 'lib/state';
import DataInit from 'lib/data-init';
import DataWatcher from 'lib/data-watcher';

chai.use(spies);

describe('data-watcher', function() {
    it('exists', function() {
        expect(DataWatcher).to.exist;
    });

    describe('data dependencies', function() {
        beforeEach(function() {
            const propsSpy = chai.spy(function() {});
            const nestedPath = [ 'foo', 'bar' ];

            this.propsSpy = propsSpy;

            class Component extends React.Component {
                render() {
                    Object.keys(this.props).forEach(key => {
                        propsSpy(this.props[key]);
                    });

                    return null;
                }
            }

            this.state = new State({
                one: {
                    test: 'hey',
                    test2: 'what\'s'
                },
                two: {
                    test: 'dude',
                    test2: 'up'
                },
                three: {
                    test3: 'hooray!'
                },
                foo: {
                    magic: {
                        bar: 'test3'
                    }
                }
            }, {
                asynchronous: false
            });

            this.nestedPath = nestedPath;

            this.dataFactory = chai.spy(props => ({
                one: [ 'one', nestedPath ],
                two: [ 'two', nestedPath ],
                complex: [ 'three', [ 'foo', props.stuff, 'bar' ] ]
            }));

            this.renderMock = function(props) {
                getRenderedDOM(
                    DataInit(this.state)(
                        DataWatcher(this.dataFactory)(Component)
                    ),
                    props
                );
            };
        });

        it('should update data in nested dependencies', function() {
            this.renderMock();

            this.state.setIn(this.nestedPath, 'test');

            expect(this.propsSpy).to.be.called.with('hey');
            expect(this.propsSpy).to.be.called.with('dude');

            this.state.setIn(this.nestedPath, 'test2');
            expect(this.propsSpy).to.be.called.with('what\'s');
            expect(this.propsSpy).to.be.called.with('up');
        });

        // todo fix https://github.com/mistadikay/doob/issues/12?
        it('should update data in props-based nested dependencies', function() {
            this.renderMock({ stuff: 'magic' });

            expect(this.propsSpy).to.be.called.with('hooray!');
        });

        // todo fix https://github.com/mistadikay/doob/issues/11
        it.skip('should not cause memory leak when more than one nested dependencies', function() {
            this.renderMock();
            this.state.setIn(this.nestedPath, 'test');

            expect(this.dataFactory).to.be.called.exactly(2);
        });
    });
});
