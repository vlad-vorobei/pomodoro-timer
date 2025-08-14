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

import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export class IconLoader {
  constructor(extension) {
    this._iconsPath = GLib.build_filenamev([extension.path, 'icons']);
    this._iconCache = new Map();
  }

  loadIcon(iconName) {
    const cleanIconName = iconName.replace('.svg', '');

    if (this._iconCache.has(cleanIconName)) {
      return this._iconCache.get(cleanIconName);
    }

    try {
      const iconPath = GLib.build_filenamev([this._iconsPath, `${cleanIconName}.svg`]);
      const iconFile = Gio.File.new_for_path(iconPath);

      if (iconFile.query_exists(null)) {
        console.log(`IconLoader: Found icon at ${iconPath}`);
        const icon = Gio.FileIcon.new(iconFile);
        this._iconCache.set(cleanIconName, icon);
        return icon;
      } else {
        console.log(`IconLoader: Icon file not found: ${iconPath}`);
        return null;
      }
    } catch (error) {
      console.error(error, `Failed to load icon: ${cleanIconName}`);
      return null;
    }
  }

  setIcon(iconWidget, iconName, fallbackIconName = 'dialog-information-symbolic') {
    const customIcon = this.loadIcon(iconName);

    if (customIcon) {
      iconWidget.gicon = customIcon;
    } else {
      iconWidget.icon_name = fallbackIconName;
    }
  }

  hasIcon(iconName) {
    const cleanIconName = iconName.replace('.svg', '');

    const iconPath = GLib.build_filenamev([this._iconsPath, `${cleanIconName}.svg`]);
    const iconFile = Gio.File.new_for_path(iconPath);

    return iconFile.query_exists(null);
  }

  destroy() {
    this._iconCache.clear();
  }
}