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
var Node         = require('../lib/node').Node;


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

    assert.deepEqual(i.toArray(), [n._map.a, n._map.b]);
  });

});
