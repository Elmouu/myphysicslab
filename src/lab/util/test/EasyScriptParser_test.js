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

goog.provide('myphysicslab.lab.util.test.EasyScriptParser_test');

goog.require('goog.array');
goog.require('myphysicslab.lab.util.UtilityCore');
goog.require('myphysicslab.lab.util.Terminal');
goog.require('myphysicslab.lab.util.EasyScriptParser');
goog.require('myphysicslab.lab.model.ConcreteVariable');
goog.require('myphysicslab.lab.model.VarsList');
goog.require('myphysicslab.lab.view.SimView');
goog.require('myphysicslab.lab.view.ScreenRect');
goog.require('myphysicslab.lab.util.DoubleRect');
goog.require('goog.testing.jsunit');

var testEasyScript1 = function() {
  var UtilityCore = myphysicslab.lab.util.UtilityCore;
  var EasyScriptParser = myphysicslab.lab.util.EasyScriptParser;
  var Terminal = myphysicslab.lab.util.Terminal;
  var ConcreteVariable = myphysicslab.lab.model.ConcreteVariable;
  var VarsList = myphysicslab.lab.model.VarsList;
  var SimView = myphysicslab.lab.view.SimView;
  var DoubleRect = myphysicslab.lab.util.DoubleRect;
  var ScreenRect = myphysicslab.lab.view.ScreenRect;
  // Make several Subjects for EasyScriptParser to operate on:
  // a VarsList, and two SimViews.
  var var_names = [
    'position',
    'velocity',
    'work from damping',
    'time',
    'acceleration',
    'kinetic energy',
    'spring energy',
    'total energy'
  ];
  var i18n_names = [
    'Position',
    'Geschwindigkeit',
    'Arbeit von D\u00e4mpfung',
    'Zeit',
    'Beschleunigung',
    'kinetische Energie',
    'Federenergie',
    'gesamte Energie'
  ];
  var va = new VarsList(var_names, i18n_names);
  va.setComputed(2, 4, 5, 6, 7);
  va.setValues([1.1, 2.2, 3.3, 4.4, 5.5, 6.6, 7.7, 8.8]);
  assertEquals('VARIABLES', va.getName());
  var screenRect = new ScreenRect(/*top=*/0, /*left=*/0, /*width=*/500, /*height=*/300);
  var simRect1 = new DoubleRect(/*left=*/-5, /*bottom=*/-5, /*right=*/5, /*top=*/5);
  var simView1 = new SimView('view1', simRect1);
  simView1.setScreenRect(screenRect);
  assertEquals('VIEW1', simView1.getName());
  var simRect2 = new DoubleRect(/*left=*/0, /*bottom=*/0, /*right=*/1, /*top=*/1);
  var simView2 = new SimView('view2', simRect2);
  simView2.setScreenRect(screenRect);
  assertEquals('VIEW2', simView2.getName());

  // set up the Terminal with our EasyScriptParser
  var output_elem = /**@type {!HTMLInputElement}*/(document.createElement('textarea'));
  var input_elem = /**@type {!HTMLInputElement}*/(document.createElement('input'));
  input_elem.type = 'text';
  window.terminal = new Terminal(input_elem, output_elem);
  var t = window.terminal;
  Terminal.stdRegex(t);
  assertEquals(4, t.eval('2+2'));
  // EasyScriptParser operates on three Subjects, two are the same type with same
  // Parameter names.
  var easyScript = new EasyScriptParser([va, simView1, simView2]);
  easyScript.saveStart();
  t.setParser(easyScript);

  assertEquals(1.1, t.eval('position'));
  assertEquals(1.1, t.eval('position;'));

  // direct calls to EasyScriptParser.parse()
  assertEquals(1.1, easyScript.parse('position'));
  assertEquals(2.2, easyScript.parse('variables.velocity;'));
  assertUndefined(easyScript.parse('foobar'));

  // no changes, so script() should return empty string
  assertEquals('', easyScript.script());
  // script() ignores automatically computed variables
  assertEquals(42, t.eval('kinetic_energy=42'));
  assertEquals(42, t.eval('kinetic_energy'));
  assertEquals('', easyScript.script());

  // test various syntaxes for getting and setting parameters
  assertEquals(3.14, t.eval('POSITION=3.14'));
  assertEquals(3.14, t.eval('VARIABLES.POSITION'));
  assertEquals(3.14, t.eval('variables.position'));
  assertEquals('POSITION=3.14;', easyScript.script());
  assertEquals(-3.1456, t.eval('VARIABLES.POSITION=-3.1456'));
  assertEquals('POSITION=-3.1456;', easyScript.script());
  assertEquals(-3.1456, t.eval('position'));
  assertEquals(-3.1456, t.eval('time;position'));
  assertEquals(-3.1456, t.eval('time;position;'));
  assertEquals(4.4, t.eval('time;'));

  // script() ignores automatically computed variables
  assertEquals(99, easyScript.parse('total_energy=99'));
  assertEquals(99, t.eval('total_energy'));
  assertEquals('POSITION=-3.1456;', easyScript.script());

  // The two SimView subjects have Parameters with same name. SimView1 precedes
  // SimView2, so its Parameters are found when no Subject specified
  assertEquals(10, t.eval('width'));
  assertEquals(10, t.eval('view1.width'));
  assertEquals(10, t.eval('view1.width;'));
  assertEquals(10, t.eval('VIEW1.width'));
  assertEquals(1, t.eval('view2.width'));
  assertEquals(1, t.eval('VIEW2.WIDTH;'));
  assertEquals(10, t.eval('height'));
  assertEquals(true, t.eval('SCALE_X_Y_TOGETHER'));
  assertEquals(5, t.eval('width=5'));
  assertEquals(5, t.eval('height'));
  assertEquals('POSITION=-3.1456;VIEW1.WIDTH=5;VIEW1.HEIGHT=5;', easyScript.script());
  assertEquals(false, t.eval('SCALE_X_Y_TOGETHER=false'));
  assertEquals(20, t.eval('view1.height=20;'));
  assertEquals(5, t.eval('width'));
  assertEquals(false, t.eval('SCALE_X_Y_TOGETHER'));
  assertEquals(true, t.eval('view2.SCALE_X_Y_TOGETHER'));
  assertEquals(2, t.eval('view2.width=2'));
  assertEquals(2, t.eval('view2.height'));
  assertEquals('POSITION=-3.1456;VIEW1.WIDTH=5;VIEW1.HEIGHT=20;'
      +'VIEW1.SCALE_X_Y_TOGETHER=false;VIEW2.WIDTH=2;VIEW2.HEIGHT=2;',
      easyScript.script());

  // Test that semi-colons inside brackets don't break up the command
  // This adds all the variables together.
  t.z.va = va;
  assertEquals(165.1, t.eval(
      'position=1;goog.array.reduce(z.va.toArray(), '
      +'function(r, v) { return r+v.getValue(); }, 0)'));

  assertSameElements('VARIABLES.POSITION,VARIABLES.VELOCITY,VARIABLES.WORK_FROM_DAMPING,VARIABLES.TIME,VARIABLES.ACCELERATION,VARIABLES.KINETIC_ENERGY,VARIABLES.SPRING_ENERGY,VARIABLES.TOTAL_ENERGY,VIEW1.WIDTH,VIEW1.HEIGHT,VIEW1.CENTER_X,VIEW1.CENTER_Y,VIEW1.SCALE_X_Y_TOGETHER,VIEW1.VERTICAL_ALIGN,VIEW1.HORIZONTAL_ALIGN,VIEW1.ASPECT_RATIO,VIEW2.WIDTH,VIEW2.HEIGHT,VIEW2.CENTER_X,VIEW2.CENTER_Y,VIEW2.SCALE_X_Y_TOGETHER,VIEW2.VERTICAL_ALIGN,VIEW2.HORIZONTAL_ALIGN,VIEW2.ASPECT_RATIO'.split(','), easyScript.names());

  // Delete a variable, it should no longer appear in script() or names()
  va.deleteVariables(2, 1);
  easyScript.update();
  assertEquals('POSITION=1;VIEW1.WIDTH=5;VIEW1.HEIGHT=20;'
      +'VIEW1.SCALE_X_Y_TOGETHER=false;VIEW2.WIDTH=2;VIEW2.HEIGHT=2;',
      easyScript.script());
  assertSameElements('VARIABLES.POSITION,VARIABLES.VELOCITY,VARIABLES.TIME,VARIABLES.ACCELERATION,VARIABLES.KINETIC_ENERGY,VARIABLES.SPRING_ENERGY,VARIABLES.TOTAL_ENERGY,VIEW1.WIDTH,VIEW1.HEIGHT,VIEW1.CENTER_X,VIEW1.CENTER_Y,VIEW1.SCALE_X_Y_TOGETHER,VIEW1.VERTICAL_ALIGN,VIEW1.HORIZONTAL_ALIGN,VIEW1.ASPECT_RATIO,VIEW2.WIDTH,VIEW2.HEIGHT,VIEW2.CENTER_X,VIEW2.CENTER_Y,VIEW2.SCALE_X_Y_TOGETHER,VIEW2.VERTICAL_ALIGN,VIEW2.HORIZONTAL_ALIGN,VIEW2.ASPECT_RATIO'.split(','), easyScript.names());

  // Add variable, it should appear in script().
  var newVar = new ConcreteVariable(va, 'FOO_BAR', 'foo-bar');
  newVar.setValue(7);
  var newIdx = va.addVariable(newVar);
  easyScript.update();
  assertEquals('POSITION=1;FOO_BAR=7;VIEW1.WIDTH=5;VIEW1.HEIGHT=20;'
      +'VIEW1.SCALE_X_Y_TOGETHER=false;VIEW2.WIDTH=2;VIEW2.HEIGHT=2;',
      easyScript.script());

  // Test that semi-colons inside strings don't break up the command
  assertTrue(t.eval('z.va.getVariable(0).getName()=="POSITION"'));
  assertFalse(t.eval('z.va.getVariable(0).getName()=="POSITION;"'));

  // Set a Parameter using quoted string
  assertEquals('FULL', t.eval('vertical_align="FULL"'));
  assertEquals('MIDDLE', t.eval('horizontal_align=\'MIDDLE\''));

  // Subjects with duplicate names should cause an exception.
  assertThrows(function() { new EasyScriptParser([va, simView1, simView2, va]) });

  // volatile Subject not included in list of Subjects
  assertThrows(function() { new EasyScriptParser([va, simView1], [simView2]) });

  // Test the EasyScriptParser.addCommand() function
  easyScript.addCommand('how_are_you', function() { return 'OK'; }, 'tells how you are');
  assertEquals('OK', easyScript.parse('how_are_you'));
  assertEquals('OK', easyScript.parse('HOW_ARE_YOU'));
  assertEquals('OK', t.eval('how_are_you'));
  assertEquals('OK', t.eval('HOW_ARE_YOU'));

  delete window.terminal;
};
goog.exportProperty(window, 'testEasyScript1', testEasyScript1);

