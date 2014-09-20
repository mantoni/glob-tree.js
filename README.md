# glob-tree.js

[![Build Status]](https://travis-ci.org/mantoni/glob-tree.js)
[![SemVer]](http://semver.org)
[![License]](https://github.com/mantoni/glob-tree.js/blob/master/LICENSE)

Tree with glob iterator. Glob expressions can be used to iterate over matching
sub trees. The tree can be modified while iterating over the nodes.

## Install with npm

```
npm install glob-tree
```

## Browser compatibility

To use this module in a browser, download the npm package and then use
[Browserify](http://browserify.org) to create a standalone version.

## Usage

```js
var Node = require('glob-tree').Node;

var n = new Node('root');
n.set('**', 3);
n.set('a.b', 7);
n.set('a.c', 42);

var c, i = n.iterator('a.*');
while ((c = i.next()) !== undefined) {
  console.log(c.value);
}
```

## Match expressions

Assuming we have this tree:

```js
var n = new Node('root');
n.set('a.b', 1);
n.set('a.c', 2);
n.set('x.b', 3);
n.set('x.y.c', 4);
n.set('z', 5);
```

You can find nodes with `n.iterator(match)` using wildcards:

|   match   |   result   |
|-----------|------------|
| `'**'`    | 1, 2, 3, 4 |
| `'*'`     | 5          |
| `'x.**'`  | 3, 4       |
| `'x.*'`   | 3          |
| `'*.b'`   | 1, 3       |
| `'**.c'`  | 2, 4       |
| `'x.*.c'` | 4          |

## Matchers

Node names may contain wildcards as well. Assuming we have this tree:

```js
var n = new Node('root');
n.set('**', 1);
n.set('a.**', 2);
n.set('a.*.c', 3);
n.set('a.**.d', 4);
n.set('*.b', 5);
n.set('**.d', 6);
```

Querying for a node will also include the matchers:

|    match    |   result   |
|-------------|------------|
| `'a.b'`     | 1, 2, 5    |
| `'a.b.c'`   | 1, 2, 3    |
| `'a.b.c.d'` | 1, 2, 4, 6 |

## Node API

Node is derived from [live-tree][] Node and overrides the iterator function:

- `iterator(match[, options])`: Returns an `Iterator` for the given match
  expression with these options:
  - `matchers`: whether to include matchers, defaults to `true`
  - `onlyMatchers`: whether to only include matchers, defaults to `false`

Iterator is derived from [min-iterator][].

## License

MIT

[Build Status]: http://img.shields.io/travis/mantoni/glob-tree.js.svg
[SemVer]: http://img.shields.io/:semver-%E2%9C%93-brightgreen.svg
[License]: http://img.shields.io/npm/l/glob-tree.svg
[live-tree]: https://github.com/mantoni/live-tree.js
[min-iterator]: https://github.com/mantoni/min-iterator.js
