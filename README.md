![workflow](https://github.com/do-/node-doix-w2ui/actions/workflows/main.yml/badge.svg)
![Jest coverage](./badges/coverage-jest%20coverage.svg)

`doix-w2ui` is a [w2ui](https://w2ui.com/) adapter for the [doix](https://github.com/do-/node-doix) server platform.

More specifically, this is a translator of [AJAX requests](https://w2ui.com/web/docs/2.0/grid#struct-request) coming from w2grid into [DbQuery](https://github.com/do-/node-doix-db/wiki/DbQuery) instances.

# Installation
```
npm install doix-w2ui
```

# Initialization
`doix-w2ui` is a plug in for database clients, such as [DbClientPg](https://github.com/do-/node-doix-db-postgresql/wiki/DbClientPg). It can be attached to any database connection pool by calling the `plugInto` method:

```js
const {DbPoolPg}   = require ('doix-db-postgresql')
const w2ui = require ('doix-w2ui')

const db = new DbPoolPg ({
  db: conf.db,
  logger: createLogger (conf, 'db'),
})

w2ui.plugInto (db)
```

After that, each `db` instance injected into a [Job](https://github.com/do-/node-doix/wiki/Job) will have the `w2uiQuery` method described in the next section.

# Using in application code
With `doix-w2ui` plugged in, the `db` resource provides the `w2uiQuery` method having the same parameters as [DbModel.createQuery](https://github.com/do-/node-doix-db/wiki/DbModel#createquery):

```js
select_users:    
  async function () {
    const {db} = this
    const query = db.w2uiQuery ([['users']], {order: ['label']})
    const list = await db.getArray (query)
    return {
      all: list, 
      cnt: list [Symbol.for ('count')], 
      portion: query.options.limit
    }
  }
```

In fact, this is the `db.model.createQuery` call, but with some additions:
* the `limit` and `offset` options are overridden with `this.rq.limit` and `this.rq.offset` respectively;
* the `order` list is replaced with the translated `this.rq.sort`, if any (so the `order` passed in argument acts as a default value);
* the 1st query table `filter` option is appended with the translated `this.rq.search`.

## More about search filters.

The base documentation on w2ui [types](https://w2ui.com/web/docs/2.0/w2grid.searches) and [operators](https://w2ui.com/web/docs/2.0/w2grid.operators) can be found at the developers' web site. In this section, only special `doix-w2ui` features are described.

### Operators
`doix-w2ui` supports three extra operators: 

|name|SQL operator|
|-|-|
|is not|<>|
|less!|<|
|more!|>|

Both standard `is` and local `is not` can be used with `value: null`, in which case they a mapped to `IS NULL` and `IS NOT NULL` respectively.

Search terms with `operator: 'between'` are replaced with 'more', 'less' or both, depending on values provided.

### `date` type
For `type: 'date'`, string values are accepted in any numeric `DD ? MM ? YYYY` or `YYYY ? MM ? DD` format. They are all translated into ISO `YYYY-MM-DD` format.

Any `<=` comparison with a date (original `operator: 'less'`; right part of `'between'`) is replaced with the strict `<` comparison with the next date. This makes sense for datetime values.
