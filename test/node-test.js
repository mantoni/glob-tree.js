/*
 * glob-tree.js
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*globals describe, it, before, after, beforeEach, afterEach*/
'use strict';

var assert = require('assert');

var LiveTreeNode = require('live-tree').Node;
var MinIterator  = require('min-iterator');
var Node         = require('../lib/node').Node;


function values(i) {
  return i.toArray().map(function (n) {
    return n.value;
  });
}

function matcherTree() {
  var n = new Node('root');
  n.set('a', 3);
  n.set('b', 4);
  n.set('*', 2);
  n.set('**', 1);
  return n;
}

describe('node', function () {

  it('is instance of live-tree node', function () {
    var n = new Node('root');

    assert(n instanceof LiveTreeNode);
  });

  it('invokes super constructor', function () {
    var n = new Node('root');

    assert.equal(n.name, 'root');
  });

  it('returns an iterator', function () {
    var n = new Node('root');
    n.set('a', 1);
    n.set('b', 2);

    var i = n.iterator('*');

    assert(i instanceof MinIterator);
    assert.deepEqual(values(i), [1, 2]);
  });

  it('returns an iterator that includes all', function () {
    var n = matcherTree();

    var i = n.iterator();

    assert(i instanceof MinIterator);
    assert.deepEqual(values(i), [1, 2, 3, 4]);
  });

  it('includes wildcard only once', function () {
    var n = new Node('root');
    n.set('**', 1);
    n.set('*', 2);

    var i = n.iterator('**');

    assert(i instanceof MinIterator);
    assert.deepEqual(values(i), [1, 2]);
  });

  it('returns an iterator that includes matchers', function () {
    var n = matcherTree();

    var i = n.iterator('a');

    assert(i instanceof MinIterator);
    assert.deepEqual(values(i), [1, 2, 3]);
  });

  it('returns an iterator that excludes matchers', function () {
    var n = matcherTree();

    var i = n.iterator('a', {
      matchers : false
    });

    assert(i instanceof MinIterator);
    assert.deepEqual(values(i), [3]);
  });

  it('excludes exact match', function () {
    var n = matcherTree();

    var i = n.iterator('*', {
      matchers : false
    });

    assert(i instanceof MinIterator);
    assert.deepEqual(values(i), [3, 4]);
  });

  it('does not exclude matchers for empty opts', function () {
    var n = matcherTree();

    var i = n.iterator('a', {});

    assert(i instanceof MinIterator);
    assert.deepEqual(values(i), [1, 2, 3]);
  });

  it('returns an iterator that only includes matchers', function () {
    var n = matcherTree();

    var i = n.iterator('a', {
      onlyMatchers : true
    });

    assert(i instanceof MinIterator);
    assert.deepEqual(values(i), [1, 2]);
  });

  it('does not return * twice', function () {
    var n = new Node('root');
    n.set('*', 1);
    n.set('a', 2);

    var i = n.iterator('*');

    assert.deepEqual(values(i), [1, 2]);
  });

  it('does not return ** twice', function () {
    var n = new Node('root');
    n.set('**', 1);
    n.set('a', 2);

    var i = n.iterator('**');

    assert.deepEqual(values(i), [1, 2]);
  });

  it('does not return *.b twice', function () {
    var n = new Node('root');
    n.set('*.b', 1);
    n.set('a.b', 2);

    var i = n.iterator('*.b');

    assert.deepEqual(values(i), [1, 2]);
  });

  it('does not return **.a twice', function () {
    var n = new Node('root');
    n.set('**.b', 1);
    n.set('a.b', 2);

    var i = n.iterator('**.b');

    assert.deepEqual(values(i), [1, 2]);
  });

  it('finds a.* with **', function () {
    var n = new Node('root');
    n.set('a.*', 1);

    var i = n.iterator('**');

    assert.deepEqual(values(i), [1]);
  });

  it('finds *.a with **', function () {
    var n = new Node('root');
    n.set('*.a', 1);

    var i = n.iterator('**');

    assert.deepEqual(values(i), [1]);
  });

  it('finds *.a and *.b with a.*', function () {
    var n = new Node('root');
    n.set('*.a', 1);
    n.set('*.b', 2);

    var i = n.iterator('a.*');

    assert.deepEqual(values(i), [1, 2]);
  });

  /*
  it('finds a.* and b.* with *.a', function () {
    var n = new Node('root');
    n.set('a.*', 1);
    n.set('b.*', 2);

    var i = n.iterator('*.a');

    assert.deepEqual(values(i), [1, 2]);
  });
  */

  it('finds *.a.c and *.b.c with a.*.c', function () {
    var n = new Node('root');
    n.set('*.a.c', 1);
    n.set('*.b.c', 2);

    var i = n.iterator('a.*.c');

    assert.deepEqual(values(i), [1, 2]);
  });

  it('finds *.a.c and *.b.c with a.**.c', function () {
    var n = new Node('root');
    n.set('*.a.c', 1);
    n.set('*.b.c', 2);

    var i = n.iterator('a.**.c');

    assert.deepEqual(values(i), [1, 2]);
  });

});
