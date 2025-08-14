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
import GLib from 'gi://GLib';

import { TimerState, TimerConstants, PauseType } from './timerStates.js';

export const StateManager = GObject.registerClass({
  Signals: {
    'state-changed': { param_types: [GObject.TYPE_STRING, GObject.TYPE_STRING] },
    'time-updated': { param_types: [GObject.TYPE_INT] },
    'timer-completed': { param_types: [GObject.TYPE_STRING] }
  }
}, class StateManager extends GObject.Object {
  _init() {
    super._init();

    this._currentState = TimerState.STOP;
    this._previousState = null;

    this._currentTime = 0;

    this._pauseType = null;
    this._pauseTime = 0;

    this._timerId = null;
  }

  getCurrentState() {
    return this._currentState;
  }

  getCurrentTime() {
    return this._currentTime;
  }

  getPauseType() {
    return this._pauseType;
  }

  transitionTo(newState) {
    const oldState = this._currentState;

    if (!this._isValidTransition(oldState, newState)) {
      console.log(`Invalid transition from ${oldState} to ${newState}`);
      return false;
    }

    this._stopTimer();

    this._previousState = oldState;

    this._currentState = newState;

    this._initializeState(newState, oldState);

    this.emit('state-changed', oldState, newState);

    return true;
  }

  _initializeState(state, fromState) {
    switch (state) {
      case TimerState.STOP:
        this._currentTime = 0;
        break;

      case TimerState.WORK:
        this._currentTime = this._previousState === TimerState.PAUSE
          ? this._pauseTime
          : TimerConstants.DEFAULT_WORK_TIME;
        this._startTimer();
        break;

      case TimerState.BREAK:
        this._currentTime = this._previousState === TimerState.PAUSE
          ? this._pauseTime
          : TimerConstants.DEFAULT_BREAK_TIME;
        this._startTimer();
        break;

      case TimerState.PAUSE:
        if (fromState === TimerState.WORK) {
          this._pauseType = PauseType.FROM_WORK;
        } else if (fromState === TimerState.BREAK) {
          this._pauseType = PauseType.FROM_BREAK;
        }
        this._pauseTime = this._currentTime;
        break;

      case TimerState.WORK_COMPLETE:
      case TimerState.BREAK_COMPLETE:
        this._currentTime = TimerConstants.COMPLETE_DURATION;
        this._startTimer();
        break;

      case TimerState.WORK_OVERTIME:
      case TimerState.BREAK_OVERTIME:
        this._currentTime = 0;
        this._startTimer(true);
        break;
    }
  }

  _startTimer(countUp = false) {
    this._timerId = GLib.timeout_add(GLib.PRIORITY_DEFAULT,
      TimerConstants.TICK_INTERVAL, () => {
        if (countUp) {
          this._currentTime++;
        } else {
          this._currentTime--;

          if (this._currentTime <= 0) {
            this._handleTimerComplete();
            return GLib.SOURCE_REMOVE;
          }
        }

        this.emit('time-updated', this._currentTime);
        return GLib.SOURCE_CONTINUE;
      });
  }

  _stopTimer() {
    if (this._timerId) {
      GLib.source_remove(this._timerId);
      this._timerId = null;
    }
  }

  _handleTimerComplete() {
    this.emit('timer-completed', this._currentState);

    switch (this._currentState) {
      case TimerState.WORK:
        this.transitionTo(TimerState.WORK_COMPLETE);
        break;
      case TimerState.BREAK:
        this.transitionTo(TimerState.BREAK_COMPLETE);
        break;
      case TimerState.WORK_COMPLETE:
        this.transitionTo(TimerState.WORK_OVERTIME);
        break;
      case TimerState.BREAK_COMPLETE:
        this.transitionTo(TimerState.BREAK_OVERTIME);
        break;
    }
  }

  _isValidTransition(from, to) {
    return from !== to;
  }

  destroy() {
    this._stopTimer();
    super.destroy();
  }
});