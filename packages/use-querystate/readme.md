# Description

`useQueryState` is a react hook for storing a state object in the query string.  It also responds to changes in the query string and returns the specified portion to you like it was a state.

There are two parts to this hook - first the hook itself, and then a batch function which provides a way to consolidate multiple query state changes together into one location update.

### **Syntax**
> const [state, setState] = useQueryState(initialState[, options])

#### Parameters

> `initialState`\
> An object representing the initial (default) state derived from the query string when the query string is empty.

> `options`\
> Options to control how to parse and save the state\
> \
> `prefix?`: A `string` key that should prefix this set of values when serializing to the query string. Ex. if two components want to use the same keys (like `page`) you can give them each a different prefix.\
> `internalState?`: A boolean indicating to _not_ serialize to the query string. Useful in the same scenario as the prefix. Essentially works like a `setState` wrapper.\
> `types?`: An object containing the type definitions for the query string. If not specified they will be derived from the `initialState`. See the [@borvik/querystring](https://github.com/Borvik/use-querystate/blob/main/packages/querystring/readme.md#definition-of-types) for the type definitions.

#### Return value

Returns a `tuple` containing the state, and a setter function.  Unlike the setter function returned from `setState`, _this_ setter function allows for _partial_ state updates.

## `batchedQSUpdate`

### **Syntax**
> batchedQSUpdate(cb: Function)

#### Parameters

> `cb`\
> A synchronous callback function, inside which you make your various query state changes. After this callback is done, it will update the query string.

### **Description**

A wrapper function for setting multiple query states all at the same time.

# **Examples**

```typescript
import { useQueryState } from '@borvik/use-querystate';

const [pagination, setPagination] = useQueryState({page: 1, pageSize: 10});
// pagination = {page: 1, pageSize: 10} assuming no query string

// don't call together like this, these are just examples of _how_ to call
setPagination({ page: 2 }); // ?page=2
setPagination({ page: 1, pageSize: 15 }); // ?pageSize=15
```

```typescript
import { batchedQSUpdate, useQueryState } from '@borvik/use-querystate';

const [pagination, setPagination] = useQueryState({page: 1, pageSize: 10});
// pagination = {page: 1, pageSize: 10} assuming no query string

const [filter, setFilter] = useQueryState({filter: null}, {
  types: {
    filter: 'any',
  }
});
// filter = { filter: null } assuming no query string

batchedQSUpdate(() => {
  setPagination({ page: 2 });
  setFilter({ filter: 'use-querystate' });
}); // ?page=2&filter=use-querystate
```

```typescript
import { useQueryState } from '@borvik/use-querystate';

const [pagination, setPagination] = useQueryState({page: 1, pageSize: 10}, { prefix: 'my-cmp' });
// pagination = {page: 1, pageSize: 10} assuming no query string

setPagination({ page: 2 }); // ?my-cmp=(page:2)
```