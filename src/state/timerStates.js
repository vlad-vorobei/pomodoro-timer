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

export const TimerState = {
  STOP: 'STOP',
  WORK: 'WORK',
  PAUSE: 'PAUSE',
  BREAK: 'BREAK',
  WORK_COMPLETE: 'WORK_COMPLETE',
  WORK_OVERTIME: 'WORK_OVERTIME',
  BREAK_COMPLETE: 'BREAK_COMPLETE',
  BREAK_OVERTIME: 'BREAK_OVERTIME'
};

export const TimerConstants = {
  DEFAULT_WORK_TIME: 25 * 60,      // 25 minutes
  DEFAULT_BREAK_TIME: 5 * 60,      // 5 minutes
  COMPLETE_DURATION: 60,            // 1 min for COMPLETE states
  TICK_INTERVAL: 1000              // 1 second
};

export const PauseType = {
  FROM_WORK: 'FROM_WORK',
  FROM_BREAK: 'FROM_BREAK'
};