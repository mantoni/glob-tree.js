/*
 * glob-tree.js
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var inherits = require('inherits');
var liveTree = require('live-tree');
var iterator = require('./iterator');
var matchers = require('./matcher-iterator');

function Node(name) {
  Node.super_.call(this, name);
}

inherits(Node, liveTree.Node);

Node.prototype._add = function (node) {
  Node.super_.prototype._add.call(this, node);
  var name = node.name;
  node.path = this.path ? (this.path + '.' + name) : name;
  if (name.indexOf('*') !== -1) {
    this._matchers = true;
  }
};

Node.prototype.iterator = function (match, opts) {
  if (opts && opts.onlyMatchers) {
    return matchers.create(this, match);
  }
  var i = iterator.create(this, match);
  if ((opts && !opts.matchers) || !this._matchers) {
    return i;
  }
  var m = matchers.create(this, match);
  m._a.push(i);
  return m;
};

exports.Node = Node;
