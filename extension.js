/*
 * Copyright (C) 2025 Vladyslav Vorobei
 *
 * This file is part of Pomodoro Timer GNOME Extension.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import { StateManager } from './src/state/StateManager.js';
import { PanelIndicator } from './src/ui/PanelIndicator.js';

export default class PomodoroTimerExtension extends Extension {
  constructor(metadata) {
    super(metadata);
    this._indicator = null;
    this._stateManager = null;
  }

  enable() {
    console.log('Pomodoro Timer: Enabling extension');

    try {
      this._stateManager = new StateManager();

      this._indicator = new PanelIndicator(this._stateManager, this);

      Main.panel.addToStatusArea(
        this.uuid,
        this._indicator,
        1,
        'right'
      );

      console.log('Pomodoro Timer: Extension enabled successfully');
    } catch (error) {
      console.error(error, 'Failed to enable Pomodoro Timer');
    }
  }

  disable() {
    console.log('Pomodoro Timer: Disabling extension');

    try {
      if (this._indicator) {
        this._indicator.destroy();
        this._indicator = null;
      }

      if (this._stateManager) {
        this._stateManager.destroy();
        this._stateManager = null;
      }

      console.log('Pomodoro Timer: Extension disabled successfully');
    } catch (error) {
      console.error(error, 'Failed to disable Pomodoro Timer');
    }
  }
}