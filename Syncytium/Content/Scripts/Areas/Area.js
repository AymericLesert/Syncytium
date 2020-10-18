/// <reference path="_references.js" />

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

/**
 * By default, set these messages
 */
var ERR_INITIALIZATION = "L'initialisation a rencontré une erreur ... Si le problème persiste, contacter votre équipe support !";
var BTN_RELOAD = "RECHARGER";
var ERROR = "Erreur";

/**
 * This file handles the relation between the data model (into DatabaseHub) and the interface into an area
 *
 * NB: To improve performance of building and refreshing the screen, the progress page is run between the beginning and the end ... it's faster!
 */
class Area extends GUI.GUI {
    /**
     * @returns {string} link towards the root of the documentation
     */
    static get HTTP_ROOT_DOCUMENTATION() {
        let root = null;

        if ( !String.isEmptyOrWhiteSpaces( DSDatabase.Instance.Parameters["HTTP.Document"] ) ) {
            root = DSDatabase.Instance.Parameters["HTTP.Document"];
        } else {
            let protocol = 'http';
            let site = 'application.syncytium.local';

            if ( window.location.href.startsWith( 'http://localhost' ) )
                protocol = 'https';
            else
                protocol = window.location.href.split( ':' )[0];

            if ( window.location.href.indexOf( 'syncytium.server' ) >= 0 )
                site = 'application.syncytium.server';

            root = protocol + '://' + site + '/wiki/index.php/utilisation/';
        }

        if ( !root.endsWith( '/' ) )
            root += '/';

        return root;
    }

    /**
     * @returns {string} "body > menu > ul > "
     */
    static get ROOT_MENU() {
        return "body > menu > ul > ";
    }

    /**
     * @returns {string} "ReleaseNotes"
     */
    static get SERVICE_RELEASE_NOTES() {
        return "ReleaseNotes";
    }

    /**
     * @param {any} link string towards to the documentation, function to call on clicking on help
     */
    set Help( link ) {
        function handleHelp( area ) {
            return function () {
                if ( typeof area._link === "string" )
                    window.open( Area.HTTP_ROOT_DOCUMENTATION + area._link, "_blank" );

                if ( typeof area._link === "function" )
                    area._link();
            };
        }

        this._link = link === null || link === undefined ? null : link;

        $( Area.ROOT_MENU + "#help" ).unbind();

        if ( this._link !== null )
            $( Area.ROOT_MENU + "#help" ).click( handleHelp( this ) );
    }

    /**
     * @returns {int} the module id defined in this screen
     */
    get ModuleId() {
        return this._moduleId;
    }

    /**
     * @returns {any} list of menus
     */
    get Menu() {
        return this._menu;
    }

    /**
     * @returns {string} name of the current menu
     */
    get CurrentMenu() {
        return this._currentMenu;
    }

    /**
     * @returns {string} name of the current sub menu
     */
    get CurrentSubMenu() {
        return this._currentSubMenu;
    }

    /**
     * Destructor
     */
    destructor () {
        super.destructor();

        for ( let board of Array.toIterable( this._boards ) )
            board.destructor();

        this._boards = {};
    }

    /**
     * Private method to declare a new board
     * @param {any} name name of the menu attached to the board
     * @param {any} type board type
     * @returns {any} the board created
     */
    declareBoard( name, type ) {
        let menu = this.getMenu( name );
        let board = new type( menu.sheet, name );

        board.KeepListEvents = true;

        menu.boards.push( board );

        return board;
    }

    /**
     * Set the title
     * @param {any} title   title of the application cliente
     * @param {any} element sub part of the application cliente
     */
    setTitle ( title, element ) {
        this._title = Helper.Label( title );
        this._element = element === null || element === undefined ? null : element;

        $( 'header > ul > li.area' ).html( Helper.Span( this._title ) );

        if ( this._element === null ) {
            $( "header > ul > li.element" ).hide();
        } else {
            $( "header > ul > li.element" ).show();
            $( 'header > ul > li.element.screen_name' ).html( String.encode( this._element ) );
        }
    }

    // ----------------------------------------------------------------------------------------------------
    // HANDLING MENU
    // ----------------------------------------------------------------------------------------------------

