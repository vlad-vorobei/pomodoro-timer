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

import GLib from 'gi://GLib';
import Clutter from 'gi://Clutter';

import { TimerState, PauseType, TimerConstants } from '../state/timerStates.js';
import { IconLoader } from "../utils/IconLoader.js";

export class TimerDisplay {
  constructor(iconWidget, labelWidget, extension) {
    this._icon = iconWidget;
    this._label = labelWidget;

    this._blinkTimeoutId = null;
    this._isBlinking = false;
    this._blinkState = true;

    this._iconLoader = new IconLoader(extension);

    this._icons = {
      HOURGLASS: 'hourglass-symbolic',
      COFFEE: 'coffee-symbolic',
      DEFAULT: 'appointment-symbolic'
    };
  }

  updateState(state, pauseType = null) {
    this._stopBlinking();

    switch (state) {
      case TimerState.STOP:
        this._setIcon(this._icons.HOURGLASS);
        this._label.visible = false;
        this._label.text = '';
        break;

      case TimerState.WORK:
        this._setIcon(this._icons.HOURGLASS);
        this._label.visible = true;
        this._startBlinking();
        break;

      case TimerState.PAUSE:
        if (pauseType === PauseType.FROM_WORK) {
          this._setIcon(this._icons.HOURGLASS);
        } else if (pauseType === PauseType.FROM_BREAK) {
          this._setIcon(this._icons.COFFEE);
        }
        break;

      case TimerState.BREAK:
        this._setIcon(this._icons.COFFEE);
        this._startBlinking();
        break;

      case TimerState.WORK_COMPLETE:
        this._setIcon(this._icons.HOURGLASS);
        this._startBlinking(true);
        break;

      case TimerState.WORK_OVERTIME:
        this._setIcon(this._icons.HOURGLASS);
        break;

      case TimerState.BREAK_COMPLETE:
        this._setIcon(this._icons.COFFEE);
        this._startBlinking(true);
        break;

      case TimerState.BREAK_OVERTIME:
        this._setIcon(this._icons.COFFEE);
        break;
    }
  }

  updateTime(seconds, state) {
    let timeText = '';

    if (state === TimerState.STOP) {
      timeText = '';
    } else if (state === TimerState.WORK_OVERTIME ||
      state === TimerState.BREAK_OVERTIME) {
      timeText = '+' + this._formatTime(seconds);
    } else {
      timeText = this._formatTime(seconds);
    }

    this._label.text = timeText;

    if (state === TimerState.WORK_COMPLETE ||
      state === TimerState.BREAK_COMPLETE) {
      this._updateBlinkingText();
    }
  }

  _formatTime(totalSeconds) {
    const minutes = Math.floor(Math.abs(totalSeconds) / 60);
    const seconds = Math.abs(totalSeconds) % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  _setIcon(iconName) {
    try {
      if (this._iconLoader.hasIcon(iconName)) {
        this._iconLoader.setIcon(this._icon, iconName);
      } else {
        let fallbackIcon;
        if (iconName.includes('hourglass')) {
          fallbackIcon = this._icons.FALLBACK_WORK;
        } else if (iconName.includes('coffee')) {
          fallbackIcon = this._icons.FALLBACK_BREAK;
        } else {
          fallbackIcon = this._icons.FALLBACK_DEFAULT;
        }
        this._icon.icon_name = fallbackIcon;
      }
    } catch (error) {
      console.error(`Icon error: ${error}, using default icon`);
      this._icon.icon_name = this._icons.FALLBACK_DEFAULT;
    }
  }

  _startBlinking(fast = false) {
    this._isBlinking = true;
    this._blinkState = true;

    const interval = fast
      ? Math.max(120, Math.floor(TimerConstants.TICK_INTERVAL / 2))
      : Math.floor(TimerConstants.TICK_INTERVAL);

    this._applyOpacity(this._icon, 255, Math.floor(interval * 0.6));
    this._applyOpacity(this._label, 255, Math.floor(interval * 0.6));

    if (this._blinkTimeoutId) {
      GLib.source_remove(this._blinkTimeoutId);
      this._blinkTimeoutId = null;
    }

    this._blinkTimeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, interval, () => {
      if (!this._icon || this._icon.destroyed) return GLib.SOURCE_REMOVE;

      this._blinkState = !this._blinkState;
      const target = this._blinkState ? 255 : 128;
      const dur = Math.max(80, Math.floor(interval * 0.8));

      this._applyOpacity(this._icon, target, dur);
      return GLib.SOURCE_CONTINUE;
    });
  }

  _stopBlinking() {
    if (this._blinkTimeoutId) {
      GLib.source_remove(this._blinkTimeoutId);
      this._blinkTimeoutId = null;
    }
    this._isBlinking = false;

    if (this._icon && !this._icon.destroyed) {
      this._icon.remove_transition && this._icon.remove_transition('opacity');
      this._icon.remove_all_transitions && this._icon.remove_all_transitions();
      this._icon.opacity = 255;
    }
    if (this._label && !this._label.destroyed) {
      this._label.remove_transition && this._label.remove_transition('opacity');
      this._label.remove_all_transitions && this._label.remove_all_transitions();
      this._label.opacity = 255;
    }
  }

  _updateBlinkingText() {
    if (this._isBlinking && this._label && !this._label.destroyed) {
      const target = this._blinkState ? 255 : 128;
      this._applyOpacity(this._label, target, 180);
    }
  }

  _applyOpacity(actor, targetOpacity, durationMs) {
    if (!actor || actor.destroyed) return;

    if (actor.remove_transition) actor.remove_transition('opacity');

    if (actor.ease) {
      actor.ease({
        opacity: targetOpacity,
        duration: durationMs,
        mode: Clutter.AnimationMode.EASE_IN_OUT_SINE,
        property: 'opacity',
      });
    } else {
      actor.opacity = targetOpacity;
    }
  }

  destroy() {
    this._stopBlinking();
  }
}