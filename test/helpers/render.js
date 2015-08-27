import React from 'react/addons';

const TestUtils = React.addons.TestUtils;

export function render(component, props, ...children) {
    return TestUtils.renderIntoDocument(
        React.createElement(component, props, ...children)
    );
}

export function getRenderedDOM(...args) {
    return React.findDOMNode(
        render(...args)
    );
}

export function createShallowRender() {
    const shallowRenderer = TestUtils.createRenderer();

    return function(component, props, ...children) {
        shallowRenderer.render(
            React.createElement(
                component,
                props,
                ...children
            )
        );

        return shallowRenderer.getRenderOutput();
    };
}

export function shallowRender(...args) {
    return createShallowRender()(...args);
}