    /**
     * Declare a menu
     * @param {any} menu             identity of the menu concerned by the declaration
     * @param {any} submenu          identity of the submenu
     * @param {any} title            label of the sub menu
     * @param {any} filter           key allowing to show or not this sub menu on depends on a key
     * @param {boolean} showProgress true if the progress bar must shown
     * @returns {any} the menu item corresponding to this declaration
     */
    declareMenu( menu, submenu, title, filter, showProgress ) {
        function handleOnMenu( area, menu, submenu ) { return function () { area.onMenu( menu, submenu ); }; }

        function handleHover( id, label ) {
            return function () {
                $( '<p class="webix_tooltip menu ' + id + '"></p>' ).html( Helper.Span( label ) ).appendTo( 'body' ).fadeIn( 'slow' );
            };
        }

        function handleOut( id ) {
            return function () {
                $( '.webix_tooltip.menu.' + id ).remove();
            };
        }

        function handleMove( id ) {
            return function ( e ) {
                let mousex = e.pageX + 10;
                let mousey = e.pageY;
                $( '.webix_tooltip.menu.' + id ).css( { top: mousey, left: mousex } );
            };
        }

        if ( this._menu[menu] === null || this._menu[menu] === undefined ) {
            this.info( "Declaring menu ('" + menu + "', '" + title + "') ..." );

            if ( this._firstMenu === null )
                this._firstMenu = menu;

            this._menu[menu] = {
                id: menu,
                title: Helper.Label( title ),
                filter: filter === undefined ? null : filter,
                boards: [],
                menu: {},
                orderMenu: [],
                current: null,
                sheet: null,
                showProgress: showProgress !== null && showProgress !== undefined && showProgress === true
            };

            let zoneMenu = $( "<li class='button' id='" + menu + "'></li>" );
            $( Area.ROOT_MENU + " li.spaceall" ).before( zoneMenu );

            zoneMenu.hover( handleHover( menu, this._menu[menu].title ), handleOut ( menu ) ).mousemove( handleMove ( menu ));
            zoneMenu.click( handleOnMenu( this, menu ) );

            this._menu[menu].sheet = $( "<sheet class='" + menu + "'></sheet>" );
            this._menu[menu].sheet.hide();
            $( "body > main" ).append( this._menu[menu].sheet );

            Language.Manager.Instance.addComponent( this._menu[menu].sheet );
        }

        if ( submenu === null || submenu === undefined )
            return this._menu[menu];

        let item = this._menu[menu];
        if ( item.menu[submenu] === null || item.menu[submenu] === undefined ) {
            this.info( "Declaring sub menu ('" + menu + "', '" + submenu + "', '" + title + "') ..." );

            item.menu[submenu] = {
                id: submenu,
                title: Helper.Label( title ),
                filter: filter === undefined ? null : filter,
                boards: [],
                functions: [],
                sheet: null,
                showProgress: showProgress !== null && showProgress !== undefined && showProgress === true
            };
            item.orderMenu.push( item.menu[submenu] );

            if ( item.current === null )
                item.current = submenu;

            let zoneMenu = $( "<li class='button' id='" + submenu + "'></li>" );
            $( Area.ROOT_MENU + " li.spaceall" ).before( zoneMenu );

            zoneMenu.hover( handleHover( submenu, item.menu[submenu].title ), handleOut( submenu ) ).mousemove( handleMove( submenu ) );
            zoneMenu.click( handleOnMenu( this, menu, submenu ) );

            item.menu[submenu].sheet = $( "<sheet class='" + submenu + "'></sheet>" );
            item.menu[submenu].sheet.hide();
            $( "body > main" ).append( item.menu[submenu].sheet );

            Language.Manager.Instance.addComponent( item.menu[submenu].sheet );
        }

        return item.menu[submenu];
    }

    /**
     * Retrieve the menu by its name
     * @param {any} menu menu name
     * @returns {any} menu description
     */
    getMenu( menu ) {
        let item = this._menu[menu];
        if ( item !== null && item !== undefined )
            return item;

        for ( let id in this._menu ) {
            item = this._menu[id].menu[menu];
            if ( item !== null && item !== undefined )
                return item;
        }

        return null;
    }

    /**
     * Notify the new value of the field filter
     * @param {any} area this
     * @param {any} filter filter item updated
     */
    onHandleChangeFilter( area, filter ) {
        return function () {
            let value = filter.field.Value;
            Filter.Filter.Instance.setField( filter.key, value );

            let menu = area.getMenu( filter.menu );

            for ( let board of menu.boards )
                board[filter.fieldName] = value;
        };
    }

    /**
     * Notify the reload data into the field
     * @param {any} filter filter item updated
     */
    onHandleRefresh( filter ) {
        return function () {
            filter.field.refresh();
        };
    }

    /**
     * Declare a new input text filter into the module
     * @param {string} menu menu attached to the field
     * @param {string} fieldName name of the attribute set attached to the filter
     * @param {string} label multilingual label of the filter
     * @returns {any} the instance of the field
     */
    declareFilterInputText( menu, fieldName, label ) {
        let filter = { key: this.Name + "." + menu + "." + fieldName, menu: menu, fieldName: fieldName, field: null };

        Filter.Filter.Instance.setField( filter.key, null );

        filter.field = new GUI.Field.FieldInput( "body > menu > ul > li.field", this.Name + menu + fieldName, label );
        filter.field.Value = Filter.Filter.Instance.getField( filter.key );
        filter.field.on( 'change', this.onHandleChangeFilter( this, filter ) );

        this._filters.push( filter );

        return filter.field;
    }