var testEasyScript2 = function() {
  var UtilityCore = myphysicslab.lab.util.UtilityCore;
  var EasyScriptParser = myphysicslab.lab.util.EasyScriptParser;

  // Test the EasyScriptParser.unquote() function:
  assertEquals('', EasyScriptParser.unquote("''"));
  assertEquals('', EasyScriptParser.unquote('""'));
  assertEquals(' ', EasyScriptParser.unquote('" "'));
  assertEquals('foo', EasyScriptParser.unquote('foo'));
  assertEquals('foo', EasyScriptParser.unquote('"foo"'));
  assertEquals('foo', EasyScriptParser.unquote("'foo'"));
  assertEquals('foo"bar', EasyScriptParser.unquote('"foo\\"bar"'));
  assertEquals('foo\'bar', EasyScriptParser.unquote("'foo\\'bar'"));
  assertEquals('foo\\', EasyScriptParser.unquote('"foo\\"'));

  // Test some escaped characters
  assertEquals('foo\nbar', EasyScriptParser.unquote("'foo\\nbar'"));
  assertEquals('foo\tbar', EasyScriptParser.unquote("'foo\\tbar'"));
  assertEquals('foo\\nbar', EasyScriptParser.unquote("'foo\\\\nbar'"));
  assertEquals('foo\'bar', EasyScriptParser.unquote("'foo\\'bar'"));
  assertEquals('foo"bar', EasyScriptParser.unquote("'foo\\\"bar'"));
  assertEquals('"bar', EasyScriptParser.unquote("'\\\"bar'"));
  assertEquals('bar\'', EasyScriptParser.unquote("'bar\\\''"));
};
goog.exportProperty(window, 'testEasyScript2', testEasyScript2);

