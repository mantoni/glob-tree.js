/*
 * glob-tree.js
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*globals describe, it*/
'use strict';

var assert      = require('assert');
var MinIterator = require('min-iterator');

var Node        = require('../lib/node').Node;
var iterator    = require('../lib/iterator');


function iteratorMatching(name, match) {
  var n = new Node('root');
  n.set(name, 1);
  return iterator.create(n, match);
}

function iteratorMatchingOne() {
  return iteratorMatching('one', 'one');
}


describe('iterator', function () {

  it('is instance of min-iterator', function () {
    var n = new Node('root');

    var i = iterator.create(n);

    assert(i instanceof MinIterator);
  });

  it('is instance of min-iterator if not matching anything', function () {
    var n = new Node('root');

    var i = iterator.create(n, 'unknown');

    assert(i instanceof MinIterator);
  });

  it('is instance of min-iterator if matching exactly one', function () {
    var i = iteratorMatchingOne();

    assert(i instanceof MinIterator);
  });

  it('returns undefined by default', function () {
    var n = new Node('root');
    var i = iterator.create(n);

    assert.strictEqual(i.next(), undefined);
  });

  it('returns the first child', function () {
    var n = new Node('root');
    n.set('a', 1);
    var i = iterator.create(n);

    assert.strictEqual(i.next(), n._map.a);
  });

  it('returns undefined after next if matching exactly one', function () {
    var i = iteratorMatchingOne();
    i.next();

    assert.strictEqual(i.next(), undefined);
  });

  it('returns undefined if match is not equal', function () {
    var i = iteratorMatching('a', 'unknown');

    assert.strictEqual(i.next(), undefined);
  });

  it('returns node if match is equal', function () {
    var i = iteratorMatching('known', 'known');

    assert(i.next());
  });

  it('returns node if match is single wildcard', function () {
    var n = new Node('root');
    n.set('a', 1);
    var i = iterator.create(n, '*');

    assert.strictEqual(i.next(), n._map.a);
  });

  it('returns undefined for children if match is equal to parent',
    function () {
      var n = new Node('root');
      n.set('a', 1);
      n.set('a.a', 2);
      var i = iterator.create(n, 'a');
      i.next();

      assert.strictEqual(i.next(), undefined);
    });

  it('does not match aaa for *.a', function () {
    var i = iteratorMatching('aaa', '*.a');

    assert.strictEqual(i.next(), undefined);
  });

  it('matches multiple lower case characters', function () {
    var i = iteratorMatching('xyz.a', '*.a');

    assert(i.next());
  });

  it('matches multiple upper case characters', function () {
    var i = iteratorMatching('XYZ.a', '*.a');

    assert(i.next());
  });

  it('matches multiple numeric characters', function () {
    var i = iteratorMatching('123.a', '*.a');

    assert(i.next());
  });

});


function toArray(n, match) {
  var a = [];
  var i = iterator.create(n, match);
  while ((n = i.next()) !== undefined) {
    a.push(n.value);
  }
  return a;
}