    /**
     * Declare a new input text filter into the module
     * @param {string} menu menu attached to the field
     * @param {string} fieldName name of the attribute set attached to the filter
     * @param {string} label multilingual label of the filter
     * @param {any} digit instance of digit to set
     * @returns {any} the instance of the field
     */
    declareFilterInputDigit( menu, fieldName, label, digit ) {
        let filter = { key: this.Name + "." + menu + "." + fieldName, menu: menu, fieldName: fieldName, field: null };

        Filter.Filter.Instance.setField( filter.key, null );

        filter.field = new GUI.Field.FieldInputWithBox( "body > menu > ul > li.field", this.Name + menu + fieldName, label, digit );
        filter.field.AllowNullValue = true;
        filter.field.Value = Filter.Filter.Instance.getField( filter.key );
        filter.field.on( 'change', this.onHandleChangeFilter( this, filter ) );

        this._filters.push( filter );

        return filter.field;
    }

    /**
     * Declare a new select filter into the module
     * @param {string} menu menu attached to the field
     * @param {string} fieldName name of the attribute set attached to the filter
     * @param {string} label multilingual label of the filter
     * @param {any} list list of items to select
     * @returns {any} the instance of the field
     */
    declareFilterSelect( menu, fieldName, label, list ) {
        let filter = { key: this.Name + "." + menu + "." + fieldName, menu: menu, fieldName: fieldName, field: null };

        Filter.Filter.Instance.setField( filter.key, null );

        filter.field = new GUI.Field.FieldSelect( "body > menu > ul > li.field", this.Name + menu + fieldName, label, list );
        filter.field.AllowNullValue = true;
        filter.field.on( 'onCreate', this.onHandleRefresh( filter ) );
        filter.field.on( 'onUpdate', this.onHandleRefresh( filter ) );
        filter.field.on( 'onDelete', this.onHandleRefresh( filter ) );
        filter.field.Value = Filter.Filter.Instance.getField( filter.key );
        filter.field.on( 'change', this.onHandleChangeFilter( this, filter ) );

        this._filters.push( filter );

        return filter.field;
    }

    /**
     * Declare a new select filter into the module
     * @param {string} menu menu attached to the field
     * @param {string} fieldName name of the attribute set attached to the filter
     * @param {string} label multilingual label of the filter
     * @param {any} list list of items to select
     * @returns {any} the instance of the field
     */
    declareFilterSelectImage( menu, fieldName, label, list ) {
        let filter = { key: this.Name + "." + menu + "." + fieldName, menu: menu, fieldName: fieldName, field: null };

        Filter.Filter.Instance.setField( filter.key, null );

        filter.field = new GUI.Field.FieldSelectImage( "body > menu > ul > li.field", this.Name + menu + fieldName, label, (menu + "_SELECT_" + fieldName).toUpperCase(), list );
        filter.field.AllowNullValue = true;
        filter.field.on( 'onCreate', this.onHandleRefresh( filter ) );
        filter.field.on( 'onUpdate', this.onHandleRefresh( filter ) );
        filter.field.on( 'onDelete', this.onHandleRefresh( filter ) );
        filter.field.Value = Filter.Filter.Instance.getField( filter.key );
        filter.field.on( 'change', this.onHandleChangeFilter( this, filter ) );

        this._filters.push( filter );

        return filter.field;
    }

    /**
     * Declare a new check box filter into the module
     * @param {string} menu menu attached to the field
     * @param {string} fieldName name of the attribute set attached to the filter
     * @param {string} label multilingual label of the filter
     * @returns {any} the instance of the field
     */
    declareFilterCheckBox( menu, fieldName, label ) {
        let filter = { key: this.Name + "." + menu + "." + fieldName, menu: menu, fieldName: fieldName, field: null };

        Filter.Filter.Instance.setField( filter.key, null );

        filter.field = new GUI.Field.FieldCheckBox( "body > menu > ul > li.field", this.Name + menu + fieldName, label, [label + "_NULL", label + "_TRUE", label + "_FALSE"] );
        filter.field.AllowNullValue = true;
        filter.field.Value = Filter.Filter.Instance.getField( filter.key );
        filter.field.on( 'change', this.onHandleChangeFilter( this, filter ) );

        this._filters.push( filter );

        return filter.field;
    }

    /**
     * Method on selecting a menu (specification of treatment due to the selection of the menu)
     * @param {any} menu    identity of the menu selected by the user
     * @param {any} submenu identity of the sub-menu selected by the user
     */
    onSelectingMenu( menu, submenu ) {
        for ( let filter of this._filters ) {
            let name = String.isEmptyOrWhiteSpaces( submenu ) ? menu : submenu;

            filter.field.Visible = filter.menu === name;

            if ( filter.menu === name )
                filter.field.raise( 'change' );
        }
    }

