/*
 * Name: Speed-Buzz: Internet Speed Meter
 * Description: A simple and minimal internet speed meter extension for Gnome Shell.
 * Author: Al-Amin Islam Hridoy
 * GitHub: https://github.com/HRIDOY-BUZZ/SpeedBuzz
 * License: GPLv3.0
 */

const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const GLib = imports.gi.GLib;
const Shell = imports.gi.Shell;
const Main = imports.ui.main;

import {
    Extension,
    gettext as _,
  } from "resource:///org/gnome/shell/extensions/extension.js";

const refreshTime = 1.0; // Set refresh time to one second.
const unitBase = 1024.0; // 1 Gb == 1024Mb or 1Mb == 1024Kb etc.
const units = ["Kbps", "Mbps", "Gbps", "Tbps"];
const defaultNetSpeedText = 'SB: ↓ -.-- --  ↑ -.-- --';
const bit = 8; // 8 bits make a byte

let prevUploadBits = 0,
    prevDownloadBits = 0;
let containerButton, netSpeedLabel, refreshLoop;

const updateNetSpeed = () => {
    if (netSpeedLabel) {
        try {
            const lines = Shell.get_file_contents_utf8_sync('/proc/net/dev').split('\n');
            let uploadBits = 0;
            let downloadBits = 0;
            for (let i = 0; i < lines.length; ++i) {
                const line = lines[i].trim();
                const column = line.split(/\W+/);

                if (column.length <= 2) break;

                if (column[0] != 'lo' && !isNaN(parseInt(column[1])) && !column[0].match(/^br[0-9]+/) && !column[0].match(/^tun[0-9]+/) && !column[0].match(/^tap[0-9]+/) && !column[0].match(/^vnet[0-9]+/) && !column[0].match(/^virbr[0-9]+/)) {
                    uploadBits += (parseInt(column[9]) * bit);
                    downloadBits += (parseInt(column[1]) * bit);
                }
            }

            const uploadSpeed = (uploadBits - prevUploadBits) / (refreshTime * unitBase);
            const downloadSpeed = (downloadBits - prevDownloadBits) / (refreshTime * unitBase);

            netSpeedLabel.set_text(`SB: ↓ ${getFormattedSpeed(downloadSpeed)}  ↑ ${getFormattedSpeed(uploadSpeed)}`);

            prevUploadBits = uploadBits;
            prevDownloadBits = downloadBits;
            return true;
        } catch (e) {
            netSpeedLabel.set_text(defaultNetSpeedText);
        }
    }
    return false;
};

const getFormattedSpeed = (speed) => {
    let i = 0;
    while (speed >= unitBase) {
        speed /= unitBase;
        i++;
    }
    return `${speed.toFixed(2)} ${units[i]}`;
};

const enable = () => {
    containerButton = new St.Bin({
        style_class: 'panel-button',
        reactive: true,
        can_focus: false,
        x_expand: true,
        y_expand: false,
        track_hover: false
    });
    netSpeedLabel = new St.Label({
        text: defaultNetSpeedText,
        style_class: 'netSpeedLabel',
        y_align: Clutter.ActorAlign.CENTER
    });
    containerButton.set_child(netSpeedLabel);

    Main.panel._rightBox.insert_child_at_index(containerButton, 0);
    refreshLoop = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, refreshTime, updateNetSpeed);
};

const disable = () => {
    if (refreshLoop) {
        GLib.source_remove(refreshLoop);
        refreshLoop = null;
    }
    if (containerButton) {
        Main.panel._rightBox.remove_child(containerButton);
        containerButton.destroy();
        containerButton = null;
    }
    if (netSpeedLabel) {
        netSpeedLabel.destroy();
        netSpeedLabel = null;
    }
};

export default class SpeedBuzzExtension extends Extension {
    enable() {
        super.enable();
        enable();
    }

    disable() {
        super.disable();
        disable();
    }
}