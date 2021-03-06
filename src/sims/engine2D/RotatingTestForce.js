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

goog.provide('myphysicslab.sims.engine2D.RotatingTestForce');

goog.require('myphysicslab.lab.engine2D.RigidBody');
goog.require('myphysicslab.lab.engine2D.RigidBodySim');
goog.require('myphysicslab.lab.model.CoordType');
goog.require('myphysicslab.lab.model.Force');
goog.require('myphysicslab.lab.model.ForceLaw');
goog.require('myphysicslab.lab.util.UtilityCore');
goog.require('myphysicslab.lab.util.Vector');

goog.scope(function() {

var CoordType = myphysicslab.lab.model.CoordType;
var Force = myphysicslab.lab.model.Force;
var ForceLaw = myphysicslab.lab.model.ForceLaw;
var RigidBody = myphysicslab.lab.engine2D.RigidBody;
var RigidBodySim = myphysicslab.lab.engine2D.RigidBodySim;
var UtilityCore = myphysicslab.lab.util.UtilityCore;
var Vector = myphysicslab.lab.util.Vector;

/** A ForceLaw that creates a Force whose direction rotates continuously.
* @param {!myphysicslab.lab.engine2D.RigidBodySim} sim
* @param {!myphysicslab.lab.engine2D.RigidBody} body
* @param {!myphysicslab.lab.util.Vector} location_body
* @param {number} magnitude
* @param {number} rotation_rate
* @constructor
* @final
* @struct
* @implements {myphysicslab.lab.model.ForceLaw}
*/
myphysicslab.sims.engine2D.RotatingTestForce = function(sim, body, location_body, magnitude, rotation_rate) {
  /**
  * @type {!myphysicslab.lab.engine2D.RigidBodySim}
  * @private
  */
  this.sim_ = sim;
  /**
  * @type {!myphysicslab.lab.engine2D.RigidBody}
  * @private
  */
  this.body_ = body;
  /**
  * @type {!myphysicslab.lab.util.Vector}
  * @private
  */
  this.location_body_ = location_body;
  /**
  * @type {number}
  * @private
  */
  this.magnitude_ = magnitude;
  /**
  * @type {number}
  * @private
  */
  this.rotation_rate_ = rotation_rate;
};
var RotatingTestForce = myphysicslab.sims.engine2D.RotatingTestForce;

if (!UtilityCore.ADVANCED) {
  /** @inheritDoc */
  RotatingTestForce.prototype.toString = function() {
    return 'RotatingTestForce{body: "'+this.body_.getName()+'"}';
  };

  /** @inheritDoc */
  RotatingTestForce.prototype.toStringShort = function() {
    return 'RotatingTestForce{body: "'+this.body_.getName()+'"}';
  };
};

/** @inheritDoc */
RotatingTestForce.prototype.disconnect = function() {
};

/** @inheritDoc */
RotatingTestForce.prototype.getBodies = function() {
  return [this.body_];
};

/** @inheritDoc */
RotatingTestForce.prototype.calculateForces = function() {
  var t = this.rotation_rate_ * this.sim_.getTime();
  var direction_body = new Vector(this.magnitude_*Math.cos(t),
    this.magnitude_*Math.sin(t));
  var f = new Force('rotating', this.body_,
      /*location=*/this.location_body_, CoordType.BODY,
      /*direction=*/direction_body, CoordType.BODY);
  return [f];
};

/** @inheritDoc */
RotatingTestForce.prototype.getPotentialEnergy = function() {
  return 0;
};

}); // goog.scope
