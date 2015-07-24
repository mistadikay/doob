```
   _         _
 _| |___ ___| |_
| . | . | . | . |
|___|___|___|___|
```

Smart immutable state for React
---

[![npm](https://img.shields.io/npm/v/doob.svg?style=flat-square)](https://www.npmjs.com/package/doob)
[![travis](http://img.shields.io/travis/mistadikay/doob.svg?style=flat-square)](https://travis-ci.org/mistadikay/doob)
[![coverage](http://img.shields.io/coveralls/mistadikay/doob/master.svg?style=flat-square)](https://coveralls.io/r/mistadikay/doob)
[![deps](http://img.shields.io/david/mistadikay/doob.svg?style=flat-square)](https://david-dm.org/mistadikay/doob)
[![climate](https://img.shields.io/codeclimate/github/mistadikay/doob.svg?style=flat-square)](https://codeclimate.com/github/mistadikay/doob)

**Important notice**: WIP, not for production

Basic concept is described in the article _[Declarative data fetching in React components with Baobab](https://medium.com/@mistadikay/declarative-data-fetching-in-react-components-with-baobab-e43184c43852)_

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
This decorator should be put to your root component. It accepts only one argument: your state instance.

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
DataWatcher watches for data dependencies you configured and puts data into the components local `data` state.

It accepts only one function as an argument with props and state so you can use them as part of data dependency path.

```js
import React from 'react';
import { DataWatcher } from 'doob';

@DataWatcher((props, state) => ({
    product: [
        'data',
        'products',
        'details',
        props.productID
    ]
}))
class Product extends React.Component {
    render() {
        const productData = this.state.data.product;

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

If data dependencies paths depend on props/state, you should reload data state manually with `reloadComponentData` method which accepts optional `props` argument (in case if you need to pass `nextProps`):

```js
// when receiving new props
componentWillReceiveProps(nextProps) {
    if (this.props.productID !== nextProps.productID) {
        this.reloadComponentData(nextProps);
    }
}

// when updating state
onChange(e) {
    this.setState({
        enabled: e.target.checked
    }, ::this.reloadComponentData);
}
```

You can even pass an object to data dependency path to filter data by certain field(s) (see [below](#using-objects-in-paths) to learn how to store data in this case):

```js
@DataWatcher((props, state) => ({
    products: [
        'data',
        'products',
        'list',
        {
            search: props.search,
            sort_type: state.sortType
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

In this case you should not even care about calling `reloadComponentData` when data changes in `[ 'ui', 'products', 'selected' ]` — it will be updated automatically!

### DataFetcher
DataFetcher allows you to automate data requesting. Every time someone is trying to get data that is not exists yet, DataFetcher calls callback you provided and puts as arguments the rest chunks of the path requested. Take a look at the example for a better understanding:

```js
import React from 'react';
import { DataFetcher } from 'doob';
import productsActions from 'actions/products';
import usersActions from 'actions/users';

@DataFetcher([

    // someone requested [ 'data', 'products', 'list', { sort_type: 'asc' } ]
    // in this case the only argument in callback will be { sort_type: 'asc' }
    {
        path: [ 'data', 'products', 'list' ],
        callback: sortOptions => productsActions.getProducts(sortOptions)
    },

    // someone requested [ 'data', 'products', 'details', 8976 ]
    // the only argument in the callback will be 8976
    {
        path: [ 'data', 'products', 'details' ],
        callback: productID => productsActions.getProductInfo(productID)
    },

    // someone requested [ 'data', 'users', 6321, 'photos' ]
    // there would be two arguments in the callback: 6321 and 'photos'
    {
        path: [ 'data', 'users' ],
        callback: (userID, field) => {
            if (field === 'photos') {
                usersActions.getPhotos(userID);
            }
        }
    }
])
class App extends React.Component {
    // ...
}
```

### DataSender
**SOON**

## Data flow

### Fetching
Keep in mind that since DataFetcher will fire callbacks everytime it doesn't find data, you might run into a problem with simultaneous identical requests (for example, requesting the same product id at the same time). You should take care about it yourself, for example, you can check whether there is any similar request at the moment, like this:

```js
function getProductInfo(productID) {
    if (!isRequesting[productID]) {
        isRequesting[productID] = true;

        requestProductInfo(productID);
    }
}
```

### Using objects in paths
We can use objects as parts of data dependencies paths like this:

```js
@DataWatcher((props, state) => ({
    products: [
        'data',
        'products',
        'list',
        {
            sort_type: state.sortType
        }
    ]
}))
```

We use Baobab's `select` method to do that, so please take a look at how it works: https://github.com/Yomguithereal/baobab/wiki/Select-state

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
