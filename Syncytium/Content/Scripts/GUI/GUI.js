/// <reference path="../_references.js" />

/*
    Copyright (C) 2020 LESERT Aymeric - aymeric.lesert@concilium-lesert.fr

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/

var GUI = {};

/**
 * Basement of a component GUI (abstract class)
 *  - typeGUI   : type of components
 *  - box       : string describing the html container, an html object or a box
 *  - name      : identify the component
 *  - cssClass  : css class of the component
 */
GUI.GUI = class extends LoggerBaseObject {
    /**
     * Retrieve the name of the component
     */
    get Name () {
        return this._name;
    }

    /**
     * Retrieve the CSS class of the element
     */
    get CSSClass () {
        return this._cssClass;
    }

    /**
     * @returns {any} reference on the box container of the component
     */
    get Box() {
        return this._box;
    }

    /**
     * @returns {any} reference on the HTML source code
     */
    get Component() {
        return this._component;
    }

    /**
     * @returns {boolean} Get the visibility flag of the component
     */
    get Visible () {
        if ( !this._visible )
            return false;

        if ( this._box instanceof GUI.Box.Box )
            return this._box.Visible;

        return true;
    }

    /**
     * Set the visibility flag of the component
     * @param {boolean} value set the visibility of the GUI component
     */
    set Visible( value ) {
        this._visible = value === true || value === null || value === undefined;

        if ( this.Visible )
            this.debug( "Visible = true" );
        else
            this.debug( "Visible = false" );

        if ( this._component === null )
            return;

        if ( this.Visible )
            this._component.show();
        else
            this._component.hide();
    }

    /**
     * @returns {boolean} Get the read only flag of the component
     */
    get Readonly () {
        if ( this._readonly )
            return true;

        if ( this._box instanceof GUI.Box.Box )
            return this._box.Readonly;

        return false;
    }

    /**
     * Set the read only flag of the component
     * @param {boolean} value set the read only flag of the GUI component
     */
    set Readonly( value ) {
        this._readonly = value === true || value === null || value === undefined;

        if ( this.Readonly )
            this.debug( "Readonly = true" );
        else
            this.debug( "Readonly = false" );

        if ( this._component === null )
            return;

        if ( this.Readonly )
            this._component.addClass( 'readonly' );
        else
            this._component.removeClass( 'readonly' );
    }

    /**
     * Indicates if the component is opened
     * @returns {boolean} true if the component is opened
     */
    get IsOpened() {
        return this._isOpened;
    }

    /**
     * @param {any} tabIndex set the tab index to the component (to handle the tab-navigation)
     */
    set TabIndex( tabIndex ) {
        this._tabIndex = tabIndex;

        if ( this.Component !== null )
            this.Component.attr( 'tabindex', this._tabIndex );
    }

    /**
     * @returns {number} the tab index of the component
     */
    get TabIndex() {
        return this._tabIndex;
    }
    
    /**
     * Destructor
     */
    destructor () {
        this.clearListeners();
        this._events = {};
    }

    /**
     * Add an event on the component
     * @param {any} event name of the event
     * @param {any} fn    function to raise on this event
     */
    on ( event, fn ) {
        this.debug( "Declare event(" + event + ")" );
        this._events[event] = fn;
    }

    /**
     * Raise an event if the component is already visible
     * @param {any} event name of the event to raise
     * @param {...any} parameters list of parameters to go through to the event
     */
    raise( event, ...parameters ) {
        if ( !this.IsOpened )
            return;

        if ( !this._events[event] )
            return;

        this._events[event](...parameters);
    }

    /**
     * Notify if an event exists for a given event
     * @param {any} event name of the event to check
     * @returns {boolean} true if the event exists
     */
    isEvent ( event ) {
        return this._events[event] ? true : false;
    }

    /**
     * @param {any} event name of the event to retrieve
     * @returns {any} the function corresponding to the name of the event
     */
    getEvent ( event ) {
        return this._events[event] ? this._events[event] : null;
    }

    /**
     * Remove an event
     * @param {any} event name of the event
     */
    off ( event ) {
        this.debug( "Remove event(" + event + ")" );
        this._events[event] = null;
    }

    /**
     * Clean up all references on the listener into the database to remove it on close
     */
    clearListeners () {
        for ( let listener of this._listeners )
            DSDatabase.Instance.removeEventListener( listener );
        this._listeners = [];
    }

    /**
     * Add the reference on the listener into the database to remove it on close
     * @param {int} listener identity of the listener from the database
     */
    addListener ( listener ) {
        this._listeners.push( listener );
    }

    /**
     * Virtual method to refresh the component
     */
    refresh () {
        this.verbose( "Refresh" );

        if ( this._component === null )
            return;

        if ( this.Visible )
            this._component.show();
        else
            this._component.hide();

        if ( this.Readonly )
            this._component.addClass( 'readonly' );
        else
            this._component.removeClass( 'readonly' );
    }

    /**
     * Virtual method called on onOpen of the box containing the component
     */
    onOpen () {
        this.verbose( "onOpen" );
        this._isOpened = true;
    }

    /**
     * Virtual method called on onClose of the box containing the component
     */
    onClose () {
        this.clearListeners();
        this._isOpened = false;
        this.verbose( "onClose" );
    }

    /**
     * Abstract method drawing the content of the component
     * @param {any} content HTML code describing the content of the component
     */
    draw( content ) {
        if ( content === null || content === undefined ) {
            this._component = this._container;
            return;
        }

        this._component = $( content );

        this._container.append( this._component[0] );

        if ( !String.isEmptyOrWhiteSpaces( this._type ) )
            this._component.addClass( this._type );

        if ( !String.isEmptyOrWhiteSpaces( this._cssClass ) )
            this._component.addClass( this._cssClass );

        this._component.find( "*" ).attr( "tabindex", null );

        if ( this._tabIndex !== null )
            this._component.attr( "tabindex", this._tabIndex );
    }

    /**
     * Set the focus on this GUI object (override it if necessary)
     * @returns {boolean} true if the focus is set on the component
     */
    focus() {
        this.verbose( "focus" );

        if ( this.Component === null || this._tabIndex === null || !this.Visible || this.Readonly )
            return false;

        this.Component.focus();

        return true;
    }

    /**
     * Go to the next focus
     */
    nextFocus() {
        if ( !( this.Box instanceof GUI.Box.Box ) )
            return;

        this.Box.nextFocus();
    }

    /**
     * Go to the previous focus
     */
    previousFocus() {
        if ( !( this.Box instanceof GUI.Box.Box ) )
            return;

        this.Box.previousFocus();
    }

    /**
     * (Abstract method) Raise the click event
     */
    onMouseClick() { }

    /**
     * Raise the button OK on the box
     */
    onButtonOK() {
        this.verbose( "onButtonOK" );

        if ( !( this.Box instanceof GUI.Box.Box ) )
            return;

        let button = this.Box.getButton( GUI.Box.Box.BUTTON_OK );

        if ( button === null || !button.Visible )
            button = this.Box.getButton( GUI.Box.Box.BUTTON_CLOSE );

        if ( button === null || !button.Visible )
            return;

        button.onMouseClick();
    }

    /**
     * Raise the button CLOSE on the box
     */
    onButtonClose() {
        this.verbose( "onButtonClose" );

        if ( !( this.Box instanceof GUI.Box.Box ) )
            return;

        let button = this.Box.getButton( GUI.Box.Box.BUTTON_CLOSE );
        if ( button === null || !button.Visible )
            return;

        button.onMouseClick();
    }

    /**
     * Raise the button CANCEL on the box
     */
    onButtonCancel() {
        this.verbose( "onButtonCancel" );

        if ( !( this.Box instanceof GUI.Box.Box ) )
            return;

        let button = this.Box.getButton( GUI.Box.Box.BUTTON_CANCEL );

        if ( button === null || !button.Visible )
            button = this.Box.getButton( GUI.Box.Box.BUTTON_CLOSE );

        if ( button === null || !button.Visible )
            return;

        button.onMouseClick();
    }

    /**
     * Constructor
     * @param {any} type     type of the component
     * @param {any} box      reference on the box containing the component (inheritance of the readonly and visible flag)
     * @param {any} name     name of the component
     * @param {any} cssClass class name to add to the component
     */
    constructor( type, box, name, cssClass ) {
        if ( type === "area" ) {
            super( name );
        } else if ( typeof box === "string" ) {
            let boxesName = box.trim().split( ">" );
            let boxName = boxesName[boxesName.length - 1];
            boxesName = boxName.trim().split( " " );
            boxName = boxesName[boxesName.length - 1];
            super( type + "[" + boxName + "." + name + "]" );
        }
        else if ( box instanceof GUI.Box.Box )
            super( type + "[" + box.Name + "." + name + "]" );
        else
            super( type + "[" + name + "]" );

        this._name = name;
        this._cssClass = cssClass ? cssClass : null;
        this._box = null;
        this._type = type;

        if ( typeof box === "string" ) {
            this._container = $( box );
        }
        else if ( box instanceof GUI.Box.Box ) {
            this._container = box.CurrentPanel;
            this._box = box;
        }
        else
            this._container = box ? box : null;

        this._component = null; // jQuery object describing the root of the component

        this._visible = true;
        this._readonly = false;
        this._isOpened = false;
        this._tabIndex = null;

        this._events = {};
        this._listeners = []; // List of listeners DB (to declare onOpen and to free onClose)

        this._throttle = null;

        this.debug( "Create the GUI component '" + name + "' (" + this._type + ")" );
    }
};