    /**
     * Select a menu
     * @param {any}     menu    identity of the menu selected by the user
     * @param {any}     submenu identity of the submenu selected by the user
     * @param {boolean} force   true if the menu must be checked
     */
    async onMenu ( menu, submenu, force ) {
        let item = this._menu[menu];
        if ( item === null || item === undefined )
            return;

        submenu = submenu === null || submenu === undefined ? null : submenu;

        this.info( "Select menu '" + ( menu === null ? "null" : menu ) + "', '" + ( submenu === null ? "null" : submenu ) + "'" );

        if ( (force === null || force === undefined || force === false) && this._currentMenu === menu && this._currentSubMenu === submenu )
            return;

        if ( submenu === null && item.boards.length === 0 && item.current !== null )
            submenu = item.current;
        else if ( submenu === null && item.boards.length === 0 ) {
            for ( let i in item.menu ) {
                submenu = i;
                break;
            }
        }

        if ( this._menu[menu] !== undefined && this._menu[menu].showProgress === true ) {
            GUI.Box.Progress.Start( true );
            GUI.Box.Progress.SetStatus( 0, 1, "MSG_INITIALIZING" );
            await GUI.Box.Progress.Sleep( 10 );
        }

        // hide all screens

        for ( let id in this._menu ) {
            let currentItem = this._menu[id];
            if ( currentItem === null || currentItem === undefined )
                continue;

            for ( let board of currentItem.boards )
                board.hide();

            if ( $( Area.ROOT_MENU + "#" + id ).hasClass( 'selected' ) )
                $( Area.ROOT_MENU + "#" + id ).removeClass( 'selected' );
            $( Area.ROOT_MENU + "#" + id ).prop( 'disabled', false );

            currentItem.sheet.remove();

            for ( let subId in currentItem.menu ) {
                let currentSubItem = currentItem.menu[subId];
                if ( currentSubItem === null || currentSubItem === undefined )
                    continue;

                for ( let board of currentSubItem.boards )
                    board.hide();

                if ( $( Area.ROOT_MENU + "#" + subId ).hasClass( 'selected' ) )
                    $( Area.ROOT_MENU + "#" + subId ).removeClass( 'selected' );
                $( Area.ROOT_MENU + "#" + subId ).prop( 'disabled', false );
                $( Area.ROOT_MENU + "#" + subId ).hide();

                currentSubItem.sheet.remove();
            }
        }

        // show the right screen

        for ( let id in this._menu ) {
            let currentItem = this._menu[id];
            if ( currentItem === null || currentItem === undefined )
                continue;

            if ( id === menu && submenu === null && !$( Area.ROOT_MENU + "#" + id ).hasClass( 'selected' ) ) {
                $( Area.ROOT_MENU + "#" + id ).addClass( 'selected' );
                $( Area.ROOT_MENU + "#" + id ).prop( 'disabled', true );

                if ( $( "main > sheet." + id ).length > 0 )
                    $( "main > sheet." + id ).show();
                else if ( currentItem.sheet.length > 0 ) {
                    currentItem.sheet.show();
                    $( "body > main" ).append( currentItem.sheet );
                }

                for ( let board of currentItem.boards )
                    await board.show();
            }

            for ( let subId in currentItem.menu ) {
                let currentSubItem = currentItem.menu[subId];
                if ( currentSubItem === null || currentSubItem === undefined )
                    continue;

                if ( id === menu )
                    $( Area.ROOT_MENU + "#" + subId ).show();

                if ( id !== menu || subId !== submenu )
                    continue;

                $( Area.ROOT_MENU + "#" + subId ).addClass( 'selected' );
                $( Area.ROOT_MENU + "#" + subId ).prop( 'disabled', true );

                if ( $( "main > sheet." + subId ).length > 0 )
                    $( "main > sheet." + subId ).show();
                else if ( currentSubItem.sheet.length > 0 ) {
                    currentSubItem.sheet.show();
                    $( "body > main" ).append( currentSubItem.sheet );
                }

                for ( let board of currentSubItem.boards )
                    await board.show();
            }
        }

        // Update filter

        this.onSelectingMenu( menu, submenu );

        this._currentMenu = menu;
        this._currentSubMenu = submenu;
        item.current = submenu;

        if ( this._menu[menu] !== undefined && this._menu[menu].showProgress === true )
            GUI.Box.Progress.Stop();
    }

    // ----------------------------------------------------------------------------------------------------
    // EVENTS FROM DATABASE HUB
    // ----------------------------------------------------------------------------------------------------

