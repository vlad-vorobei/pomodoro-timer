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

import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';

import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import { TimerState } from '../state/timerStates.js';
import { TimerDisplay } from './TimerDisplay.js';
import { MenuBuilder } from './MenuBuilder.js';

export const PanelIndicator = GObject.registerClass(
  class PanelIndicator extends PanelMenu.Button {
    _init(stateManager, extension) {
      super._init(0.0, 'Pomodoro Timer');

      this._stateManager = stateManager;
      this._extension = extension;

      this._box = new St.BoxLayout({
        style_class: 'panel-status-menu-box',
        vertical: false,
        x_expand: false,
        y_expand: false,
      });

      this._label = new St.Label({
        text: '',
        y_align: Clutter.ActorAlign.CENTER,
        style_class: 'pomodoro-timer-label',
        visible: false,
      });
      this._box.add_child(this._label);

      this._icon = new St.Icon({
        style_class: 'system-status-icon',
        icon_size: 16,
      });

      this._box.add_child(this._icon);

      this.add_child(this._box);

      this._timerDisplay = new TimerDisplay(this._icon, this._label, this._extension);

      this._menuBuilder = new MenuBuilder(this.menu, this._stateManager);
      this._menuBuilder.build();

      this._connectSignals();

      this._updateDisplay();
    }

    _connectSignals() {
      this._stateChangedId = this._stateManager.connect('state-changed',
        (manager, oldState, newState) => {
          this._onStateChanged(oldState, newState);
        });

      this._timeUpdatedId = this._stateManager.connect('time-updated',
        (manager, time) => {
          this._onTimeUpdated(time);
        });

      this._timerCompletedId = this._stateManager.connect('timer-completed',
        (manager, state) => {
          this._onTimerCompleted(state);
        });
    }

    _onStateChanged(oldState, newState) {
      console.log(`State changed from ${oldState} to ${newState}`);
      this._updateDisplay();
      this._menuBuilder.updateMenuItems(newState);
    }

    _onTimeUpdated(time) {
      this._timerDisplay.updateTime(
        time,
        this._stateManager.getCurrentState()
      );
    }

    _onTimerCompleted(state) {
      this._showNotification(state);
    }

    _updateDisplay() {
      const state = this._stateManager.getCurrentState();
      const time = this._stateManager.getCurrentTime();
      const pauseType = this._stateManager.getPauseType();

      this._timerDisplay.updateState(state, pauseType);
      this._timerDisplay.updateTime(time, state);
    }

    _showNotification(state) {
      let message = '';

      switch(state) {
        case TimerState.WORK:
          message = 'ðŸŽ‰ Work session completed! Time for a break!';
          break;
        case TimerState.BREAK:
          message = 'â˜• Break is over! Ready to work?';
          break;
      }

      if (message) {
        Main.notify('Pomodoro Timer', message);
      }
    }

    destroy() {
      if (this._stateChangedId) {
        this._stateManager.disconnect(this._stateChangedId);
      }
      if (this._timeUpdatedId) {
        this._stateManager.disconnect(this._timeUpdatedId);
      }
      if (this._timerCompletedId) {
        this._stateManager.disconnect(this._timerCompletedId);
      }

      this._timerDisplay.destroy();
      this._menuBuilder.destroy();

      super.destroy();
    }
  });