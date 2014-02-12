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
var liveTree    = require('live-tree');

/*
 * Iterator for no match.
 */
var NULL_ITERATOR = new MinIterator();


/*
 * Iterator for single node match.
 */
function SingleNodeIterator(node) {
  this.n = node;
}

inherits(SingleNodeIterator, MinIterator);

SingleNodeIterator.prototype.next = function () {
  var n = this.n;
  delete this.n;
  return n;
};


/*
 * Iterator for child node matches.
 */
function ChildrenIterator(node) {
  this.i = node.children.iterator();
}

inherits(ChildrenIterator, MinIterator);

ChildrenIterator.prototype.next = function () {
  var n;
  while ((n = this.i.next()) !== undefined) {
    if (n.path.indexOf('*') === -1 && n.value) {
      return n;
    }
  }
};


/*
 * Iterator for single start expressions like "*.a".
 */
function SingleStarIterator(node, match) {
  this.q = node.children.toArray();
  this.m = match;
}

inherits(SingleStarIterator, MinIterator);

SingleStarIterator.prototype.next = function () {
  var n;
  while (this.q.length) {
    n = this.q.shift().node(this.m);
    if (n && n.path.indexOf('*') === -1 && n.value) {
      return n;
    }
  }
};


/*
 * Iterator for double star expressions like "**.a".
 */
function DoubleStarIterator(node, match, p) {
  this.i = node.children.iterator();
  this.q = [];
  this.p = p;
  this.m = match.substring(2);
}

inherits(DoubleStarIterator, MinIterator);

DoubleStarIterator.prototype.next = function () {
  var n, s, p;
  while (true) {
    while ((n = this.i.next()) !== undefined) {
      if (n.children.length) {
        this.q.push(n.children.iterator());
      } else {
        s = n.path.substring(this.p);
        p = s.indexOf(this.m);
        if (p !== -1 && p === s.length - this.m.length
            && n.path.indexOf('*') === -1) {
          return n;
        }
      }
    }
    if (!this.q.length) {
      return;
    }
    this.i = this.q.shift();
  }
};

function FilterIterator(i) {
  this.i = i;
}

inherits(FilterIterator, MinIterator);

FilterIterator.prototype.next = function () {
  var n;
  while ((n = this.i.next()) !== undefined) {
    if (n.path.indexOf('*') === -1) {
      return n;
    }
  }
};

function create(node, match) {
  if (!match) {
    return new liveTree.Iterator(node);
  }
  var p = match.indexOf('*');
  if (p === -1) {
    node = node.node(match);
    return node && node.value ? new SingleNodeIterator(node) : NULL_ITERATOR;
  }
  if (p !== 0) {
    node = node.node(match.substring(0, p - 1));
    if (!node) {
      return NULL_ITERATOR;
    }
    match = match.substring(p);
  }
  if (match === '*') {
    return new ChildrenIterator(node);
  }
  if (match === '**') {
    return new FilterIterator(new liveTree.Iterator(node));
  }
  if (match[1] === '.') {
    return new SingleStarIterator(node, match.substring(2));
  }
  return new DoubleStarIterator(node, match, p);
}

exports.create = create;
