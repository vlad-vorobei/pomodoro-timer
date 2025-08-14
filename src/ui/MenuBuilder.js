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

import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import { CommandFactory } from '../commands/TimerCommands.js';
import { TimerState } from '../state/timerStates.js';

export class MenuBuilder {
  constructor(menu, stateManager) {
    this._menu = menu;
    this._stateManager = stateManager;
    this._menuItems = new Map();
    this._commands = new Map();
  }

  build() {
    // Menu config: [key, name, command type]
    const menuConfig = [
      ['startWork', 'Start Work', 'START_WORK'],
      ['forceWork', 'Force Work', 'FORCE_WORK',],
      ['startBreak', 'Start Break', 'START_BREAK',],
      ['forceBreak', 'Force Break', 'FORCE_BREAK',],
      ['pause', 'Pause', 'PAUSE',],
      ['resume', 'Resume', 'RESUME',],
      ['stop', 'Stop', 'STOP',],
      ['separator1', null, null, null],
    ];

    menuConfig.forEach(([key, label, commandType]) => {
      if (key.startsWith('separator')) {
        this._menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
      } else {
        const menuItem = new PopupMenu.PopupMenuItem(label);

        const command = CommandFactory.create(commandType, this._stateManager);
        this._commands.set(key, command);

        menuItem.connect('activate', () => {
          if (command.canExecute()) {
            command.execute();
          }
        });

        this._menuItems.set(key, menuItem);
        this._menu.addMenuItem(menuItem);
      }
    });

    this._menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

    const statsItem = new PopupMenu.PopupMenuItem('Statistics');
    statsItem.setSensitive(false);
    this._menu.addMenuItem(statsItem);

    const settingsItem = new PopupMenu.PopupMenuItem('Settings');
    settingsItem.setSensitive(false);
    this._menu.addMenuItem(settingsItem);

    this.updateMenuItems(this._stateManager.getCurrentState());
  }

  updateMenuItems(currentState) {
    const visibilityRules = {
      [TimerState.STOP]: {
        visible: ['startWork', 'stop'],
        hidden: ['startBreak', 'pause', 'resume', 'forceBreak', 'forceWork']
      },
      [TimerState.WORK]: {
        visible: ['pause', 'stop', 'forceBreak'],
        hidden: ['startWork', 'startBreak', 'resume', 'forceWork']
      },
      [TimerState.PAUSE]: {
        visible: ['resume', 'stop'],
        hidden: ['startWork', 'startBreak', 'pause', 'forceBreak', 'forceWork']
      },
      [TimerState.BREAK]: {
        visible: ['pause', 'stop', 'forceWork'],
        hidden: ['startWork', 'startBreak', 'resume', 'forceBreak']
      },
      [TimerState.WORK_COMPLETE]: {
        visible: ['startBreak', 'stop', 'forceWork'],
        hidden: ['startWork', 'pause', 'resume', 'forceBreak']
      },
      [TimerState.WORK_OVERTIME]: {
        visible: ['startBreak', 'stop', 'forceWork'],
        hidden: ['startWork', 'pause', 'resume', 'forceBreak']
      },
      [TimerState.BREAK_COMPLETE]: {
        visible: ['startWork', 'stop', 'forceBreak'],
        hidden: ['startBreak', 'pause', 'resume', 'forceWork']
      },
      [TimerState.BREAK_OVERTIME]: {
        visible: ['startWork', 'stop', 'forceBreak'],
        hidden: ['startBreak', 'pause', 'resume', 'forceWork']
      }
    };

    const rules = visibilityRules[currentState];
    if (!rules) {
      console.log(`No visibility rules for state: ${currentState}`);
      return;
    }

    rules.visible.forEach(key => {
      const menuItem = this._menuItems.get(key);
      if (menuItem) {
        menuItem.visible = true;

        const command = this._commands.get(key);
        if (command) {
          menuItem.setSensitive(command.canExecute());
        }
      }
    });

    rules.hidden.forEach(key => {
      const menuItem = this._menuItems.get(key);
      if (menuItem) {
        menuItem.visible = false;
      }
    });
  }

  destroy() {
    this._menuItems.clear();
    this._commands.clear();
  }
}