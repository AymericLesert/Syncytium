/// <reference path="../_references.js" />

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
        let protocol = 'http';
        if ( window.location.href.startsWith( 'http://localhost' ) )
            protocol = 'https';
        else
            protocol = window.location.href.split( ':' )[0];
        return  protocol + "://www.syncytium.fr/wiki/index.php/utilisation/";
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
                    window.open( area._link, "_blank" );

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

        for ( var board in this._boards )
            this._boards[board].destructor();

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
     * @param {any} menu   identity of the menu to add
     * @param {any} title  label of the menu
     * @param {any} filter key allowing to show or not this menu on depends on a key
     * @returns {any} the menu item corresponding to this declaration
     */
    declareMenu ( menu, title, filter ) {
        function handleOnMenu( area, menu ) { return function () { area.onMenu( menu ); }; }

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
                var mousex = e.pageX + 10;
                var mousey = e.pageY;
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
                sheet: null
            };

            var zoneMenu = $( "<li class='button' id='" + menu + "'></li>" );
            $( Area.ROOT_MENU + " li.spaceall" ).before( zoneMenu );

            zoneMenu.hover( handleHover( menu, this._menu[menu].title ), handleOut ( menu ) ).mousemove( handleMove ( menu ));
            zoneMenu.click( handleOnMenu( this, menu ) );

            this._menu[menu].sheet = $( "<sheet class='" + menu + "'></sheet>" );
            this._menu[menu].sheet.hide();
            $( "body > main" ).append( this._menu[menu].sheet );

            Language.Manager.Instance.addComponent( this._menu[menu].sheet );
        }

        return this._menu[menu];
    }

    /**
     * Declare a submenu
     * @param {any} menu    identity of the menu concerned by the declaration
     * @param {any} submenu identity of the submenu
     * @param {any} title   label of the sub menu
     * @param {any} filter  key allowing to show or not this sub menu on depends on a key
     * @returns {any} the menu item corresponding to this declaration
     */
    declareSubMenu ( menu, submenu, title, filter ) {
        function handleOnMenu( area, menu, submenu ) { return function () { area.onMenu( menu, submenu ); }; }

        var item = this._menu[menu];
        if ( item === null || item === undefined )
            return null;

        if ( item.menu[submenu] === null || item.menu[submenu] === undefined ) {
            this.info( "Declaring sub menu ('" + menu + "', '" + submenu + "', '" + title + "') ..." );

            item.menu[submenu] = {
                id: submenu,
                title: Helper.Label( title ),
                filter: filter === undefined ? null : filter,
                boards: [],
                functions: []
            };
            item.orderMenu.push( item.menu[submenu] );

            if ( item.current === null )
                item.current = submenu;

            $( Area.ROOT_MENU + "#" + menu + "_" + submenu ).click( handleOnMenu( this, menu, submenu ) );
        }

        return item.menu[submenu];
    }

    /**
     * Retrieve the menu by its name
     * @param {any} menu menu name
     * @returns {any} menu description
     */
    getMenu( menu ) {
        var item = this._menu[menu];
        return item === null || item === undefined ? null : item;
    }

    /**
     * Virtual method on selecting a menu (specification of treatment due to the selection of the menu)
     * @param {any} menu    identity of the menu selected by the user
     * @param {any} submenu identity of the submenu selected by the user
     */
    onSelectingMenu ( menu, submenu ) {
    }

    /**
     * Select a menu
     * @param {any}     menu    identity of the menu selected by the user
     * @param {any}     submenu identity of the submenu selected by the user
     * @param {boolean} force   true if the menu must be checked
     */
    onMenu ( menu, submenu, force ) {
        var closeProgress = false;
        var item = this._menu[menu];
        var i = null;
        var board = null;

        if ( item === null || item === undefined )
            return;

        menu = menu === null || menu === undefined ? null : menu;
        submenu = submenu === null || submenu === undefined ? null : submenu;

        this.info( "Select menu '" + ( menu === null ? "null" : menu ) + "', '" + ( submenu === null ? "null" : submenu ) + "'" );

        if ( (force === null || force === undefined || force === false) && this._currentMenu === menu && this._currentSubMenu === submenu )
            return;

        if ( submenu === null && item.boards.length === 0 && item.current !== null )
            submenu = item.current;
        else if ( submenu === null && item.boards.length === 0 ) {
            for ( i in item.menu ) {
                submenu = i;
                break;
            }
        }

        if ( !$( "body > .progress" ).is( ':visible' ) ) {
            this.onStartProgress();
            this.progressStatus( 0, 1, "MSG_REFRESHING" );
            closeProgress = true;
        }

        // hide all screens

        for ( let id in this._menu ) {
            let currentItem = this._menu[id];
            if ( currentItem === null || currentItem === undefined )
                continue;

            for ( i in currentItem.boards ) {
                board = currentItem.boards[i];
                if ( board === null || board === undefined )
                    continue;

                board.hide();
            }

            if ( $( Area.ROOT_MENU + "#" + id ).hasClass( 'selected' ) )
                $( Area.ROOT_MENU + "#" + id ).removeClass( 'selected' );
            $( Area.ROOT_MENU + "#" + id ).prop( 'disabled', false );

            currentItem.sheet.remove();

            for ( let subId in currentItem.menu ) {
                let currentSubItem = currentItem.menu[subId];
                if ( currentSubItem === null || currentSubItem === undefined )
                    continue;

                for ( i in currentSubItem.boards ) {
                    board = currentSubItem.boards[i];
                    if ( board === null || board === undefined )
                        continue;

                    board.hide();
                }

                if ( $( Area.ROOT_MENU + "#" + id ).hasClass( subId ) )
                    $( Area.ROOT_MENU + "#" + id ).removeClass( subId );
                $( Area.ROOT_MENU + "#" + id + "_" + subId ).prop( 'disabled', true );

                $( Area.ROOT_MENU + "#" + id + "_" + subId ).hide();
            }
        }

        // show the right screen

        for ( let id in this._menu ) {
            let currentItem = this._menu[id];
            if ( currentItem === null || currentItem === undefined )
                continue;

            if ( id === menu ) {
                if ( !$( Area.ROOT_MENU + "#" + id ).hasClass( 'selected' ) )
                    $( Area.ROOT_MENU + "#" + id ).addClass( 'selected' );
                $( Area.ROOT_MENU + "#" + id ).prop( 'disabled', true );
            }

            var sheetShow = false;

            for ( var subId in currentItem.menu ) {
                let currentSubItem = currentItem.menu[subId];
                if ( currentSubItem === null || currentSubItem === undefined )
                    continue;

                if ( id === menu && subId === submenu ) {
                    if ( !$( Area.ROOT_MENU + "#" + id ).hasClass( subId ) )
                        $( Area.ROOT_MENU + "#" + id ).addClass( subId );
                    $( Area.ROOT_MENU + "#" + id + "_" + subId ).prop( 'disabled', true );

                    if ( $( "main > sheet." + id + "_" + subId ).length > 0 )
                        $( "main > sheet." + id + "_" + subId ).show();
                    else if ( currentItem.sheet.length > 0 ) {
                        currentItem.sheet.show();
                        $( "body > main" ).append( currentItem.sheet );
                    }

                    for ( i in currentSubItem.boards ) {
                        board = currentSubItem.boards[i];
                        if ( board === null || board === undefined )
                            continue;

                        board.show();
                    }

                    sheetShow = true;
                }

                if ( id === menu )
                    $( Area.ROOT_MENU + "#" + id + "_" + subId ).show();
            }

            if ( !sheetShow && id === menu ) {
                currentItem.sheet.show();
                $( "body > main" ).append( currentItem.sheet );

                for ( i in currentItem.boards ) {
                    board = currentItem.boards[i];
                    if ( board === null || board === undefined )
                        continue;

                    board.show();
                }
            }
        }

        this.onSelectingMenu( menu, submenu );

        this._currentMenu = menu;
        this._currentSubMenu = submenu;
        item.current = submenu;

        if ( closeProgress )
            this.onStopProgress();
    }

    /**
     * Show the list of sub menus and select one
     */
    selectSubMenu () {
        function handleSelectSubMenu( area, menu, submenu, item ) {
            return function () {
                if ( item.functions !== null && item.functions !== undefined ) {
                    for ( var i in item.functions ) {
                        try {
                            item.functions[i]( menu, submenu );
                        } catch ( e ) {
                            area.exception( "Unable to execute a function for the menu ('" + ( menu === null ? "null" : menu ) + "', '" + ( submenu === null ? "null" : submenu ) + "')", e );
                        }
                    }
                }

                if ( item.boards.length > 0 )
                    area.onMenu( menu, submenu );
            };
        }

        var item = this.menu[this._currentMenu];
        if ( item === null || item === undefined )
            return;

        if ( $.isEmptyObject( item.menu ) )
            return;

        var choices = [];

        for ( var subId = 0; subId < item.orderMenu.length; subId++ ) {
            var submenu = item.orderMenu[subId];
            if ( submenu === null || submenu === undefined )
                continue;

            choices.push( { label: submenu.title, fn: handleSelectSubMenu( this, this._currentMenu, submenu.id, submenu ) } );
        }

        if ( choices.length === 0 )
            return;

        GUI.Box.BoxChoices( item.title, null, choices );
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
                    // No multidictionary ready ... 
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
            var htmlParameter = window.location.search.substr( 1 );
            if ( htmlParameter === null || htmlParameter === "" ) {
                this.startApplication( {} );
                return;
            }

            var parameters = {};
            var parametersArray = htmlParameter.split( "&" );
            for ( var i = 0; i < parametersArray.length; i++ ) {
                var parameter = parametersArray[i].split( "=" );
                parameters[parameter[0]] = parameter[1];
            }

            this.startApplication( parameters );
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
    onLoadedData () {
        if ( !this._firstLoad )
            return;
        this._firstLoad = false;

        this.info( "Data are loaded. So, building the screen ..." );

        // initialize Language.Manager.Instance within data from database

        Language.Manager.Instance.initialize( DSDatabase.Instance );

        // show the user's picture

        var currentUser = DSDatabase.Instance.CurrentUser;
        var currentModule = DSDatabase.Instance.CurrentModule;
        var currentUserModule = null;
        DSDatabase.Instance.each( "UserModule", function ( record ) {
            if ( record.UserId === currentUser.Id && record.ModuleId === currentModule.Id && !record._deleted )
                currentUserModule = record;
        } );

        $("body > header > ul > .photo > img")[0].src = currentUser === null || currentUser.Picture === null ? UserRecord.DEFAULT_PICTURE().picture : currentUser.Picture;

        $( "body > header > ul > .photo" ).hover( function () {
            var currentUser = DSDatabase.Instance.CurrentUser;

            var currentUserName = "";
            if ( currentUser !== null && currentUser.Name !== "" )
                currentUserName = currentUser.Name;
            else if ( currentUser !== null && currentUser.Login !== "" )
                currentUserName = currentUser.Login;

            $( '<p class="image webix_tooltip"></p>' ).html( currentUserName ).appendTo( 'body' ).fadeIn( 'slow' );
        }, function () {
            $( '.image.webix_tooltip' ).remove();
        } ).mousemove( function ( e ) {
            var mousex = e.pageX - 10 - $( '.image.webix_tooltip' ).width();
            var mousey = e.pageY;
            $( '.image.webix_tooltip' ).css( { top: mousey, left: mousex } );
        } );

        // Write different screens before showing the main screen

        $( Language.Manager.LANGUAGE_ROOT + "#" + DSDatabase.Instance.CurrentLanguage ).html( "<span>" + DSDatabase.Instance.CurrentLanguage + "</span>" );
        webix.i18n.setLocale( DSDatabase.Instance.CurrentLanguage );
        Locale.setLanguage( DSDatabase.Instance.CurrentLanguage );

        this.draw();
        this.progressStatus();

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
                var disconnectMessage = null;

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

                var messageReload = new GUI.Box.Box( "reload", "box_reload" );
                messageReload.Title = "RELOAD";
                messageReload.Message = disconnectMessage;
                messageReload.draw();
                switch ( disconnectMessage ) {
                    case "MSG_CHANGE_PROFILE_ADMINISTRATOR":
                    case "MSG_DISCONNECTED":
                        messageReload.declareButton( "Signout", "BTN_SIGNOUT", function () {
                            Hub.Instance.stop( true );
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

        function handleBeginNotification( area ) {
            return function ( event, table, tick, label ) {
                if ( label === null || label === undefined )
                    return;

                if ( Helper.IsLabel( label, true ) && !Language.Manager.Instance.existLabel( label.label ) )
                    return;

                var message = Language.Manager.Instance.interpolation( label );

                area.info( "Toast: " + message );
                webix.message( String.encode( message ) );
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

                var message = Language.Manager.Instance.interpolation( label );
                area.info( "Toast: " + message );
                webix.message( String.encode( message ) );
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

        DSDatabase.Instance.addEventListener( "onStartCommit", "*", "*", function ( event, nbRequests ) {
            GUI.Box.Progress.SetStatus( 0, nbRequests, "MSG_COMMITTING" );
            GUI.Box.Progress.Start();
        } );

        DSDatabase.Instance.addEventListener( "onCommit", "*", "*", function ( event, nbRequests ) {
            GUI.Box.Progress.SetStatus();
        } );

        DSDatabase.Instance.addEventListener( "onStopCommit", "*", "*", function ( event, nbRequests ) {
            GUI.Box.Progress.Stop();
        } );

        DSDatabase.Instance.addEventListener( "onBeginNotification", "*", "*", handleBeginNotification( this ) );
        DSDatabase.Instance.addEventListener( "onNotify", "*", "*", handleNotification( this ) );

        // release notes

        function handleOpenReleaseNotes( area ) {
            return function ( data ) {
                if ( data.Error !== null && data.Error !== undefined ) {
                    var errors = new Errors();
                    errors.setJSON( data.Error );
                    GUI.Box.Message.Error( "ERROR", errors );
                    return;
                }

                GUI.Box.BoxReleaseNotes.Open( data.Result );
            };
        } 

        function handleReleaseNotes( area, fnOpen, fnError ) {
            return function () {
                if ( !Hub.Instance.IsOnline ) {
                    GUI.Box.Message.Information( "ERR_RELEASE_NOTES" );
                    return;
                }

                Hub.Instance.executeService( Area.SERVICE_RELEASE_NOTES, null, null, fnOpen );
            };
        }

        $( "body > footer > .release" ).click( handleReleaseNotes( this, handleOpenReleaseNotes( this ) ) );
        $( "body > footer > .company" ).click( function () { window.open( "http://www.concilium-lesert.fr", "_blank" ); } );

        // select another module

        function handleChangeModule( area ) {
            return function () {
                function handleNewModule(module) {
                    return function () {
                        function handleSignOut() {
                            Hub.Instance.stop( true );
                            Logger.Instance.IsEnabled = false;
                            window.onbeforeunload = null;
                            window.location = URL_ROOT + ModuleRecord.GetModuleName( module ) + "/" + ModuleRecord.GetModuleName( module ) + "/Index?moduleId=" + DSDatabase.Instance.getServerIdByClientId("Module", module.Id);
                            return true;
                        }

                        if ( DSDatabase.Instance.IsEmpty )
                            return handleSignOut();

                        GUI.Box.Message.Message( "TITLE_EXIT", "MSG_CONFIRMATION_CANCEL", handleSignOut );
                    };
                }

                let currentUser = DSDatabase.Instance.CurrentUser;
                let currentModule = DSDatabase.Instance.CurrentModule;
                let choiceModules = [];

                if ( currentUser !== null && currentUser !== undefined ) {
                    let modules = currentUser.Modules;
                    let listModules = new ModuleRecord.List();

                    for ( var userModuleId in modules ) {
                        let currentUserModule = modules[userModuleId];
                        if ( currentUserModule === null || currentUserModule === undefined )
                            continue;

                        let module = listModules.getItem( currentUserModule.ModuleId );
                        if ( module === null || module === undefined || module.Id == currentModule.Id || !module.Enable )
                            continue;

                        choiceModules.push( { label: listModules.getText(module), fn: handleNewModule(module) } );
                    }
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
                    let modules = currentUser.Modules;
                    let listModules = new ModuleRecord.List();

                    for ( var userModuleId in modules ) {
                        let currentUserModule = modules[userModuleId];
                        if ( currentUserModule === null || currentUserModule === undefined )
                            continue;

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
    draw() {
        super.draw( null );

        var treatment = [];

        this.drawSheets( this._container, treatment );

        // Build all boards to include into the application

        this.progressStatus( 0, treatment.length + 1, "MSG_INITIALIZING" );

        for ( var i = 0; i < treatment.length; i++ ) {
            treatment[i]();
            this.progressStatus();
        }

        $( "body > main > sheet > buttons > #submit" ).html( Helper.Span( "BTN_SUBMIT" ) );
        $( "body > main > sheet > buttons > #cancel" ).html( Helper.Span( "BTN_CANCEL" ) );
    }

    /**
     * Abstract method on opening the screen
     */
    onOpen () {
        super.onOpen();

        if ( this._firstMenu !== null )
            this.onMenu( this._firstMenu );
    }

    /**
     * Method on refreshing the screen
     */
    refresh () {
        var nbBoards = 0;

        var item = this._menu[this._currentMenu];
        var subitem = null;
        var board = null;
        var i = 0;

        GUI.Box.Progress.Start();

        if ( item !== null && item !== undefined ) {
            nbBoards += item.boards.length;

            subitem = item.menu[this._currentSubMenu];
            if ( subitem !== null && subitem !== undefined )
                nbBoards += subitem.boards.length;
        }

        GUI.Box.Progress.SetStatus( 0, nbBoards + 1, "MSG_REFRESHING" );

        GUI.Box.Progress.SetStatus();

        if ( item !== null && item !== undefined ) {
            for ( i in item.boards ) {
                board = item.boards[i];
                if ( board === null || board === undefined )
                    continue;

                board.refresh();
                board.populateWebix();
                board.adjustWebix();
                GUI.Box.Progress.SetStatus();
            }

            subitem = item.menu[this._currentSubMenu];
            if ( subitem !== null && subitem !== undefined ) {
                for ( i in subitem.boards ) {
                    board = subitem.boards[i];
                    if ( board === null || board === undefined )
                        continue;

                    board.refresh();
                    board.populateWebix();
                    board.adjustWebix();
                    GUI.Box.Progress.SetStatus();
                }
            }
        }

        GUI.Box.Progress.Stop();
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

        // Handle the list of boards

        this._boards = {};

        // Handle menu and show the sheet corresponding to the menu

        this._firstMenu = null;
        this._menu = {};
        this._currentMenu = null;
        this._currentSubMenu = null;

        this.setTitle( title );
    }
}
