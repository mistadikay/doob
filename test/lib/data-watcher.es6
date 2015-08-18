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

    it('should throw error when missing state', function() {
        class Component extends React.Component {
            render() {
                return (
                    <div></div>
                );
            }
        }

        function render() {
            return getRenderedDOM(
                DataInit()(
                    DataWatcher(
                        () => ({
                            parentProp: [ 'parentStuff' ]
                        })
                    )(Component)
                )
            );
        }

        try {
            render();
        } catch(e) {
            expect(render).to.throw(Error);
        }
    });

    describe('should update data', function() {
        describe('when using object as part of the path', function() {
            beforeEach(function() {
                const propsSpy = chai.spy(function() {});

                this.propsSpy = propsSpy;

                class Component extends React.Component {
                    render() {
                        Object.keys(this.props).forEach(key => {
                            if (this.props[key]) {
                                propsSpy(this.props[key].value);
                            }
                        });

                        return null;
                    }
                }

                this.state = new State({
                    one: [
                        {
                            filter: 'yourmom',
                            value: 'test'
                        }
                    ],
                    two: [
                        {
                            filter: 'wtf',
                            value: 'test2'
                        }
                    ]
                }, {
                    asynchronous: false
                });

                this.dataFactory = chai.spy(props => {
                    return {
                        one: [
                            'one',
                            {
                                filter: 'yourmom'
                            }
                        ],
                        two: [
                            'two',
                            {
                                filter: 'wtf'
                            }
                        ],
                    };
                });

                this.renderMock = function(props) {
                    return getRenderedDOM(
                        DataInit(this.state)(
                            DataWatcher(this.dataFactory)(Component)
                        ),
                        props
                    );
                };
            });

            it('simple', function() {
                this.renderMock();

                expect(this.propsSpy).to.be.called.with('test');
                expect(this.propsSpy).to.be.called.with('test2');
            });
        });

        describe('when using nested dependencies', function() {
            beforeEach(function() {
                const propsSpy = chai.spy(function() {});
                const nestedPath = [ 'foo', 'bar' ];
                const nestedNestedPath = [ 'foo', 'bar', [ 'nested' ] ];

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
                    four: {
                        test4: 'works!'
                    },
                    five: {
                        test4: 'huyak'
                    },
                    six: {
                        test5: 'updated'
                    },
                    eight: {
                        nestednested: 'wat'
                    },
                    foo: {
                        magic: {
                            bar: 'test3'
                        },
                        huyagic: {
                            bar: 'test4'
                        }
                    }
                }, {
                    asynchronous: false
                });

                this.nestedPath = nestedPath;
                this.nestedNestedPath = nestedNestedPath;

                this.parentDataFactory = chai.spy(() => ({
                    parentProp: [ 'parentStuff' ]
                }));
                this.dataFactory = chai.spy(props => {
                    return {
                        one: [ 'one', nestedPath ],
                        two: [ 'two', nestedPath ],
                        complex: [ 'three', [ 'foo', props.stuff, 'bar' ] ],
                        complexParent: [ 'four', [ 'foo', props.parentProp, 'bar' ] ],
                        complexParent2: [ 'five', [ 'foo', props.parentProp, 'bar' ] ],
                        complexParent3: [ 'six', [ 'foo', props.parentProp, 'bar' ] ],
                        weirdo: [ 'seven', props.parentProp ],
                        complexNestedParent: [ 'eight', this.nestedNestedPath ]
                    };
                });

                this.renderMock = function(props) {
                    getRenderedDOM(
                        DataInit(this.state)(
                            DataWatcher(this.dataFactory)(Component)
                        ),
                        props
                    );
                };

                this.renderParentMock = function(props) {
                    getRenderedDOM(
                        DataInit(this.state)(
                            DataWatcher(this.parentDataFactory)(
                                DataWatcher(this.dataFactory)(Component)
                            )
                        ),
                        props
                    );
                };
            });

            it('simple', function() {
                this.renderMock();

                this.state.setIn(this.nestedPath, 'test');

                expect(this.propsSpy).to.be.called.with('hey');
                expect(this.propsSpy).to.be.called.with('dude');

                this.state.setIn(this.nestedPath, 'test2');
                expect(this.propsSpy).to.be.called.with('what\'s');
                expect(this.propsSpy).to.be.called.with('up');
            });

            it('nested-in-nested', function() {
                this.renderMock();
                this.state.setIn([ 'nested' ], 'test');
                this.state.setIn([ 'foo', 'bar', 'test' ], 'nestednested');

                expect(this.propsSpy).to.be.called.with('wat');
            });

            it('props-based', function() {
                this.renderMock({ stuff: 'magic' });

                expect(this.propsSpy).to.be.called.with('hooray!');
            });

            it('props-based (with initial data) when props changed', function() {
                this.renderParentMock();
                this.state.setIn([ 'parentStuff' ], 'incorrect');
                this.state.setIn([ 'parentStuff' ], 'huyagic');

                expect(this.propsSpy).to.be.called.with('works!');
                expect(this.propsSpy).to.be.called.with('huyak');
            });

            it('props-based (with no initial data) when props changed', function() {
                this.renderParentMock();
                this.state.setIn([ 'parentStuff' ], 'amazing');
                this.state.setIn([ 'foo', 'amazing', 'bar' ], 'test5');

                expect(this.propsSpy).to.be.called.with('updated');
            });

            it('should not cause memory leak with empty nested path', function() {
                this.renderMock({ stuff: [] });
                this.state.setIn(this.nestedPath, 'test');
                this.state.setIn(this.nestedPath, 'test');
                this.state.setIn(this.nestedPath, 'test');

                expect(this.dataFactory).to.be.called.exactly(4);
            });

            it('should not cause memory leak with more than one nested', function() {
                this.renderMock();
                this.state.setIn(this.nestedPath, 'test');
                this.state.setIn(this.nestedPath, 'test');
                this.state.setIn(this.nestedPath, 'test');

                expect(this.dataFactory).to.be.called.exactly(4);
            });
        });
    });
});
