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

        this.append(myLabel);
    }
});