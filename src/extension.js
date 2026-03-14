/*
 * Name: Speed-Buzz: Internet Speed Meter
 * Description: A simple and minimal internet speed meter extension for Gnome Shell.
 * Author: Al-Amin Islam Hridoy
 * GitHub: https://github.com/HRIDOY-BUZZ/SpeedBuzz
 * License: GPLv3.0
 */

import St from "gi://St";
import Clutter from "gi://Clutter";
import GLib from "gi://GLib";
import Shell from "gi://Shell";
import GObject from "gi://GObject";

import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';

const refreshTime = 1.0; // Set refresh time to one second.
const unitBase = 1024.0; // 1 Gb == 1024Mb or 1Mb == 1024Kb etc.
const bit = 8; // 8 bits make a byte

const SpeedBuzzIndicator = GObject.registerClass(
class SpeedBuzzIndicator extends PanelMenu.Button {
    _init(extension) {
        super._init(0.5, 'Speed-Buzz');
        this._extension = extension;
        this._settings = extension.getSettings('org.gnome.shell.extensions.speedbuzz');

        this._prevUploadBits = 0;
        this._prevDownloadBits = 0;

        const box = new St.BoxLayout();

        this._SBLabel = new St.Label({
            text: ' SB: ',
            style_class: 'sb-label',
            y_align: Clutter.ActorAlign.CENTER
        });

        this._downloadLabel = new St.Label({
            text: '↓ -.-- -- ',
            style_class: 'download-label',
            y_align: Clutter.ActorAlign.CENTER
        });

        this._uploadLabel = new St.Label({
            text: '↑ -.-- -- ',
            style_class: 'upload-label',
            y_align: Clutter.ActorAlign.CENTER
        });

        box.add_child(this._SBLabel);
        box.add_child(this._downloadLabel);
        box.add_child(this._uploadLabel);

        this.add_child(box);
        
        this.connect('button-press-event', () => {
            this._extension.openPreferences();
        });

        this._settings.connect('changed::show-colors', this._updateLabelStyle.bind(this));
        this._updateLabelStyle();

        this._refreshLoop = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, refreshTime, this._updateNetSpeed.bind(this));
    }

    _updateNetSpeed() {
        if (!this._downloadLabel || !this._uploadLabel) return false;

        try {
            const lines = Shell.get_file_contents_utf8_sync('/proc/net/dev').split('\n');
            let uploadBits = 0;
            let downloadBits = 0;
            for (let i = 0; i < lines.length; ++i) {
                const line = lines[i].trim();
                const column = line.split(/\W+/);

                if (column.length <= 2) continue;

                if (column[0] != 'lo' && !isNaN(parseInt(column[1])) && !column[0].match(/^br[0-9]+/) && !column[0].match(/^tun[0-9]+/) && !column[0].match(/^tap[0-9]+/) && !column[0].match(/^vnet[0-9]+/) && !column[0].match(/^virbr[0-9]+/)) {
                    uploadBits += (parseInt(column[9]) * bit);
                    downloadBits += (parseInt(column[1]) * bit);
                }
            }

            const uploadSpeed = (uploadBits - this._prevUploadBits) / (refreshTime * unitBase);
            const downloadSpeed = (downloadBits - this._prevDownloadBits) / (refreshTime * unitBase);

            const useBytes = this._settings.get_boolean('use-bytes');
            this._downloadLabel.set_text(`↓ ${this._getFormattedSpeed(downloadSpeed, useBytes)} `);
            this._uploadLabel.set_text(`↑ ${this._getFormattedSpeed(uploadSpeed, useBytes)} `);

            this._prevUploadBits = uploadBits;
            this._prevDownloadBits = downloadBits;
            return true;
        } catch (e) {
            this._downloadLabel.set_text('↓ -.-- -- ');
            this._uploadLabel.set_text('↑ -.-- -- ');
        }
        return false;
    }

    _getFormattedSpeed(speed, useBytes) {
        if (useBytes) {
            speed /= bit;
        }

        let i = 0;
        const units = useBytes ? ["KB/s", "MB/s", "GB/s", "TB/s"] : ["Kbps", "Mbps", "Gbps", "Tbps"];

        while (speed >= unitBase) {
            speed /= unitBase;
            i++;
        }
        return `${speed.toFixed(2)} ${units[i]}`;
    }

    _updateLabelStyle() {
        const showColors = this._settings.get_boolean('show-colors');
        if (showColors) {
            this.add_style_class_name('colored');
        } else {
            this.remove_style_class_name('colored');
        }
    }

    destroy() {
        if (this._refreshLoop) {
            GLib.source_remove(this._refreshLoop);
            this._refreshLoop = null;
        }
        super.destroy();
    }
});

export default class SpeedBuzzExtension extends Extension {
    enable() {
        this._settings = this.getSettings('org.gnome.shell.extensions.speedbuzz');
        this._indicator = null;

        this._changedId = this._settings.connect('changed::position', () => {
            this._updatePosition();
        });

        this._updatePosition();
    }

    _updatePosition() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }

        this._indicator = new SpeedBuzzIndicator(this);
        const position = this._settings.get_string('position');
        Main.panel.addToStatusArea(this.uuid, this._indicator, 0, position);
    }

    disable() {
        if (this._changedId) {
            this._settings.disconnect(this._changedId);
            this._changedId = null;
        }

        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
        this._settings = null;
    }
}
