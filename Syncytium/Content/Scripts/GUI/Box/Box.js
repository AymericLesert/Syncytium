/// <reference path="../../_references.js" />

/*
    Copyright (C) 2017 LESERT Aymeric - aymeric.lesert@concilium-lesert.fr

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

GUI.Box = {};

/**
 * Flag notifying if the RC is pressed by the end user into an input or textarea zone
 */
GUI.Box.BOX_RC = false;

/**
 * Basement of a dialog box
 *  - name      : identify the box (the name must be unique)
 *  - cssClass  : class affected to this box
 */
GUI.Box.Box = class extends GUI.GUI {
    /**
     * @returns {string} "dialog"
     */
    static get MAIN_PAGE() {
        return "body > dialog";
    }

    /**
     * @returns {string} "OK"
     */
    static get BUTTON_OK() {
        return "OK";
    }

    /**
     * @returns {string} "CANCEL"
     */
    static get BUTTON_CANCEL() {
        return "CANCEL";
    }

    /**
     * @returns {string} "CLOSE"
     */
    static get BUTTON_CLOSE() {
        return "CLOSE";
    }

    /**
     * @returns {int} a new identity of the stack of box
     */
    static get StackIndex() {
        if ( !this._stackBoxIndex )
            this._stackBoxIndex = 1;
        else
            this._stackBoxIndex++;

        return this._stackBoxIndex;
    }

    /**
     * @returns {any} stack of boxes
     */
    static get Stack() {
        if ( !this._stackBox )
            this._stackBox = {};

        return this._stackBox;
    }

    /**
     * @returns {any} the dialog box currently opened
     */
    static GetLastOpenedBox() {
        let lastOpenBox = null;

        let zIndex = 0;

        for ( var i in GUI.Box.Box.Stack ) {
            if ( GUI.Box.Box.Stack[i] === null )
                continue;

            if ( zIndex < GUI.Box.Box.Stack[i]._zIndex ) {
                zIndex = GUI.Box.Box.Stack[i]._zIndex;
                lastOpenBox = GUI.Box.Box.Stack[i];
            }
        }

        return lastOpenBox;
    }

    /**
     * @returns {any} The content zone of the box
     */
    get ContentZone () {
        if ( this.Component === null )
            return null;

        return this.Component.find( "> div > .content" );
    }

    /**
     * @returns {any} The button zone of the box
     */
    get ButtonZone () {
        if ( this.Component === null )
            return null;

        return this.Component.find( "> div > .buttons" );
    }

    /**
     * Indicates if the component is opened
     * @returns {boolean} true if the component is opened
     */
    get IsOpened() {
        return super.IsOpened && this._boxOpened && this.Component !== null && this._zIndex > 0;
    }

    /**
     * Set the title of the dialog box or string
     * @param {any} value title of the box (see Helper.Label)
     */
    set Title( value ) {
        this._title = Helper.Label( value );
        this.debug( "Set title " + String.JSONStringify( this._title ) );

        if ( this.Component === null )
            return;

        var titleZone = this.Component.find( "> div > .title" );
        var title = Helper.Span( this._title );

        if ( String.isEmptyOrWhiteSpaces( title ) ) {
            titleZone.hide();
        } else {
            titleZone.html( title );
            titleZone.show();
        }
    }

    /**
     * @returns {any} title of the dialog box
     */
    get Title() {
        return this._title;
    }

    /**
     * Set the message of the dialog box or string
     * @param {any} value message to show in the dialog box (see Helper.Label)
     */
    set Message ( value ) {
        this._message = Helper.Label( value );
        this.debug( "Set message " + String.JSONStringify( this._message ) );

        if ( this.Component === null )
            return;

        var messageZone = this.Component.find( "> div > .message" );
        var message = Helper.Span( this._message );

        if ( String.isEmptyOrWhiteSpaces( message ) ) {
            messageZone.hide();
        } else {
            messageZone.html( message );
            messageZone.show();
        }
    }

    /**
     * Set the error of the dialog box or string
     * @param {Errors} value error to show in the dialog box
     */
    set Error( value ) {
        if ( value === null || value === undefined )
            this._error = null;
        else if ( typeof value === "string" )
            this._error = new Errors( value );
        else if ( Helper.IsLabel(value) )
            this._error = new Errors( value.label, value.parameters );
        else
            this._error = value;
        this.debug( "Set error " + String.JSONStringify( this._error ) );

        if ( this.Component === null )
            return;

        // Set error for each field

        if ( this._error !== null ) {
            this.error( this._error.toString() );
            
            let focus = false;

            for ( let field in this._fields ) {
                let currentField = this._fields[field];
                if ( !currentField.Visible )
                    continue;

                let errorMessage = this._error.getField( field );
                currentField.Error = errorMessage;
                this._error.ignoreField( field );

                if ( errorMessage !== null )
                    this._error.ignoreField( "Copy" + field );

                if ( !focus && errorMessage !== null ) {
                    if ( currentField.Panel !== null )
                        this.gotoCurrentPanel( this.getNavigationIndex(currentField.Panel) );

                    currentField.focus();
                    focus = true;
                }
            }
        } else {
            for ( let field in this._fields )
                this._fields[field].Error = null;
        }

        var errorZone = this.Component.find( "> div > .error" );
        if ( this._error === null || !this._error.summary || String.isEmptyOrWhiteSpaces( this._error.summary() ) ) {
            if ( this.ContentZone.hasClass( "haserrors" ) === true )
                this.ContentZone.removeClass( "haserrors" );

            errorZone.hide();
        } else {
            if ( this.ContentZone.hasClass( "haserrors" ) !== true )
                this.ContentZone.addClass( "haserrors" );

            errorZone.html( this._error.summary() );
            errorZone.show();
        }
    }

    /**
     * @param {string} mode "Create", "Read", "Update" or "Delete"
     */
    set Mode( mode ) {
        this._mode = mode;
    }

    /**
     * @returns {string} "Create", "Read", "Update" or "Delete"
     */
    get Mode() {
        return this._mode;
    }

    /**
     * @returns {any} the last panel declared
     */
    get CurrentPanel () {
        if ( this.Component === null )
            return null;

        return this._currentPanel ? this._currentPanel : this.ContentZone;
    }

    /**
     * @returns {any} list of fields included into this box
     */
    get Fields() {
        return this._fields;
    }

    /**
     * @returns {any} list of boards included into this box
     */
    get Boards() {
        return this._boards;
    }

    /**
     * @returns {any} list of buttons included into this box
     */
    get Buttons() {
        return this._buttons;
    }

    /**
     * Abstract method
     * @returns {any} value expected into the dialog box
     */
    get Value() {
        return null;
    }

    /**
     * @param {any} onClosed function to call on closing the box
     */
    set OnClosed( onClosed ) {
        this._onClosed = onClosed;
    }

    /**
     * Destructor
     */
    destructor () {
        super.destructor();

        for ( var field in this._fields )
            this._fields[field].destructor();

        this._fields = {};

        for ( var board in this._boards )
            this._boards[board].destructor();

        this._boards = {};

        for ( var button in this._buttons )
            this._buttons[button].destructor();

        this._buttons = {};
        this._focus = [];
    }

    /**
     * Declare a field into the box
     * @param {GUI.Field.Field} field new field to add
     * @returns {GUI.Field.Field} field added into the box
     */
    declareField ( field ) {
        if ( field === undefined || field === null )
            return;

        this.debug( "Declare the field '" + field.Name + "'" );

        this._fields[field.Name] = this.addFocus(field);
        field.Panel = this._currentPanelName;

        return field;
    }

    /**
     * Retrieve a field into the box by its name
     * @param {any} name field name
     * @returns {GUI.Field.Field} field got in the box
     */
    getField ( name ) {
        if ( name === undefined || name === null )
            return null;

        var field = this._fields[name];

        return field === null || field === undefined ? null : field;
    }

    /**
     * Declare a board into the box
     * @param {GUI.Board.Board} board new board to add
     * @returns {GUI.Board.Board} board added into the box
     */
    declareBoard( board ) {
        if ( board === undefined || board === null )
            return;

        this.debug( "Declare the board '" + board.Name + "'" );

        this._boards[board.Name] = this.addFocus( board );
        board.Panel = this._currentPanelName;

        return board;
    }

    /**
     * Retrieve a board into the box by its name
     * @param {any} name board name
     * @returns {GUI.Board.Board} board got in the box
     */
    getBoard( name ) {
        if ( name === undefined || name === null )
            return null;

        var board = this._boards[name];

        return board === null || board === undefined ? null : board;
    }

    /**
     * Clean up all buttons of the box
     */
    clearButtons () {
        this.debug( "Cleanning up all buttons ..." );
        this._buttons = {};
    }

    /**
     * Declare a button into the box
     * @param {any} name   button name
     * @param {any} label  multilingual label of the button
     * @param {any} action function to call if the end-user clicks on the button
     * @returns {BUI.Button.Button} new button
     */
    declareButton ( name, label, action ) {
        this.debug( "Declare the button '" + name + "', '" + String.JSONStringify( label ) + "'" );
        var newButton = this.addFocus(new GUI.Button.Button( this, name, null, label, action ));
        this._buttons[newButton.Name] = newButton;
        return newButton;
    }

    /**
     * Retrieve a button into the box by its name
     * @param {any} name button name
     * @returns {BUI.Button.Button} button found or not
     */
    getButton ( name ) {
        if ( name === undefined || name === null )
            return null;

        var button = this._buttons[name];

        return button === null || button === undefined ? null : button;
    }

    /**
     * Abstract method to define the list of buttons of the dialog box
     * @param {any} container zone having the list of buttons
     */
    drawButton( container ) {
        container.show();
    }

    /**
     * Abstract method to draw the content of the dialog box
     * @param {any} container zone having the content
     */
    drawContent ( container ) {
        container.hide();
    }

    /**
     * Draw the dialog box into the container
     */
    draw () {
        if ( this.Component !== null )
            return;

        var content = "<box id='" + this.Name.toString().toLowerCase() + "' class='" + this.Name.toString().toLowerCase() + "' style='display:none;'>";
        content += "<div>";
        content += "<div class='title'></div>";
        content += "<div class='message'></div>";
        content += "<div class='error'></div>";
        content += "<div class='content'></div>";
        content += "<div class='buttons'></div>";
        content += "</div>";
        content += "</box>";

        super.draw( content );
        this.drawContent( this.ContentZone );
        this.drawButton( this.ButtonZone );
        this.Component.remove();
        Language.Manager.Instance.addComponent( this.Component );

        // handle the window resizing

        function handleResize( box ) {
            return function () {
                if ( !box.IsOpened )
                    return;

                // Add a throttling on resizing

                clearTimeout( box._throttle );
                box._throttle = setTimeout( function () {
                    if ( !box.IsOpened )
                        return;

                    box.debug( "Resizing window ..." );
                    box.resize();
                }, 100 );
            };
        }

        $( window ).on( 'resize', handleResize( this ) );
    }

    /**
     * (Virtual Method) Check if the value is expected or not
     * @param {any} value value to check
     * @returns {any} true if the value is ok or an error message
     */
    checkValue( value ) {
        return true;
    }

    /**
     * True if the field is visible
     * @param {any} attribute column / property
     * @param {any} user     current user
     * @param {any} item     item handled by the current dialog box
     * @returns {boolean} true if the field is allowed to be shown
     */
    isFieldVisible( attribute, user, item ) {
        if ( item === null || !item._list )
            return true;

        return attribute !== item._list.column;
    }

    /**
     * False if the field can be updated
     * @param {any} attribute column / property
     * @param {any} user     current user
     * @param {any} item     item handled by the current dialog box
     * @returns {boolean} true if the field can't be updated by the current user
     */
    isFieldReadonly( attribute, user, item ) {
        return false;
    }

    /**
     * True if the board is visible
     * @param {any} board board name
     * @param {any} user  current user
     * @param {any} item     item handled by the current dialog box
     * @returns {boolean} true if the board is allowed to be shown
     */
    isBoardVisible( board, user, item ) {
        return true;
    }

    /**
     * False if the board can be updated
     * @param {any} board board name
     * @param {any} user  current user
     * @param {any} item     item handled by the current dialog box
     * @returns {boolean} true if the board can't be updated by the current user
     */
    isBoardReadonly( board, user, item ) {
        return false;
    }

    /**
     * True if the panel is visible
     * @param {any} panel panel name
     * @param {any} user  current user
     * @param {any} item     item handled by the current dialog box
     * @returns {boolean} true if the panel is allowed to be shown
     */
    isPanelVisible( panel, user, item ) {
        return true;
    }

    /**
     * False if the panel can be updated
     * @param {any} panel panel name
     * @param {any} user  current user
     * @param {any} item  item handled by the current dialog box
     * @returns {boolean} true if the panel can't be updated by the current user
     */
    isPanelReadonly( panel, user, item ) {
        return false;
    }

    /**
     * Raise the button OK on the box
     */
    onButtonOK() {
        this.verbose( "onButtonOK" );

        let button = this.getButton( GUI.Box.Box.BUTTON_OK );
        if ( button === null )
            return;

        button.onMouseClick();
    }

    /**
     * Raise the button CANCEL on the box
     */
    onButtonCancel() {
        this.verbose( "onButtonCancel" );

        let button = this.getButton( GUI.Box.Box.BUTTON_CANCEL );
        if ( button === null )
            return;

        button.onMouseClick();
    }

    /**
     * Virtual method to refresh the content of the box
     */
    refresh () {
        super.refresh();

        if ( this.Component !== null ) {
            this.Title = this._title;
            this.Message = this._message;
            this.Error = this._error;
        }

        if ( this._panels === null || this._navigationPanels === null ) {
            this.refreshPanel();
        } else {
            this.gotoCurrentPanel();
        }

        for ( var button in this._buttons )
            this._buttons[button].refresh();
    }

    /**
     * Virtual method to resize the content of the box
     */
    resize() {

    }

    /**
     * Virtual method called on openning the box
     */
    onOpen () {
        function handleFocus( box, item ) {
            return function () {
                box.setFocus( item );
            };
        }

        function handleKeydown( box ) {
            return function ( event ) {
                let keyCode = event.which || event.keyCode;

                switch ( keyCode ) {
                    case 9:
                        event.preventDefault();
                        if ( event.shiftKey )
                            box.previousFocus();
                        else
                            box.nextFocus();
                        return false;

                    case 13:
                        if ( GUI.Box.BOX_RC ) {
                            GUI.Box.BOX_RC = false;
                            return;
                        }

                        event.preventDefault();
                        box.onButtonOK();
                        return false;

                    case 27:
                        event.preventDefault();
                        box.onButtonCancel();
                        return false;
                }
            };
        }

        super.onOpen();

        if ( this._panels !== null )
            for ( var panel in this._panels ) {
                this._panels[panel].on( 'focus', handleFocus( this, this._panels[panel] ) );
                this._panels[panel].on( 'keydown', handleKeydown( this, this._panels[panel] ) );
            }

        for ( var box in this._fields )
            this._fields[box].onOpen();

        for ( var board in this._boards )
            this._boards[board].onOpen();

        for ( var button in this._buttons )
            this._buttons[button].onOpen();

        this._boxOpened = true;
    }

    /**
     * Open the dialog box
     */
    open () {
        if ( this.IsOpened )
            return;

        this.debug( "Open the box" );

        // Look for in the stack the last box opened

        this._zIndex = 1;
        for ( var i in GUI.Box.Box.Stack ) {
            if ( GUI.Box.Box.Stack[i] === null )
                continue;

            if ( this._zIndex < GUI.Box.Box.Stack[i]._zIndex )
                this._zIndex = GUI.Box.Box.Stack[i]._zIndex;
        }

        if ( this._zIndex === 1 )
            $( GUI.Box.Box.MAIN_PAGE ).show();

        this._zIndex++;
        GUI.Box.Box.Stack[this._boxIndex] = this;

        this.Component.css( 'z-index', this._zIndex.toString() );
        $( GUI.Box.Box.MAIN_PAGE ).append( this.Component );

        // notify to all fields that the box is now visible

        this._navigationPanelHidden = [];
        this._navigationPanelIndex = 0;

        this.onOpen();

        // refresh all fields

        this.refresh();

        // open the box

        this.Component.show();
    }

    /**
     * Virtual method called on closing the box
     */
    onClose() {
        this.onChangeFocus( null );

        if ( this._panels !== null )
            for ( var panel in this._panels )
                this._panels[panel].off( 'focus keydown' );

        super.onClose();
    }

    /**
     * Close the dialog box
     */
    close () {
        if ( !this.IsOpened )
            return;

        this.debug( "Close the box" );

        this.Component.css( 'z-index', '' );
        this.Component.hide();
        delete GUI.Box.Box.Stack[this._boxIndex];
        this._zIndex = -1;
        this._boxOpened = false;

        // notify to all fields that the box is now visible

        for ( var field in this._fields )
            this._fields[field].onClose();

        for ( var board in this._boards )
            this._boards[board].onClose();

        for ( var button in this._buttons )
            this._buttons[button].onClose();

        this.onClose();
        this.Component.remove();

        // hide the main screen of the dialog box

        if ( this._onClosed !== null )
            this._onClosed();

        for ( var i in GUI.Box.Box.Stack ) {
            if ( GUI.Box.Box.Stack[i] === null )
                continue;

            return;
        }

        $( GUI.Box.Box.MAIN_PAGE ).hide();
    }

    /**
     * Declare a new panel into the box
     * @param {any} panel    name of the panel added
     * @param {any} cssClass class to put to the new panel
     * @returns {any} HTML code describing the new panel
     */
    declarePanel ( panel, cssClass ) {
        var newPanel = null;

        if ( this.Component === null || panel === undefined || panel === null )
            return;

        if ( this._panels === null ) {
            // Panel declaration for the first time ... set the panel of the left (to go to the previous one)
            this.ContentZone.addClass( "panels" );

            this._navigationPrevious = $( "<panel class='navigation left'></panel>" );
            this.ContentZone.append( this._navigationPrevious[0] );

            this._navigationMiddle = $( "<panel class='main'></panel>" );
            this.ContentZone.append( this._navigationMiddle[0] );

            this._navigationNext = $( "<panel class='navigation right'></panel>" );
            this.ContentZone.append( this._navigationNext[0] );

            this._panels = {};
        }

        this.debug( "Declare the panel '" + panel + "'" );

        newPanel = $( "<panel id='" + panel + "'></panel>" );
        this._navigationMiddle.append( newPanel[0] );
        this._panels[panel] = this.addFocus( newPanel );
        if ( cssClass )
            newPanel.addClass( cssClass );

        this._currentPanelName = panel;
        this._currentPanel = newPanel;

        if ( this._navigationPanels === null)
            this._navigationPanels = [[]];
        this._navigationPanels[0].push( panel );

        return newPanel;
    }

    /**
     * Open a new div into the current panel
     * @param {string} name class name of the block
     */
    startBlock(name) {
        if ( this.CurrentPanel === null )
            return;

        this._blocks.push( this.CurrentPanel );
        let newBlock = $( "<div" + ( name === null || name === undefined ? "" : " class='" + name + "'" ) + "></div>" );
        this.CurrentPanel.append( newBlock );
        this._currentPanel = newBlock;
    }

    /**
     * Close a div into the current panel
     */
    endBlock() {
        if ( this.CurrentPanel === null || this._blocks.length === 0 )
            return;

        this._currentPanel = this._blocks.pop();
    }

    /**
     * Panels contains a list of one panel or some panels to show on depends on the current index
     * @param {any} panels null to show all or list of panels to show
     */
    declareNavigationPanels ( panels ) {
        var currentPanel = null;

        this._navigationPanels = null;

        if ( this._panels === null )
            return;

        if ( panels === null || panels === undefined ) {
            this._navigationPanels = [[]];
            for ( currentPanel in this._panels )
                this._navigationPanels[0].push( currentPanel );
            return;
        }

        if ( typeof panels === "string" ) {
            currentPanel = this._panels[panels];
            if ( currentPanel === null || currentPanel === undefined )
                return;
            this._navigationPanels = [[panels]];
            return;
        }

        if ( !Array.isArray( panels ) )
            return;

        this._navigationPanels = [];
        for ( var i in panels ) {
            if ( Array.isArray( panels[i] ) ) {
                var list = [];
                for ( var j in panels[i] ) {
                    currentPanel = this._panels[panels[i][j]];
                    if ( currentPanel !== null && currentPanel !== undefined )
                        list.push( panels[i][j] );
                }
                this._navigationPanels.push( list );
            } else {
                currentPanel = this._panels[panels[i]];
                if ( currentPanel !== null && currentPanel !== undefined )
                    this._navigationPanels.push( [panels[i]] );
            }
        }
    }

    /**
     * Go to the previous panel
     */
    gotoPreviousPanel () {
        if ( this._navigationPanels === null || this._navigationPanelIndex === 0 )
            return;

        this._navigationPanelIndex--;
        while ( !this.gotoCurrentPanel() && this._navigationPanelIndex > 0 )
            this._navigationPanelIndex--;
    }

    /**
     * Look for the navigation index containing the panel name enable
     * @param {any} panel panel name
     * @returns {int} navigation index within the panel name or -1
     */
    getNavigationIndex( panel ) {
        if ( panel === null )
            return -1;

        // looking for the panel into the list of panels

        for ( let i = 0; i < this._navigationPanels.length; i++ ) {
            if ( this._navigationPanels[i].indexOf( panel ) >= 0 && this._navigationPanelHidden.indexOf( panel ) < 0 )
                return i;
        }

        return -1;
    }

    /**
     * Refresh the current panel or go to a new panel
     * @param {any} index index of the panel (see declareNavigationPanels)
     * @returns {boolean} true if the panel is visible
     */
    gotoCurrentPanel ( index ) {
        function handlePreviousPanel( box ) {
            return function () {
                box.gotoPreviousPanel();
            };
        }

        function handleNextPanel( box ) {
            return function () {
                box.gotoNextPanel();
            };
        }

        if ( this._panels === null || this._navigationPanels === null ) {
            if ( this._navigationPrevious !== null && this._navigationPrevious !== undefined )
                this._navigationPrevious.hide();

            if ( this._navigationNext !== null && this._navigationNext !== undefined )
                this._navigationNext.hide();

            return true;
        }

        if ( index !== null && index !== undefined )
            this._navigationPanelIndex = index;

        if ( this._navigationPanelIndex < 0 )
            this._navigationPanelIndex = 0;

        if ( this._navigationPanelIndex >= this._navigationPanels.length )
            this._navigationPanelIndex = this._navigationPanels.length - 1;

        let currentUser = DSDatabase.Instance.CurrentUser;
        let item = this.Value;
        let panelVisible = false;

        for ( var name in this._panels ) {
            var panel = this._panels[name];

            if ( panel === null || panel === undefined )
                continue;

            if ( this._navigationPanels[this._navigationPanelIndex].indexOf( name ) < 0 ||
                this._navigationPanelHidden.indexOf( name ) >= 0 ||
                !this.isPanelVisible( name, currentUser, item)) {
                panel.hide();
            } else {
                panelVisible = true;
                panel.show();
                this.refreshPanel( name );
            }
        }

        // Check if the current panel is the first 

        let firstPanel = this._navigationPanelIndex === 0;

        if ( !firstPanel ) {
            firstPanel = true;

            for ( let i = 0; i < this._navigationPanelIndex && firstPanel; i++ ) {
                for ( let j = 0; j < this._navigationPanels[i].length && firstPanel; j++ ) {
                    firstPanel = !this.isPanelVisible( this._navigationPanels[i][j], currentUser, item );
                }
            }
        }

        if ( firstPanel ) {
            this._navigationPrevious.off( 'click' );
            this._navigationPrevious.addClass( "first" );
        } else {
            this._navigationPrevious.off( 'click' ).on( 'click', handlePreviousPanel( this ) );
            this._navigationPrevious.removeClass( "first" );
        }

        // Check if the current panel is the last

        let lastPanel = this._navigationPanelIndex >= this._navigationPanels.length - 1;

        if ( !lastPanel ) {
            lastPanel = true;

            for ( let i = this._navigationPanelIndex + 1; i < this._navigationPanels.length && lastPanel; i++ ) {
                for ( let j = 0; j < this._navigationPanels[i].length && lastPanel; j++ ) {
                    lastPanel = !this.isPanelVisible( this._navigationPanels[i][j], currentUser, item );
                }
            }
        }

        if ( lastPanel ) {
            this._navigationNext.off( 'click' );
            this._navigationNext.addClass( "last" );
        } else {

            this._navigationNext.off( 'click' ).on( 'click', handleNextPanel( this ) );
            this._navigationNext.removeClass( "last" );
        }

        // show the previous and the next panel

        if ( this._navigationPanels.length <= 1 ) {
            this._navigationPrevious.hide();
            this._navigationNext.hide();
        } else {
            this._navigationPrevious.show();
            this._navigationNext.show();
        }

        // Go to the first focus into the current panel

        for ( let i = 0; i < this._focus.length; i++ ) {
            let field = this._focus[i];

            if ( field.length === 1 || !this.isFocusable( field ) )
                continue;

            if ( this._navigationPanels[this._navigationPanelIndex].indexOf( field.Panel ) < 0 )
                continue;

            this.setFocus( field );
            break;
        }

        return panelVisible;
    }

    /**
     * Go to the next panel
     */
    gotoNextPanel () {
        if ( this._navigationPanels === null || this._navigationPanelIndex >= this._navigationPanels.length - 1 )
            return;

        this._navigationPanelIndex++;
        while ( !this.gotoCurrentPanel() && this._navigationPanelIndex < this._navigationPanels.length )
            this._navigationPanelIndex++;
    }

    /**
     * Notify that the panel can be shown
     * @param {any} panel name of the panel shown
     */
    showPanel( panel ) {
        if ( panel === null || panel === undefined )
            return;

        if ( this._navigationPanelHidden.indexOf( panel ) < 0 )
            return;

        this._navigationPanelHidden.splice( this._navigationPanelHidden.indexOf( panel ), 1 );
    }

    /**
     * Abstract method refreshing the current panel
     * @param {any} panel name of the panel refreshed
     */
    refreshPanel( panel ) {
        let currentUser = DSDatabase.Instance.CurrentUser;
        let item = this.Value;
        panel = panel === null || panel === undefined ? null : panel;

        for ( var field in this._fields ) {
            var currentField = this._fields[field];

            if ( panel !== null && currentField.Panel !== panel )
                continue;

            currentField.Visible = this.isFieldVisible( currentField.Name, currentUser, item ) && ( currentField.Panel === null || currentField.Panel !== null && this.isPanelVisible( currentField.Panel, currentUser, item ) );
            currentField.Readonly = this.isFieldReadonly( currentField.Name, currentUser, item ) || currentField.Panel !== null && this.isPanelReadonly( currentField.Panel, currentUser, item );
            currentField.refresh();
        }

        for ( var board in this._boards ) {
            var currentBoard = this._boards[board];

            if ( panel !== null && currentBoard.Panel !== panel )
                continue;

            currentBoard.Visible = this.isBoardVisible( currentBoard.Name, currentUser, item ) && ( currentBoard.Panel === null || currentBoard.Panel !== null && this.isPanelVisible( currentBoard.Panel, currentUser, item ) );
            currentBoard.Readonly = this.isBoardReadonly( currentBoard.Name, currentUser, item ) || currentBoard.Panel !== null && this.isPanelReadonly( currentBoard.Panel, currentUser, item );
            currentBoard.refresh();
            currentBoard.adjustWebix();
        }
    }

    /**
     * notifiy that the panel must be hidden even if it's in the panel to show
     * @param {any} panel name of the panel hidden
     */
    hidePanel ( panel ) {
        if ( panel === null || panel === undefined )
            return;

        if ( this._navigationPanelHidden.indexOf( panel ) >= 0 )
            return;

        this._navigationPanelHidden.push( panel );
    }

    /**
     * (Private Method) handle the changing focus of a field
     * @param {any} field new field
     * @returns {any} true if the field has the focus
     */
    onChangeFocus( field ) {
        if ( this._focusLastIndex !== null ) {
            let focus = this._focus[this._focusLastIndex];
            if ( focus instanceof GUI.Field.Field )
                focus.onFocusOut();

            this._focusLastIndex = null;
        }

        if ( field === null || field === undefined )
            return false;

        if ( !field.focus() )
            return false;

        if ( field.Name !== null && field.Name !== undefined )
            this.verbose( "Focus on " + field.Name + " [" + this._focusIndex + "]" );
        else if ( field.length === 1 )
            this.verbose( "Focus on " + field.attr( 'id' ) + " [" + this._focusIndex + "]" );
        else
            this.verbose( "Focus on " + this._focusIndex );

        this._focusLastIndex = this._focusIndex;

        if ( field instanceof GUI.Field.Field )
            field.onFocusIn();

        return true;
    }

    /**
     * Clear all fields into the focus
     */
    clearFocus() {
        this.onChangeFocus( null );

        for ( let i in this._focus ) {
            let focus = this._focus[i];
            if ( focus === null || focus === undefined )
                continue;

            if ( focus instanceof GUI.GUI ) {
                focus.TabIndex = null;
                continue;
            }

            if ( typeof focus === "string" )
                focus = this.Component.find( focus );

            if ( focus !== null && focus !== undefined && focus.length === 1 ) {
                focus.attr( 'tabindex', null );
                continue;
            }
        }

        this._focus = [];
        this._focusIndex = 0;
        this._focusLastIndex = null;
    }

    /**
     * Retrieve the item object on depends on its id
     * @param {any} item item to look for
     * @returns {any} item found or null
     */
    getFocusItem( item ) {
        if ( item === null || item === undefined )
            return null;

        if ( item instanceof GUI.GUI )
            return item;

        if ( typeof item === "string" ) {
            if ( this._fields[item] !== null && this._fields[item] !== undefined )
                return this._fields[item];

            if ( this._boards[item] !== null && this._boards[item] !== undefined )
                return this._boards[item];

            item = this.Component.find( item );
            if ( item !== null && item !== undefined && item.length === 1 )
                return item;

            return null;
        }

        if ( item.length === 1 )
            return item;

        return null;
    }

    /**
     * Add a new item into 
     * @param {any} item item to add into the focus list
     */
    addFocus( item ) {
        item = this.getFocusItem( item );
        if ( item === null || item === undefined )
            return null;

        if ( item instanceof GUI.GUI ) {
            item.TabIndex = this._focus.length;
            this._focus.push( item );
            return item;
        }

        if ( item !== null && item !== undefined && item.length === 1 ) {
            item.attr( 'tabindex', this._focus.length );
            this._focus.push( item );
            return item;
        }

        return null;
    }

    /**
     * Set the focus on the first field visible
     */
    firstFocus() {
        this._focusIndex = -1;
        this.nextFocus();
    }

    /**
     * @param {string} item field name to check
     * @returns {boolean} true if the current focus is focusable ...
     */
    isFocusable( item ) {
        item = this.getFocusItem( item );
        if ( item === null || item === undefined )
                return false;

        if ( item instanceof GUI.GUI )
            return item.Visible && !item.Readonly;

        if ( item !== null && item !== undefined && item.length === 1 )
            return item.is( ':visible' );

        return false;
    }

    /**
     * Go to the previous field visible
     */
    previousFocus() {
        let i = 0;
        let lastIndex = this._navigationPanelIndex;

        while ( i < 2 ) {
            this._focusIndex--;
            if ( this._focusIndex < 0 )
                this._focusIndex = this._focus.length - 1;

            for ( ; this._focusIndex >= 0; this._focusIndex-- ) {
                let field = this._focus[this._focusIndex];

                if ( !this.isFocusable( field ) )
                    continue;

                if ( field.length === 1 && this._focusIndex > 0 && field[0].tagName === "PANEL" ) {
                    let j = this._focusIndex - 1;
                    let subField = this._focus[j];

                    if ( subField.length === undefined ) {
                        let panelName = subField.Panel;

                        // look for the last item of the previous panel

                        for ( ; j >= 0; j-- ) {
                            subField = this._focus[j];

                            if ( subField.Panel === null || subField.Panel === undefined || subField.Panel !== panelName )
                                break;

                            if ( !this.isFocusable( subField ) )
                                continue;

                            field = subField;
                            this._focusIndex = j;
                            break;
                        }
                    }
                } else if ( field.length === 1 && this._focusIndex === 0 && field[0].tagName === "PANEL" )
                    break;

                if ( field.Panel !== null && field.Panel !== undefined ) {
                    let newIndex = this.getNavigationIndex( field.Panel );
                    if ( lastIndex !== newIndex )
                        this.gotoCurrentPanel( newIndex );
                    lastIndex = newIndex;
                }

                if ( this.onChangeFocus( field ) )
                    return;
            }

            i++;
        }
    }

    /**
     * Go to the next field visible
     */
    nextFocus() {
        let i = 0;
        let lastIndex = this._navigationPanelIndex;

        while ( i < 2 ) {
            if ( this._focusIndex >= this._focus.length )
                this._focusIndex = -1;

            for ( this._focusIndex++; this._focusIndex < this._focus.length; this._focusIndex++ ) {
                let field = this._focus[this._focusIndex];

                if ( !this.isFocusable( field ) )
                    continue;

                if ( field.Panel !== null && field.Panel !== undefined ) {
                    let newIndex = this.getNavigationIndex( field.Panel );
                    if ( lastIndex !== newIndex )
                        this.gotoCurrentPanel( newIndex );
                    lastIndex = newIndex;
                }

                if ( field.length === 1 && field[0].tagName === "PANEL" ) {
                    let panelName = field.attr( 'id' );

                    // look for the first item into the panel

                    for ( let j = this._focusIndex + 1; j < this._focusIndex < this._focus.length; j++ ) {
                        let subField = this._focus[j];

                        if ( subField.Panel === null || subField.Panel === undefined || subField.Panel !== panelName )
                            break;

                        if ( !this.isFocusable( subField ) )
                            continue;

                        field = subField;
                        this._focusIndex = j;
                        break;
                    }
                }

                if ( this.onChangeFocus( field ) )
                    return;
            }

            i++;
        }
    }

    /**
     * Update the focus and put it on the field
     * @param {any} item instance of field to look for
     */
    setFocus( item ) {
        item = this.getFocusItem( item );
        if ( item === null || !this.isFocusable( item ) )
            return;

        let itemFocus = this.getFocusItem( this._focus[this._focusIndex] );
        if ( itemFocus !== null && this.isFocusable( itemFocus ) ) {
            if ( item instanceof GUI.GUI && itemFocus instanceof GUI.GUI && item.Name === itemFocus.Name )
                return;
            if ( item.length === 1 && itemFocus.length === 1 && item[0] === itemFocus[0] )
                return;
        }

        let tabIndex = null;
        if ( item.length === 1 )
            tabIndex = parseInt(item.attr( 'tabindex' ));
        else if ( item instanceof GUI.GUI )
            tabIndex = item.TabIndex;

        if ( tabIndex === null || tabIndex === undefined || tabIndex >= this._focus.length || tabIndex === this._focusIndex )
            return;

        this._focusIndex = tabIndex;
        this.onChangeFocus( item );
    }

    /**
     * Go to the next or previous field
     * @param {any} stepFocus previous field (-1) or next field (1)
     * @param {any} fn function to check if the item is selected or not
     */
    arrowFocus( stepFocus, fn ) {
        let itemFocused = this.getFocusItem( this._focus[this._focusIndex] );
        if ( itemFocused === null || itemFocused === undefined )
            return;

        if ( itemFocused instanceof GUI.GUI )
            itemFocused = itemFocused.Component;

        let x = itemFocused.offset().left;
        let y = itemFocused.offset().top;

        let lastIndex = this._navigationPanelIndex;
        let nextFocusIndex = this._focusIndex;

        for ( nextFocusIndex += stepFocus; 0 <= nextFocusIndex && nextFocusIndex < this._focus.length; nextFocusIndex += stepFocus ) {
            let field = this._focus[nextFocusIndex];

            itemFocused = this.getFocusItem( field );
            if ( !this.isFocusable( itemFocused ) )
                continue;

            if ( itemFocused instanceof GUI.GUI )
                itemFocused = itemFocused.Component;

            let nextX = itemFocused.offset().left;
            let nextY = itemFocused.offset().top;

            if ( !fn( x, y, nextX, nextY ) )
                continue;

            if ( field.Panel !== null && field.Panel !== undefined ) {
                let newIndex = this.getNavigationIndex( field.Panel );
                if ( lastIndex !== newIndex )
                    this.gotoCurrentPanel( newIndex );
                lastIndex = newIndex;
            }
            
            if ( this.onChangeFocus( field ) )
                return;
        }
    }

    /**
     * Go to the field on the left
     */
    leftFocus() {
        this.arrowFocus( -1, function ( x1, y1, x2, y2 ) { return x1 > x2 && y1 === y2; } );
    }

    /**
     * Go to the field on the previous line
     */
    upFocus() {
        this.arrowFocus( -1, function ( x1, y1, x2, y2 ) { return x1 === x2 && y1 > y2; } );
    }

    /**
     * Go to the field on the next line
     */
    downFocus() {
        this.arrowFocus( 1, function ( x1, y1, x2, y2 ) { return x1 === x2 && y1 < y2; } );
    }

    /**
     * Go to the field on the right
     */
    rightFocus() {
        this.arrowFocus( 1, function ( x1, y1, x2, y2 ) { return x1 < x2 && y1 === y2; } );
    }

    /**
     * Basement of a dialog box
     * @param {any} name     identity of the box
     * @param {any} cssClass class to add to the box
     */
    constructor ( name, cssClass ) {
        super( "box", GUI.Box.Box.MAIN_PAGE, name, cssClass );

        this._boxIndex = GUI.Box.Box.StackIndex;
        this._boxOpened = false;

        this._title = null;
        this._message = null;
        this._error = null;
        this._mode = null;

        this._focus = [];
        this._focusIndex = 0;
        this._focusLastIndex = null;

        this._panels = null;
        this._fields = {};
        this._boards = {};
        this._currentPanelName = null;
        this._currentPanel = null;

        this._navigationPrevious = null;
        this._navigationMiddle = null;
        this._navigationNext = null;
        this._navigationPanels = null;
        this._navigationPanelIndex = 0;
        this._navigationPanelHidden = [];

        this._onClosed = null;

        this._buttons = {};
        this._blocks = [];

        this._zIndex = -1;
    }
};
