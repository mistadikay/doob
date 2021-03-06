```
   _         _
 _| |___ ___| |_
| . | . | . | . |
|___|___|___|___|
```

Smart immutable state for React
---

[![maintenance](https://img.shields.io/badge/maintained-no-red.svg?style=flat-square)](http://unmaintained.tech)
[![npm](https://img.shields.io/npm/v/doob.svg?style=flat-square)](https://www.npmjs.com/package/doob)
[![downloads](https://img.shields.io/npm/dm/doob.svg?style=flat-square)](https://www.npmjs.com/package/doob)
[![travis](http://img.shields.io/travis/mistadikay/doob.svg?style=flat-square)](https://travis-ci.org/mistadikay/doob)
[![coverage](http://img.shields.io/coveralls/mistadikay/doob/master.svg?style=flat-square)](https://coveralls.io/r/mistadikay/doob)
[![deps](http://img.shields.io/david/mistadikay/doob.svg?style=flat-square)](https://david-dm.org/mistadikay/doob)

Basic concept is described in the article _[Declarative data fetching in React components with Baobab](https://medium.com/@mistadikay/declarative-data-fetching-in-react-components-with-baobab-e43184c43852)_

Example app using **doob** is here: https://github.com/mistadikay/react-auto-fetching-example/tree/doob

## Install
```
npm i doob
```

## Modules
Basically **doob** is just a [Baobab](https://github.com/Yomguithereal/baobab) tree on steroids with a few decorators for React components.

### State
Before using **doob**, you should create the global state instance. This is the place where you put all the data.

Both params are optional:
* _**state**: object (default: `{}`)_ — initial data
* _**options**: object (default: `undefined`)_ — tree options, the same as in [Baobab](https://github.com/Yomguithereal/baobab#options)

```js
import { State } from 'doob';

new State({
    test: 'hello'
});
```

### DataInit
This decorator should be wrapped around your root component. It accepts only one argument: your state instance.

```js
import React from 'react';
import { State, DataInit } from 'doob';

const state = new State();

@DataInit(state)
class App extends React.Component {
    // ...
}
```

### DataWatcher
`DataWatcher` is a [higher-order component](https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750) that watches for changes in data dependencies you configured and then passes updated data to your component through props.

It accepts only one argument — a function describing your data dependencies. In this function you can use your component's props ([but not local state](#local-state-in-data-dependencies)) as part of data dependencies, like this:

```js
import React from 'react';
import { DataWatcher } from 'doob';

@DataWatcher(props => ({
    productData: [
        'data',
        'products',
        'details',
        props.productID
    ]
}))
class Product extends React.Component {
    render() {
        const productData = this.props.productData;

        if (!productData) {
            return null;
        }

        return (
            <div className='product'>
                { productData.name }
            </div>
        );
    }
}
```

You can even pass an object to data dependency path to filter data by certain field(s) (see [below](#using-objects-in-paths) to learn how to store data in this case):

```js
@DataWatcher(props => ({
    products: [
        'data',
        'products',
        'list',
        {
            search: props.search,
            sort_type: props.sortType
        }
    ]
}))
class ProductsList extends React.Component {
    // ...
}
```

If you want to rely on another data path in your data dependency, you can do it like this:

```js
@DataWatcher(props => ({
    details: [
        'data',
        'products',
        'details',
        [
            'ui',
            'products',
            'selected'
        ]
    ]
}))
class Product extends React.Component {
    // ...
}
```

There are few other props `DataWatcher` passes to it's child component.

### DataFetcher
`DataFetcher` allows you to automate data requesting. Every time someone is trying to get data that is not exists yet, `DataFetcher` will look for a suitable `matcher` that you provided and calls its callback. Take a look at the example for a better understanding:

```js
import React from 'react';
import { DataFetcher } from 'doob';
import productsActions from 'actions/products';

// DataFetcher receives an array of matcher factories as the only argument
@DataFetcher([
    // each matcher factory receives requested dependency path as an argument
    ([ type, branch, id, params ]) => [
        // so when `[ 'data', 'products', 123, { sort_type: 'asc' } ]` is requested
        // `type` will be equal `'data'`, `branch` will be equal `'products'` and so on
        {
            // matcher calls its callback every time
            // when DataWatcher requests data dependency starting with matchers path
            path: [ 'data', 'products', id ],
            callback() {
                productsActions.getProducts(id, params);
            }
        },
        ...
    ],
    ...
])
class App extends React.Component {
    // ...
}
```

### DataSender
`DataSender` is an antipod of `DataFetcher` and it allows you to automate sending data to the server. Every time we change data in global state, `DataSender` will look for a suitable `matcher` that you provided and calls its callback. Take a look at the example for a better understanding:

```js
import React from 'react';
import { DataSender } from 'doob';
import userActions from 'actions/user';

// The same matcher factories as we have in DataFetcher
@DataSender([
    ([ type, branch, field ]) => [
        {
            // whenever we change username in a global state
            // it's sending to the server
            path: [ 'data', 'user', 'name' ],

            // the value from this path is available as an argument in callback
            callback(value) {
                userActions.saveUserName(value);
            }
        },
        ...
    ],
    ...
])
class App extends React.Component {
    // ...
}
```

## Data flow

### local state in data dependencies
As you may notice we do not allow using local component's state in `DataWatcher` data dependencies. Instead, you can just store this local state in the global one and change it through cursors:

```js
//...

@DataWatcher(props => ({
    productData: [
        'data',
        'products',
        {
            show_deleted: props.showDeleted
        }
    ],
    showDeleted: [
        'ui',
        'products',
        'show-deleted'
    ]
}))
class ProductsList extends React.Component {
    //...

    onCheckboxChange() {
        this.props.cursors.showDeleted.set(!props.showDeleted);
    }

    //...
};
```

If you think that local state should be supported in data dependencies path, drop us an issue and we'll discuss it.

### shouldComponentUpdate
Since all the data you declared in `DataWatcher` is in props, you can use either `pureRenderMixin` or your custom `shouldComponentUpdate` to control when your component should be re-rendered. And since all the data in global state is immutable, you can compare props with `===`, including objects and arrays.

```js
import React from 'react';
import { DataWatcher } from 'doob';

@DataWatcher(props => ({
    product: [
        'data',
        'products',
        'details',
        props.productID
    ]
}))
class Product extends React.Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.productID !== this.props.productID || nextProps.product !== this.props.product;
    }
}
```

### Fetching
Keep in mind that since `DataFetcher` will fire callbacks everytime it doesn't find data, you might run into a problem with simultaneous identical requests (for example, requesting the same product id at the same time). You should take care about it yourself, for example, you can check whether there is any similar requests at the moment, like this:

```js
function getProductInfo(productID) {
    if (!isRequesting[productID]) {
        isRequesting[productID] = true;

        requestProductInfo(productID);
    }
}
```

### Using objects in paths
As we mentioned above, we can use objects as parts of data dependencies paths:

```js
@DataWatcher(props => ({
    products: [
        'data',
        'products',
        'list',
        {
            sort_type: props.sortType
        }
    ]
}))
```

To be able to do that, we use Baobab's `select` method, so please take a look at how it works: https://github.com/Yomguithereal/baobab/wiki/Select-state

So when you put data into the path, consider doing something like this:

```js
// state instance
import state from 'state';

state.getTree().select([ 'data', 'products', 'list' ]).apply(
    (products = []) => products.concat({
        items: [ //...products ],
        sort_type: 'asc'
    })
);
```

So, you'll have separate data chunks in `[ 'data', 'products', 'list' ]` for each `sort_type`.
