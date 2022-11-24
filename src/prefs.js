const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;

function init() {

}

function buildPrefsWidget() {
    let widget = new MyPrefsWidget();
    return widget;
}

const MyPrefsWidget = new GObject.Class({
    Name: "My.Prefs.Widget",
    GTypeName: "MyPrefsWidget",
    Extends: Gtk.Box,

    _init: function(params) {
        this.parent(params);
        this.margin = 20;
        this.set_spacing(15);
        this.set_orientation(Gtk.Orientation.VERTICAL);

        let myLabel = new Gtk.Label({
            label: "Change Units: "
        });

        let spinButton = new Gtk.SpinButton();

        spinButton.set_sensitive(true);
        spinButton.set_range(-60, 60);
        spinButton.set_value(0);
        spinButton.set_increments(1, 2);

        spinButton.connect("value-changed", function(w) {
            log(w.get_value_as_init());
        });

        let hswitch = new Gtk.Switch();

        let hBox = new Gtk.Box();
        hBox.set_orientation(Gtk.Orientation.HORIZONTAL);

        hBox.prepend(myLabel, false, false, 0);
        hBox.append(spinButton, false, false, 0);

        this.append(hBox);
    }
});