describe('iterator.next', function () {

  it('returns first child', function () {
    var n = new Node('root');
    n.set('a', 1);
    var i = iterator.create(n);

    assert.strictEqual(i.next(), n._map.a);
  });

  it('matches *.a', function () {
    var n = new Node('root');
    n.set('a.a', 1);
    n.set('b.a', 2);
    n.set('c.b', 3);

    assert.deepEqual(toArray(n, '*.a'), [1, 2]);
  });

  it('matches *.a if parent has value', function () {
    var n = new Node('root');
    n.set('a', 0);
    n.set('a.a', 1);
    n.set('b.a', 2);
    n.set('c.b', 3);

    assert.deepEqual(toArray(n, '*.a'), [1, 2]);
  });

  it('matches a.*', function () {
    var n = new Node('root');
    n.set('a.a', 1);
    n.set('a.b', 2);
    n.set('b.a', 3);

    assert.deepEqual(toArray(n, 'a.*'), [1, 2]);
  });

  it('matches a.* if parent has value', function () {
    var n = new Node('root');
    n.set('a', 0);
    n.set('a.a', 1);
    n.set('a.b', 2);
    n.set('b.a', 3);

    assert.deepEqual(toArray(n, 'a.*'), [1, 2]);
  });

  it('matches a.*.b', function () {
    var n = new Node('root');
    n.set('a.x.b', 1);
    n.set('a.x.y.b', 2);
    n.set('a.b', 3);

    assert.deepEqual(toArray(n, 'a.*.b'), [1]);
  });

  it('matches nothing without throwing', function () {
    var n = new Node('root');
    n.set('b.a', 1);

    assert.deepEqual(toArray(n, 'a.*'), []);
  });

  it('matches a.**', function () {
    var n = new Node('root');
    n.set('a.b', 1);
    n.set('a.c.d', 2);
    n.set('a.c.e.f', 3);
    n.set('b.a', 4);

    assert.deepEqual(toArray(n, 'a.**'), [1, 2, 3]);
  });

  it('matches a.**.b', function () {
    var n = new Node('root');
    n.set('a.x.b', 1);
    n.set('a.x.y.b', 2);
    n.set('a.b', 3);

    assert.deepEqual(toArray(n, 'a.**.b'), [1, 2]);
  });

  it('return a live-tree iterator for a.**', function () {
    var n = new Node('root');
    n.set('a.b', 1);

    var i = iterator.create(n, 'a.**');

    assert(i instanceof MinIterator);
  });

  it('return a live-tree iterator if no match is given', function () {
    var n = new Node('root');
    n.set('a.b', 1);

    var i = iterator.create(n);

    assert(i instanceof MinIterator);
  });

  it('return a live-tree iterator for **', function () {
    var n = new Node('root');
    n.set('a.b', 1);

    var i = iterator.create(n, '**');

    assert(i instanceof MinIterator);
  });

  it('does not fetch parent iterator for a.*', function () {
    var n = new Node('root');
    n.set('a.b', 1);
    n.children.iterator = null;

    assert.doesNotThrow(function () {
      toArray(n, 'a.*');
    });
  });

  it('does not fetch child iterator for a.*', function () {
    var n = new Node('root');
    n.set('a.b', 1);
    n.set('a.b.c', 2);
    n._map.a._map.b.children.iterator = null;

    assert.doesNotThrow(function () {
      toArray(n, 'a.*');
    });
  });

  it('does not fetch child iterator for *.b', function () {
    var n = new Node('root');
    n.set('a.b', 1);
    n.set('a.b.c', 2);
    n._map.a._map.b.children.iterator = null;

    assert.doesNotThrow(function () {
      toArray(n, '*.b');
    });
  });

  it('does not return undefined for a if it has no value', function () {
    var n = new Node('root');
    n.set('a.b', 1);

    assert.deepEqual([], toArray(n, 'a'));
  });

  it('does not return undefined for a.* if it has no value', function () {
    var n = new Node('root');
    n.set('a.b.c', 1);

    assert.deepEqual([], toArray(n, 'a.*'));
  });

  it('does not return undefined for *.b if it has no value', function () {
    var n = new Node('root');
    n.set('a.b.c', 1);

    assert.deepEqual([], toArray(n, '*.b'));
  });

  it('includes b while iterating *', function () {
    var n = new Node('root');
    n.set('a', 1);
    var i = n.iterator('*');
    i.next();

    n.set('b', 2);

    assert.equal(2, i.next().value);
  });

  it('includes a.b while iterating a.*', function () {
    var n = new Node('root');
    n.set('a.a', 1);
    var i = n.iterator('a.*');
    i.next();

    n.set('a.b', 2);

    assert.equal(2, i.next().value);
  });

  it('includes a.c while iterating **', function () {
    var n = new Node('root');
    n.set('a.b', 1);
    var i = n.iterator('**');
    i.next();

    n.set('a.c', 2);

    assert.equal(2, i.next().value);
  });

  it('includes a.b.d while iterating a.**', function () {
    var n = new Node('root');
    n.set('a.b.c', 1);
    var i = n.iterator('a.**');
    i.next();

    n.set('a.b.d', 2);

    assert.equal(2, i.next().value);
  });

});
