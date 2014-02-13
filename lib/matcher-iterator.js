/*
 * glob-tree.js
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var inherits    = require('inherits');
var MinIterator = require('min-iterator');
var iterator    = require('./iterator');

function nextChild(it, c, x) {
  var m = it.m, p;
  while (!c) {
    p = m.indexOf('.');
    if (p === -1 || (c = it.n = it.n._map[m.substring(0, p)]) === undefined) {
      return;
    }
    m = it.m = m.substring(p + 1);
    c = c._map[x];
  }
  return c;
}

/*
 * Iterator for listeners containing "*".
 */
function SingleMatcherIterator(i, node, match) {
  this.i = i;
  this.n = node;
  this.m = match;
  this.f = true;
}

SingleMatcherIterator.prototype.next = function () {
  var c, p, sub;
  if (this.f) {
    c = this.n._map['*'];
    this.f = false;
  }
  while (true) {
    if (!c && (c = nextChild(this, c, '*')) === undefined) {
      return;
    }
    p = this.m.indexOf('.');
    if (p !== -1) {
      sub = this.m.substring(p + 1);
      if (sub[0] === '*') {
        this.i.a.unshift(iterator.create(c, sub, true));
        return this.i.next();
      }
      if ((c = c.node(sub)) === undefined) {
        return;
      }
    }
    if (c.value) {
      return c;
    }
    if (p === -1) {
      return;
    }
  }
};

/*
 * Iterator for listeners containing "**".
 */
function DoubleMatcherIterator(node, match) {
  this.n = node;
  this.m = match;
  this.p = match.length;
  this.c = node._map['**'];
}

DoubleMatcherIterator.prototype.next = function () {
  var c = this.c, p = this.p;
  while (true) {
    if (!c) {
      if ((c = this.c = nextChild(this, c, '**')) === undefined) {
        return;
      }
      p = this.m.length;
    } else if (p !== this.m.length) {
      c = c.node(this.m.substring(p + 1));
    }
    if ((p = this.p = this.m.lastIndexOf('.', p - 1)) === -1) {
      this.c = null;
    }
    if (c && c.value) {
      return c;
    }
  }
};

/*
 * Iterator for an array of iterators.
 */
function IteratorIterator(a) {
  this.a = a;
}

inherits(IteratorIterator, MinIterator);

IteratorIterator.prototype.next = function () {
  var a = this.a, v;
  while (a.length) {
    v = a[0].next();
    if (v) {
      return v;
    }
    a.shift();
  }
};

function create(node, match) {
  var i = new IteratorIterator([
    new DoubleMatcherIterator(node, match),
    null
  ]);
  i.a[1] = new SingleMatcherIterator(i, node, match);
  return i;
}

exports.create = create;
