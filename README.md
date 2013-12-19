# glob-tree.js [![Build Status](https://secure.travis-ci.org/mantoni/glob-tree.js.png?branch=master)](http://travis-ci.org/mantoni/glob-tree.js)

Tree with glob iterator. Glob expressions can be used to iterate over matching
sub trees. The tree can be modified while iterating over the nodes.

Repository: <https://github.com/mantoni/glob-tree.js>

---

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
n.set('a.b', 3);
n.set('a.c', 7);

var c, i = n.iterator('a.*');
while ((c = i.next()) !== undefined) {
  console.log(c.value);
}
```

## Node API

The node is derived from [live-tree][] node and overrides the iterator
function:

- `iterator(match)`: Returns a new `Iterator` for the given match expression

[live-tree]: https://github.com/mantoni/live-tree.js

## Iterator API

The iterator is derived from [min-iterator][].

- `Iterator(node, match)`: Returns a new Iterator using the given root node and
  match expression
- `next()`: Returns the next node in the tree. If there are no items left,
  `undefined` is returned.

[min-iterator]: https://github.com/mantoni/min-iterator.js

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

Then these `match` parameters can be passed to `n.iterator(match)`:

- `**` -> 1, 2, 3, 4
- `*` -> 5
- `x.**` -> 3, 4
- `x.*` -> 3
- `*.b` -> 1, 3
- `**.c` -> 2, 4
- `x.*.c` -> 4

## License

MIT