    /**
     * Called by the DS Database when the status changes
     * @param {any} oldStatus old status
     * @param {any} newStatus new status 
     * @param {any} errors    list of errors during the connection process
     */
    onStatusChanged ( oldStatus, newStatus, errors ) {
        if ( errors === null || errors === undefined )
            this.info( "The current database status is '" + newStatus + "'" );
        else
            this.info( "The current database status is '" + newStatus + "' (" + errors.toString() + ")" );

        function reloadPage() {
            window.onbeforeunload = null;
            window.location = URL_ROOT + "Administration/User/SignOut";
        }

        switch ( newStatus ) {
            case "Running":
                this.onLoadedData();
                break;

            case "Error":
                // In case of error, only reload page is possible!

                $( 'body > main' ).hide();
                $( 'body > .progress' ).hide();
                $( '.box_record' ).hide();

                if ( oldStatus === "Running" ) {
                    // The multilingual dictionary is loaded
                    GUI.Box.Message.Reload( errors, reloadPage );
                } else {
                    // No multilingual dictionary ready ... 
                    GUI.Box.Message.Reload( ERR_INITIALIZATION, reloadPage );
                }
                break;
        }
    }

    /**
     * Called at the beginning of a long time treatment
     */
    onStartProgress () {
        GUI.Box.Progress.Start();
    }

    /**
     * Update the message in progress
     * @param {any} value    current progression value
     * @param {any} max      maximum progression value
     * @param {any} message  multilingual label to show on procession
     */
    progressStatus ( value, max, message ) {
        GUI.Box.Progress.SetStatus( value, max, message );
    }

    /**
     * Called at the end of a given treatment
     * @param {any} endOfLoading true when the loading is done (start the service)
     */
    onStopProgress ( endOfLoading ) {
        GUI.Box.Progress.Stop();

        if ( endOfLoading !== undefined && endOfLoading === true ) {
            let htmlParameter = window.location.search.substr( 1 );
            if ( htmlParameter === null || htmlParameter === "" ) {
                this.startApplication( {} );
                return;
            }

            let parameters = {};
            for ( let keyValue of htmlParameter.split( "&" ) ) {
                let parameter = keyValue.split( "=" );
                parameters[parameter[0]] = parameter[1];
            }

            this.startApplication( parameters );
        }
    }

    /**
     * Called on acknowledging the service
     * @param {any} area      area concerned by this request
     * @param {any} service   table name
     * @param {any} record    record acknowledged (the content depends on the action)
     * @param {any} identity  identities of the record acknowledged  (the content depends on the action)
     * @param {any} result    result of the service
     */
    acknowledgeService( area, service, record, identity, result ) {
        this.info( "Acknowledging of the service '" + service + "' for ('" + area + "', " + String.JSONStringify( record ) + ", " + String.JSONStringify( identity ) + ") => " + String.JSONStringify( result ) );

        if ( area !== this.Name ) {
            this.error( "Unable to acknowldge the service because the area '" + area + "' is not expected (" + this.Name + ")" );
            return;
        }

        switch ( service ) {
            case Area.SERVICE_RELEASE_NOTES:
                if ( result.Error !== null && result.Error !== undefined ) {
                    let errors = new Errors();
                    errors.setJSON( result.Error );
                    GUI.Box.Message.Error( "ERROR", errors );
                    return;
                }

                GUI.Box.BoxReleaseNotes.Open( result.Result );
                break;
        }
    }

    /**
     * Update the memory space allowed progress
     * @param {any} value current memory used by the application
     * @param {any} max   maximum memory to use into the application
     */
    progressMemory ( value, max ) {
        if ( value === null || value === undefined || value < 0 )
            value = 0;

        if ( value > max )
            value = max;

        $( "body > .memory > .container" ).width(( value * 100 / max ).toFixed( 0 ).toString() + "%");
    }

