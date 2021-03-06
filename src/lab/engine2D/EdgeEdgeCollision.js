// Copyright 2016 Erik Neumann.  All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('myphysicslab.lab.engine2D.EdgeEdgeCollision');

goog.require('goog.asserts');
goog.require('myphysicslab.lab.engine2D.Edge');
goog.require('myphysicslab.lab.engine2D.RigidBodyCollision');
goog.require('myphysicslab.lab.engine2D.UtilEngine');
goog.require('myphysicslab.lab.util.UtilityCore');
goog.require('myphysicslab.lab.util.Vector');

goog.scope(function() {

var Edge = myphysicslab.lab.engine2D.Edge;
var NF5 = myphysicslab.lab.util.UtilityCore.NF5;
var NF7 = myphysicslab.lab.util.UtilityCore.NF7;
var NF9 = myphysicslab.lab.util.UtilityCore.NF9;
var NFE = myphysicslab.lab.util.UtilityCore.NFE;
var RigidBodyCollision = myphysicslab.lab.engine2D.RigidBodyCollision;
var UtilEngine = myphysicslab.lab.engine2D.UtilEngine;
var UtilityCore = myphysicslab.lab.util.UtilityCore;
var Vector = myphysicslab.lab.util.Vector;

/** A RigidBodyCollision between two Edges.

* @param {!myphysicslab.lab.engine2D.Edge} primaryEdge the first Edge of the
  collision
* @param {!myphysicslab.lab.engine2D.Edge} normalEdge the second Edge of the
  collision, which determines the normal vector
* @constructor
* @final
* @struct
* @extends {myphysicslab.lab.engine2D.RigidBodyCollision}
*/
myphysicslab.lab.engine2D.EdgeEdgeCollision = function(primaryEdge, normalEdge) {
  RigidBodyCollision.call(this, primaryEdge.getBody(), normalEdge.getBody(),
      /*joint=*/false);
  /** edge of primary object
  * @type {!myphysicslab.lab.engine2D.Edge}
  * @private
  */
  this.primaryEdge = primaryEdge;
  /** edge of normal body
  * @type {!myphysicslab.lab.engine2D.Edge}
  * @private
  */
  this.normalEdge = normalEdge;
};
var EdgeEdgeCollision = myphysicslab.lab.engine2D.EdgeEdgeCollision;
goog.inherits(EdgeEdgeCollision, RigidBodyCollision);

if (!UtilityCore.ADVANCED) {
  /** @inheritDoc */
  EdgeEdgeCollision.prototype.toString = function() {
    return EdgeEdgeCollision.superClass_.toString.call(this).slice(0, -1)
        +', primaryEdge: '+ this.primaryEdge.getIndex()
        +', normalEdge: '+ this.normalEdge.getIndex()
        +'}';
  };
};

/** @inheritDoc */
EdgeEdgeCollision.prototype.getClassName = function() {
  return 'EdgeEdgeCollision';
};

/** @inheritDoc */
EdgeEdgeCollision.prototype.checkConsistent = function() {
  EdgeEdgeCollision.superClass_.checkConsistent.call(this);
  // both primary and normal edge always exist for non-joint
  goog.asserts.assert( this.primaryEdge != null );
  goog.asserts.assert( this.primaryEdge.isStraight() == !this.ballObject );
  goog.asserts.assert( this.normalEdge != null );
  goog.asserts.assert( this.normalEdge.isStraight() == !this.ballNormal );
};

/** @inheritDoc */
EdgeEdgeCollision.prototype.hasEdge = function(edge) {
  // if edge is null, then always returns false
  if (edge == null) {
    return false;
  }
  return edge == this.normalEdge || edge == this.primaryEdge;
};

/** @inheritDoc */
EdgeEdgeCollision.prototype.similarTo = function(c) {
  if (!c.hasBody(this.primaryBody) || !c.hasBody(this.normalBody)) {
    return false;
  }
  if (!c.hasEdge(this.normalEdge)) {
    return false;
  }
  if (!c.hasEdge(this.primaryEdge)) {
    return false;
  }
  // both collisions involve same bodies and same edges
  // Next see if these collisions (which are between the same edges)
  // are close in distance and have similar normals.
  var nearness = UtilEngine.nearness(this.radius1, this.radius2, this.distanceTol_);
  // find distance between the collisions
  // @todo  consider impact2 here???
  var d = this.impact1.subtract(c.impact1);
  var distSqr = d.lengthSquared();
  // if the two collisions are close together in space
  if (distSqr > nearness*nearness) {
    return false;
  }
  // if the normals are similar; look at dot product of normals
  var normality = Math.abs(this.normal.dotProduct(c.normal));
  if (normality < 0.9) {
    return false;
  }
  return true;
};

/** @inheritDoc */
EdgeEdgeCollision.prototype.updateCollision = function(time) {
  this.primaryEdge.improveAccuracyEdge(this, this.normalEdge);
  EdgeEdgeCollision.superClass_.updateCollision.call(this, time);
};

}); // goog.scope
