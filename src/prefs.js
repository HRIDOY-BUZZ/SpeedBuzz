
import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';


export default class SpeedBuzzPreferences extends ExtensionPreferences {
    constructor(metadata) {
        super(metadata);
        log('SpeedBuzzPreferences constructor');
    }

    fillPreferencesWindow(window) {
        const settings = this.getSettings('org.gnome.shell.extensions.speedbuzz');
        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup({
            title: 'General',
        });
        const row = new Adw.ActionRow({
            title: 'Use bits/s',
            subtitle: 'Display speed in bits per second instead of bytes per second.',
        });

        const toggle = new Gtk.Switch({
            active: settings.get_boolean('use-bits'),
            valign: Gtk.Align.CENTER,
        });

        row.add_suffix(toggle);
        row.activatable_widget = toggle;
        group.add(row);

        const colorsRow = new Adw.ActionRow({
            title: 'Show Colors',
            subtitle: 'Display download and upload speeds in different colors.',
        });

        const colorsToggle = new Gtk.Switch({
            active: settings.get_boolean('show-colors'),
            valign: Gtk.Align.CENTER,
        });

        colorsRow.add_suffix(colorsToggle);
        colorsRow.activatable_widget = colorsToggle;
        group.add(colorsRow);

        page.add(group);

        window.add(page);

        toggle.connect('notify::active', (widget) => {
            settings.set_boolean('use-bits', widget.active);
        });

        colorsToggle.connect('notify::active', (widget) => {
            settings.set_boolean('show-colors', widget.active);
        });

        const aboutPage = new Adw.AboutWindow({
            application_name: 'Speed-Buzz: Internet Speed Meter',
            developer_name: 'Al-Amin Islam Hridoy',
            version: '1.2',
            website: 'https://github.com/HRIDOY-BUZZ/SpeedBuzz',
            issue_url: 'https://github.com/HRIDOY-BUZZ/SpeedBuzz/issues',
            license_type: Gtk.License.GPL_3_0,
            transient_for: window,
        });

        const aboutButton = new Gtk.Button({
            label: 'About',
            halign: Gtk.Align.END,
            valign: Gtk.Align.END,
        });

        aboutButton.connect('clicked', () => {
            aboutPage.show();
        });

        const aboutGroup = new Adw.PreferencesGroup();
        aboutGroup.add(aboutButton);
        page.add(aboutGroup);
    }
}