    /**
     * Called when the data model was loaded or reloaded
     */
    async onLoadedData () {
        if ( !this._firstLoad )
            return;
        this._firstLoad = false;

        this.info( "Data are loaded. So, building the screen ..." );

        // initialize Language.Manager.Instance within data from database

        Language.Manager.Instance.initialize( DSDatabase.Instance );

        // show the user's picture

        let currentUser = DSDatabase.Instance.CurrentUser;
        let currentModule = DSDatabase.Instance.CurrentModule;
        let currentUserModule = null;
        DSDatabase.Instance.each( "UserModule", function ( record ) {
            if ( record.UserId === currentUser.Id && record.ModuleId === currentModule.Id && !record._deleted )
                currentUserModule = record;
        } );

        $("body > header > ul > .photo > img")[0].src = currentUser === null || currentUser.Picture === null ? UserRecord.DEFAULT_PICTURE().picture : currentUser.Picture;

        $( "body > header > ul > .photo" ).hover( function () {
            let currentUser = DSDatabase.Instance.CurrentUser;

            let currentUserName = "";
            if ( currentUser !== null && currentUser.Name !== "" )
                currentUserName = currentUser.Name;
            else if ( currentUser !== null && currentUser.Login !== "" )
                currentUserName = currentUser.Login;

            $( '<p class="image webix_tooltip"></p>' ).html( currentUserName ).appendTo( 'body' ).fadeIn( 'slow' );
        }, function () {
            $( '.image.webix_tooltip' ).remove();
        } ).mousemove( function ( e ) {
            let mousex = e.pageX - 10 - $( '.image.webix_tooltip' ).width();
            let mousey = e.pageY;
            $( '.image.webix_tooltip' ).css( { top: mousey, left: mousex } );
        } );

        // Write different screens before showing the main screen

        $( Language.Manager.LANGUAGE_ROOT + "#" + DSDatabase.Instance.CurrentLanguage ).html( "<span>" + DSDatabase.Instance.CurrentLanguage + "</span>" );
        webix.i18n.setLocale( DSDatabase.Instance.CurrentLanguage );
        Locale.setLanguage( DSDatabase.Instance.CurrentLanguage );

        await this.draw();

        // Update the screen

        this.setTitle( this._title );
        this.Help = this._link;

        $( "body > main" ).show();

        this.onOpen();

        // Update the user's profile

        function handleUpdateProfile() {
            return function () {
                GUI.Box.BoxRecord.CACHE_DIALOG_BOX( "User", "Profile" ).profile( DSDatabase.Instance.CurrentUser );
            };
        }

        if ( currentUser.Id < 0 ) {
            $( "body > header > ul > .photo" ).unbind();
            $( "body > header > ul > .photo > img" ).css( 'cursor', 'initial' );
        } else {
            $( "body > header > ul > .photo" ).click( handleUpdateProfile() );
            $( "body > header > ul > .photo > img" ).css( 'cursor', 'pointer' );
        }

        function handleUpdateUser() {
            return function ( event, table, id, oldRecord, newRecord ) {
                let disconnectMessage = null;

                switch ( table ) {
                    case "User":
                        switch ( event ) {
                            case "onUpdate":
                                $("body > header > ul > .photo > img")[0].src = newRecord.Picture === null ? UserRecord.DEFAULT_PICTURE().picture : newRecord.Picture;

                                if ( newRecord.EndDate !== null && newRecord.EndDate < new moment() )
                                    disconnectMessage = "MSG_DISCONNECTED";

                                break;
                            case "onDelete":
                                disconnectMessage = "MSG_DISCONNECTED";
                                break;
                        }
                        break;

                    case "Module":
                        switch ( event ) {
                            case "onUpdate":
                                // If the profile of the user changes ... notify to the user that something changes ...

                                if ( oldRecord.Profile !== newRecord.Profile ) {
                                    switch ( newRecord.Profile ) {
                                        case UserRecord.PROFILE_ADMINISTRATOR:
                                            if ( DSDatabase.Instance.Area === "Administration" )
                                                return;
        
                                            disconnectMessage = "MSG_CHANGE_PROFILE_ADMINISTRATOR";
                                            break;
                                        case UserRecord.PROFILE_SUPERVISOR:
                                        case UserRecord.PROFILE_USER:
                                        case UserRecord.PROFILE_OTHER:
                                            disconnectMessage = DSDatabase.Instance.Area === "Administration" ? "MSG_DISCONNECTED" : "MSG_CHANGE_PROFILE";
                                            break;
                                        case UserRecord.PROFILE_NONE:
                                            disconnectMessage = "MSG_DISCONNECTED";
                                            break;
                                    }
                                }

                                break;
                            case "onDelete":
                                disconnectMessage = "MSG_DISCONNECTED";
                                break;
                        }
                        break;

                    case "UserModule":
                        disconnectMessage = "MSG_DISCONNECTED";
                        break;
                }

                if ( disconnectMessage === null )
                    return;

                let messageReload = new GUI.Box.Box( "reload", "box_reload" );
                messageReload.Title = "RELOAD";
                messageReload.Message = disconnectMessage;
                messageReload.draw();
                switch ( disconnectMessage ) {
                    case "MSG_CHANGE_PROFILE_ADMINISTRATOR":
                    case "MSG_DISCONNECTED":
                        messageReload.declareButton( "Signout", "BTN_SIGNOUT", async function () {
                            await Hub.Instance.stop( true );
                            Logger.Instance.IsEnabled = false;
                            window.onbeforeunload = null;
                            window.location = URL_ROOT + "Administration/User/SignOut";
                            return true;
                        } );
                        break;
                    case "MSG_CHANGE_PROFILE":
                        messageReload.declareButton( "Reload", "BTN_RELOAD", function () {
                            window.location.reload();
                            return true;
                        } );
                        break;
                }
                messageReload.open();
            };
        }

        function handleNotification( area ) {
            return function ( event, table, tick, label, errors ) {
                if ( table !== "*" || label === null || label === undefined )
                    return;

                if ( errors !== null && errors !== undefined ) {
                    GUI.Box.Message.Error( label, errors );
                    return;
                }

                let message = Language.Manager.Instance.interpolation( label );
                area.info( "Toast: " + message );
                webix.message( String.encode( message ) );
            };
        }

        function handleEndNotification( area ) {
            return function ( event, table, tick, label ) {
                if ( label === null || label === undefined )
                    return;

                if ( Helper.IsLabel( label, true ) && !Language.Manager.Instance.existLabel( label.label ) )
                    return;

                let message = Language.Manager.Instance.interpolation( label );

                area.info( "Toast: " + message );
                webix.message( String.encode( message ) );
            };
        }

        function handleStartEvent( area, label ) {
            return function ( event, nbRequests ) {
                area._popupCommit = GUI.Box.Progress.IsOpened();

                if ( !area._popupCommit )
                {
                    GUI.Box.Progress.SetStatus( 0, nbRequests, label );
                    GUI.Box.Progress.Start( false );
                }
            };
        }

        function handleNextEvent( area ) {
            return function ( event, errors ) {
                if ( !area._popupCommit )
                    GUI.Box.Progress.SetStatus();
            };
        }

        function handleStopEvent( area ) {
            return function ( event ) {
                if ( !area._popupCommit )
                    GUI.Box.Progress.Stop();
                area._popupCommit = false;
            };
        }

        if ( currentUser !== null ) {
            DSDatabase.Instance.addEventListener( "onUpdate", "User", currentUser.Id, handleUpdateUser() );
            DSDatabase.Instance.addEventListener( "onDelete", "User", currentUser.Id, handleUpdateUser() );
        }

        if ( currentModule !== null ) {
            DSDatabase.Instance.addEventListener( "onUpdate", "Module", currentModule.Id, handleUpdateUser() );
            DSDatabase.Instance.addEventListener( "onDelete", "Module", currentModule.Id, handleUpdateUser() );
        }

        if ( currentUserModule !== null ) {
            DSDatabase.Instance.addEventListener( "onDelete", "UserModule", currentUserModule.Id, handleUpdateUser() );
        }

        // progress bar while committing data into the database

        DSDatabase.Instance.addEventListener( "onStartCommit", "*", "*", handleStartEvent( this, "MSG_COMMITTING" ) );
        DSDatabase.Instance.addEventListener( "onStartRollback", "*", "*", handleStartEvent( this, "MSG_ROLLBACKING" ) );

        DSDatabase.Instance.addEventListener( "onCommit", "*", "*", handleNextEvent( this ) );
        DSDatabase.Instance.addEventListener( "onRollback", "*", "*", handleNextEvent( this ) );

        DSDatabase.Instance.addEventListener( "onStopCommit", "*", "*", handleStopEvent( this ) );
        DSDatabase.Instance.addEventListener( "onStopRollback", "*", "*", handleStopEvent( this ) );

        DSDatabase.Instance.addEventListener( "onEndNotification", "*", "*", handleEndNotification( this ) );
        DSDatabase.Instance.addEventListener( "onNotify", "*", "*", handleNotification( this ) );

        // release notes

        Hub.Instance.addListener( this.Name, this );

        function handleReleaseNotes( area ) {
            return async function () {
                if ( !Hub.Instance.IsOnline ) {
                    GUI.Box.Message.Information( "ERR_RELEASE_NOTES" );
                    return;
                }

                await Hub.Instance.executeService( Area.SERVICE_RELEASE_NOTES, null, null, false ).then( ( data ) => {
                    if ( data.Error !== null && data.Error !== undefined ) {
                        let errors = new Errors();
                        errors.setJSON( data.Error );
                        GUI.Box.Message.Error( "ERROR", errors );
                        return;
                    }
                } );
            };
        }

        $( "body > footer > .release" ).click( handleReleaseNotes( this ) );
        $( "body > footer > .company" ).click( function () { window.open( "http://www.concilium-lesert.fr", "_blank" ); } );

        // On change module

        function handleChangeModule( area ) {
            return function () {
                function handleNewModule(module) {
                    return async function () {
                        async function handleSignOut() {
                            await Hub.Instance.stop( true );
                            Logger.Instance.IsEnabled = false;
                            window.onbeforeunload = null;
                            window.location = URL_ROOT + ModuleRecord.GetModuleName( module ) + "/" + ModuleRecord.GetModuleName( module ) + "/Index?moduleId=" + DSDatabase.Instance.getServerIdByClientId("Module", module.Id);
                            return true;
                        }

                        if ( DSDatabase.Instance.IsEmpty )
                            return await handleSignOut();

                        GUI.Box.Message.Message( "TITLE_EXIT", "MSG_CONFIRMATION_CANCEL", handleSignOut );
                    };
                }

                let currentUser = DSDatabase.Instance.CurrentUser;
                let currentModule = DSDatabase.Instance.CurrentModule;
                let choiceModules = [];

                if ( currentUser !== null && currentUser !== undefined ) {
                    let modules = [];

                    // Select the list of modules attached to the current user expected the current module

                    for ( let currentUserModule of Array.toIterable( currentUser.Modules ) ) {
                        let module = currentUserModule.Module;
                        if ( module === null || module === undefined || module.Id === currentModule.Id || !module.Enable )
                            continue;
                        modules.push( module );
                    }

                    // Sort modules by Id

                    modules.sort( function ( m1, m2 ) {
                        if ( m1.Module < m2.Module )
                            return -1;
                        if ( m1.Module > m2.Module )
                            return 1;
                        return 0;
                    } );

                    // Build buttons

                    for ( let userModule of modules )
                        choiceModules.push( { label: userModule.Name, fn: handleNewModule( userModule ) } );
                }

                if ( choiceModules.length > 0 )
                    GUI.Box.BoxChoice.BoxChoices( "TITLE_MODULE", null, choiceModules );
            };
        }

        function handleUpdateModule( area ) {
            return function () {
                let currentUser = (new UserRecord.List()).getItem(DSDatabase.Instance.CurrentUser.Id);
                let nbClickable = 0;

                if ( currentUser !== null && currentUser !== undefined ) {
                    let listModules = new ModuleRecord.List();

                    for ( let currentUserModule of Array.toIterable( currentUser.Modules ) ) {
                        let currentModule = listModules.getItem( currentUserModule.ModuleId );
                        if ( currentModule === null || currentModule === undefined )
                            continue;

                        if ( currentModule.Enable )
                            nbClickable++;
                    }
                }

                $( "body > header > ul > .area.screen_name" ).css( 'cursor', nbClickable > 1 ? 'pointer' : 'initial' );
            };
        }

        $( "body > header > ul > .area.screen_name" ).click( handleChangeModule( this ) );

        DSDatabase.Instance.addEventListener( "onCreate", "UserModule", "*", handleUpdateModule() );
        DSDatabase.Instance.addEventListener( "onUpdate", "UserModule", "*", handleUpdateModule() );
        DSDatabase.Instance.addEventListener( "onDelete", "UserModule", "*", handleUpdateModule() );
        DSDatabase.Instance.addEventListener( "onLoad", "UserModule", "*", handleUpdateModule() );

        DSDatabase.Instance.addEventListener( "onCreate", "Module", "*", handleUpdateModule() );
        DSDatabase.Instance.addEventListener( "onUpdate", "Module", "*", handleUpdateModule() );
        DSDatabase.Instance.addEventListener( "onDelete", "Module", "*", handleUpdateModule() );
        DSDatabase.Instance.addEventListener( "onLoad", "Module", "*", handleUpdateModule() );

        handleUpdateModule( this )();
    }

