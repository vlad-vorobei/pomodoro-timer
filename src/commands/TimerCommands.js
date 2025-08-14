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

import { TimerState } from '../state/timerStates.js';

export class Command {
  constructor(stateManager) {
    this._stateManager = stateManager;
  }

  execute() {
    throw new Error('Execute method must be implemented');
  }

  canExecute() {
    return true;
  }
}

export class StartWorkCommand extends Command {
  execute() {
    this._stateManager.transitionTo(TimerState.WORK);
  }

  canExecute() {
    const state = this._stateManager.getCurrentState();
    return state === TimerState.STOP ||
      state === TimerState.BREAK_COMPLETE ||
      state === TimerState.BREAK_OVERTIME;
  }
}

export class StartBreakCommand extends Command {
  execute() {
    this._stateManager.transitionTo(TimerState.BREAK);
  }

  canExecute() {
    const state = this._stateManager.getCurrentState();
    return state === TimerState.WORK_COMPLETE ||
      state === TimerState.WORK_OVERTIME;
  }
}

export class PauseCommand extends Command {
  execute() {
    this._stateManager.transitionTo(TimerState.PAUSE);
  }

  canExecute() {
    const state = this._stateManager.getCurrentState();
    return state === TimerState.WORK ||
      state === TimerState.BREAK;
  }
}

export class ResumeCommand extends Command {
  execute() {
    const pauseType = this._stateManager.getPauseType();

    if (pauseType === 'FROM_WORK') {
      this._stateManager.transitionTo(TimerState.WORK);
    } else if (pauseType === 'FROM_BREAK') {
      this._stateManager.transitionTo(TimerState.BREAK);
    }
  }

  canExecute() {
    return this._stateManager.getCurrentState() === TimerState.PAUSE;
  }
}

export class StopCommand extends Command {
  execute() {
    this._stateManager.transitionTo(TimerState.STOP);
  }

  canExecute() {
    return this._stateManager.getCurrentState() !== TimerState.STOP;
  }
}

export class ForceBreakCommand extends Command {
  execute() {
    this._stateManager.transitionTo(TimerState.BREAK);
  }

  canExecute() {
    const state = this._stateManager.getCurrentState();
    return state !== TimerState.BREAK &&
      state !== TimerState.STOP;
  }
}

export class ForceWorkCommand extends Command {
  execute() {
    this._stateManager.transitionTo(TimerState.WORK);
  }

  canExecute() {
    const state = this._stateManager.getCurrentState();
    return state !== TimerState.WORK &&
      state !== TimerState.STOP;
  }
}

export class CommandFactory {
  static create(commandType, stateManager) {
    const commands = {
      'START_WORK': StartWorkCommand,
      'START_BREAK': StartBreakCommand,
      'PAUSE': PauseCommand,
      'RESUME': ResumeCommand,
      'STOP': StopCommand,
      'FORCE_BREAK': ForceBreakCommand,
      'FORCE_WORK': ForceWorkCommand
    };

    const CommandClass = commands[commandType];
    if (!CommandClass) {
      throw new Error(`Unknown command type: ${commandType}`);
    }

    return new CommandClass(stateManager);
  }
}