/*
 * glob-tree.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*globals describe, it*/
'use strict';

var assert   = require('assert');

var Node     = require('../lib/node').Node;
var iterator = require('../lib/iterator');


function toArray(n, match) {
  var a = [];
  var i = iterator.matcher(n, match);
  while ((n = i.next()) !== undefined) {
    a.push(n.value);
  }
  return a;
}


describe('iterator-matcher', function () {

  it('does not return anything by default', function () {
    var n = new Node('root');

    assert.deepEqual([], toArray(n, 'a'));
  });

  it('returns * and ** matchers in correct order', function () {
    var n = new Node('root');
    n.set('*', 2);
    n.set('**', 1);

    assert.deepEqual([1, 2], toArray(n, 'a'));
  });

  it('does not include non-matchers', function () {
    var n = new Node('root');
    n.set('a', 1);

    assert.deepEqual([], toArray(n, 'a'));
  });

  it('does not return * for a.b', function () {
    var n = new Node('root');
    n.set('*', 1);

    assert.deepEqual([], toArray(n, 'a.b'));
  });

  it('returns ** for a.b', function () {
    var n = new Node('root');
    n.set('**', 1);

    assert.deepEqual([1], toArray(n, 'a.b'));
  });

  it('returns **.b and *.b matchers in correct order', function () {
    var n = new Node('root');
    n.set('*.b', 2);
    n.set('**.b', 1);

    assert.deepEqual([1, 2], toArray(n, 'a.b'));
  });

  it('returns ** and **.b matchers in correct order', function () {
    var n = new Node('root');
    n.set('**.b', 2);
    n.set('**', 1);

    assert.deepEqual([1, 2], toArray(n, 'a.b'));
  });

  it('returns a.** and a.* matchers in correct order', function () {
    var n = new Node('root');
    n.set('a.*', 2);
    n.set('a.**', 1);

    assert.deepEqual([1, 2], toArray(n, 'a.b'));
  });

  it('returns **.b and a.** matchers in correct order', function () {
    var n = new Node('root');
    n.set('a.**', 2);
    n.set('**.b', 1);

    assert.deepEqual([1, 2], toArray(n, 'a.b'));
  });

  it('returns *.b and a.** matchers in correct order', function () {
    var n = new Node('root');
    n.set('a.**', 1);
    n.set('*.b', 2);

    assert.deepEqual([1, 2], toArray(n, 'a.b'));
  });

  it('returns **.c and **.b.c matchers in correct order', function () {
    var n = new Node('root');
    n.set('**.b.c', 2);
    n.set('**.c', 1);

    assert.deepEqual([1, 2], toArray(n, 'a.b.c'));
  });

  it('returns **.c and *.b.c matchers in correct order', function () {
    var n = new Node('root');
    n.set('*.b.c', 2);
    n.set('**.c', 1);

    assert.deepEqual([1, 2], toArray(n, 'a.b.c'));
  });

  it('returns a.*.c and *.b.c matchers in correct order', function () {
    var n = new Node('root');
    n.set('a.*.c', 2);
    n.set('*.b.c', 1);

    assert.deepEqual([1, 2], toArray(n, 'a.b.c'));
  });

  it('returns a.*.c and a.** matchers in correct order', function () {
    var n = new Node('root');
    n.set('a.**', 1);
    n.set('a.*.c', 2);

    assert.deepEqual([1, 2], toArray(n, 'a.b.c'));
  });

  it('returns a.*.c and a.b.* matchers in correct order', function () {
    var n = new Node('root');
    n.set('a.*.c', 1);
    n.set('a.b.*', 2);

    assert.deepEqual([1, 2], toArray(n, 'a.b.c'));
  });

  it('returns a.b.*.d and a.b.c.* matchers in correct order', function () {
    var n = new Node('root');
    n.set('a.b.*.d', 1);
    n.set('a.b.c.*', 2);

    assert.deepEqual([1, 2], toArray(n, 'a.b.c.d'));
  });

  it('returns a.**.d and a.**.c.d matchers in correct order', function () {
    var n = new Node('root');
    n.set('a.**.d', 1);
    n.set('a.**.c.d', 2);

    assert.deepEqual([1, 2], toArray(n, 'a.b.c.d'));
  });

  it('returns a.b.**.d and a.**.c.d matchers in correct order', function () {
    var n = new Node('root');
    n.set('a.b.**.d', 1);
    n.set('a.b.c.**', 2);

    assert.deepEqual([1, 2], toArray(n, 'a.b.c.d'));
  });

  it('includes **.b while iterating', function () {
    var n = new Node('root');
    n.set('**', 1);
    var i = iterator.matcher(n, 'a.b');
    i.next();

    n.set('**.b', 2);

    assert.equal(2, i.next().value);
  });

  it('includes a.** while iterating', function () {
    var n = new Node('root');
    n.set('**', 1);
    var i = iterator.matcher(n, 'a.b');
    i.next();

    n.set('a.**', 2);

    assert.equal(2, i.next().value);
  });

  it('includes * while iterating', function () {
    var n = new Node('root');
    n.set('**', 1);
    var i = iterator.matcher(n, 'a');
    i.next();

    n.set('*', 2);

    assert.equal(2, i.next().value);
  });

  it('includes *.b while iterating', function () {
    var n = new Node('root');
    n.set('**', 1);
    var i = iterator.matcher(n, 'a.b');
    i.next();

    n.set('*.b', 2);

    assert.equal(2, i.next().value);
  });

  it('includes a.* while iterating', function () {
    var n = new Node('root');
    n.set('**', 1);
    var i = iterator.matcher(n, 'a.b');
    i.next();

    n.set('a.*', 2);

    assert.equal(2, i.next().value);
  });

});
