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

goog.provide('myphysicslab.sims.pendulum.PendulumApp');

goog.require('myphysicslab.lab.controls.SliderControl');
goog.require('myphysicslab.lab.model.Arc');
goog.require('myphysicslab.lab.model.ConcreteLine');
goog.require('myphysicslab.lab.model.PointMass');
goog.require('myphysicslab.lab.model.SimpleAdvance');
goog.require('myphysicslab.lab.util.DoubleRect');
goog.require('myphysicslab.lab.util.UtilityCore');
goog.require('myphysicslab.lab.util.Vector');
goog.require('myphysicslab.lab.view.DisplayArc');
goog.require('myphysicslab.lab.view.DisplayLine');
goog.require('myphysicslab.lab.view.DisplayShape');
goog.require('myphysicslab.lab.view.DrawingMode');
goog.require('myphysicslab.sims.layout.AbstractApp');
goog.require('myphysicslab.sims.layout.CommonControls');
goog.require('myphysicslab.sims.layout.TabLayout');
goog.require('myphysicslab.sims.pendulum.PendulumSim');

goog.scope(function() {

var lab = myphysicslab.lab;
var sims = myphysicslab.sims;

var AbstractApp = sims.layout.AbstractApp;
var Arc = lab.model.Arc;
var CommonControls = sims.layout.CommonControls;
var DisplayArc = lab.view.DisplayArc;
var DisplayGraph = lab.graph.DisplayGraph;
var DisplayLine = lab.view.DisplayLine;
var DisplayShape = lab.view.DisplayShape;
var DoubleRect = lab.util.DoubleRect;
var DrawingMode = lab.view.DrawingMode;
var ConcreteLine = lab.model.ConcreteLine;
var PendulumSim = sims.pendulum.PendulumSim;
var PointMass = lab.model.PointMass;
var SimpleAdvance = lab.model.SimpleAdvance;
var SliderControl = lab.controls.SliderControl;
var TabLayout = sims.layout.TabLayout;
var UtilityCore = lab.util.UtilityCore;
var Vector = lab.util.Vector;

/**  PendulumApp displays the driven pendulum simulation
{@link myphysicslab.sims.pendulum.PendulumSim PendulumSim}.

* @param {!TabLayout.elementIds} elem_ids specifies the names of the HTML
*    elementId's to look for in the HTML document; these elements are where the user
*    interface of the simulation is created.
* @constructor
* @final
* @extends {AbstractApp}
* @struct
* @export
*/
sims.pendulum.PendulumApp = function(elem_ids) {
  UtilityCore.setErrorHandler();
  var simRect = new DoubleRect(-2, -2.2, 2, 1.5);
  var sim = new PendulumSim();
  var advance = new SimpleAdvance(sim);
  AbstractApp.call(this, elem_ids, simRect, sim, advance, /*eventHandler=*/sim,
      /*energySystem=*/sim);

  this.rod = new DisplayLine(this.simList.getConcreteLine('rod'));
  this.displayList.add(this.rod);
  this.drive = new DisplayArc(this.simList.getArc('drive'));
  this.displayList.add(this.drive);
  this.bob = new DisplayShape(this.simList.getPointMass('bob')).setFillStyle('blue');
  this.displayList.add(this.bob);
  sim.modifyObjects();

  this.addPlaybackControls();
  /** @type {!lab.util.ParameterNumber} */
  var pn;
  pn = sim.getParameterNumber(PendulumSim.en.LENGTH);
  this.addControl(new SliderControl(pn, 0.1, 10.1, /*multiply=*/true));

  pn = sim.getParameterNumber(PendulumSim.en.DAMPING);
  this.addControl(new SliderControl(pn, 0, 1, /*multiply=*/false));

  pn = sim.getParameterNumber(PendulumSim.en.MASS);
  this.addControl(new SliderControl(pn, 0.2, 20.2, /*multiply=*/true));

  pn = sim.getParameterNumber(PendulumSim.en.DRIVE_AMPLITUDE);
  this.addControl(new SliderControl(pn, 0, 10, /*multiply=*/false));

  pn = sim.getParameterNumber(PendulumSim.en.DRIVE_FREQUENCY);
  this.addControl(new SliderControl(pn, 0, 10, /*multiply=*/false));

  pn = sim.getParameterNumber(PendulumSim.en.GRAVITY);
  this.addControl(new SliderControl(pn, 0, 20, /*multiply=*/false));

  this.addStandardControls();

  this.graph.line.setDrawingMode(DrawingMode.DOTS);
  this.makeEasyScript();
  this.addURLScriptButton();
};
var PendulumApp = sims.pendulum.PendulumApp;
goog.inherits(PendulumApp, AbstractApp);

if (!UtilityCore.ADVANCED) {
  /** @inheritDoc */
  PendulumApp.prototype.toString = function() {
    return this.toStringShort().slice(0, -1)
        +', bob: '+this.bob.toStringShort()
        +', rod: '+this.rod.toStringShort()
        +', drive: '+this.drive.toStringShort()
        + PendulumApp.superClass_.toString.call(this);
  };
};

/** @inheritDoc */
PendulumApp.prototype.getClassName = function() {
  return 'PendulumApp';
};

/** @inheritDoc */
PendulumApp.prototype.defineNames = function(myName) {
  PendulumApp.superClass_.defineNames.call(this, myName);
  this.terminal.addRegex('rod|drive|bob',
      myName);
};

}); // goog.scope