    /**
     * Abstract method to launch a feature on depends on parameters of the page
     * @param {any} parameters parameters of the calling application (useful to start the application on a given part - ex: show input or output)
     */
    startApplication ( parameters ) {
        this.info( "Parameters : " + String.JSONStringify( parameters ) );
    }

    /**
     * Abstract method to draw the sheets and boards for the module
     * @param {any} container zone having the main screen
     */
    drawSheets( container ) {

    }

    /**
     * Abstract method to draw and intializing all data into the screen
     */
    async draw() {
        super.draw( null );

        let treatment = [];

        this.drawSheets( this._container, treatment );

        // Build all boards to include into the application

        function* buildGeneratorTreatment( treatment ) {
            yield GUI.Box.Progress.Status( 0, treatment.length, "MSG_SCREEN_BUILDING" );

            for ( let buildScreen of treatment ) {
                try {
                    buildScreen();
                } catch ( e ) {
                    Logger.Instance.exception( "Area", "Exception on building a screen", e );
                }
                yield GUI.Box.Progress.Status();
            }
        }

        await GUI.Box.Progress.Thread( buildGeneratorTreatment( treatment ), 1, true, true );
    }

    /**
     * Abstract method on opening the screen
     */
    async onOpen() {
        function handleFilters( area ) {
            return function () {
                for ( let filter of area._filters ) {
                    filter.field.onOpen();
                    filter.field.refresh();
                }
            };
        }

        super.onOpen();

        if ( this._firstMenu === null ) {
            handleFilters( area )();
            return;
        }

        await this.onMenu( this._firstMenu ).then( handleFilters( this ) );
    }

    /**
     * Constructor
     * @param {any} area  area name
     * @param {any} title title of the screen
     * @param {any} moduleId module id - reference to send to the server on initialization
     */
    constructor( area, title, moduleId ) {
        super( "area", "body > main", area );

        this._link = null;
        this._title = null;
        this._element = null;
        this._firstLoad = true;
        this._moduleId = moduleId === null || moduleId === undefined ? -1 : moduleId;
        this._popupCommit = false;

        // Handle the list of boards

        this._boards = {};

        // Handle menu and show the sheet corresponding to the menu

        this._firstMenu = null;
        this._menu = {};
        this._currentMenu = null;
        this._currentSubMenu = null;

        // Handle the list of filters

        this._filters = [];

        this.setTitle( title );
    }
}
