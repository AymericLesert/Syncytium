/// <reference path="../../_references.js" />

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
 * Generic class of a social network (Thread)
 */
GUI.Board.BoardSocialNetwork = class extends GUI.Board.Board {
    /**
     * Build the histories values on depends on a given record within History subList
     * @param {any} item item to show
     */
    set Item( item ) {
        this.List.Item = item;
    }

    /**
     * @returns {any} item to show
     */
    get Item() {
        return this.List.Item;
    }

    /**
     * Build a HTML component of the comment
     * @param {any} comment
     * @param {any} id defined to replace the comment Id
     * @returns {string} HTML component
     */
    buildComment( comment, id ) {
        let key = id !== undefined ? id : this.List.getId( comment );

        let text = '';
        for ( let value of comment.Comment.split( '\n' ) )
            text += ( text === '' ? '' : '<br />' ) + String.encode( value );

        let line = '';
        if ( comment.AuthorId === DSDatabase.Instance.CurrentUser.Id ) {
            line = "<div class='empty'></div><div class='comment me'>" + text + "</div><div class='delete' id='" + key + "'></div>";
        } else {
            List.ListRecord.SetExtendedFields( this.List, comment );
            let picture = comment.Author === null || comment.Author.Picture === null ? UserRecord.DEFAULT_PICTURE().picture : comment.Author.Picture;
            let name = comment.Author === null ? '' : String.encode( comment.Author.Name );
            let deleteIcon = UserRecord.IsAdministrator() ? "<div class='delete' id='" + key + "'></div>" : '';

            line = "<div class='picture' name='" + name + "'><img src='" + picture + "'></div>" +
                "<div class='comment'>" + text + "</div>" +
                deleteIcon +
                "<div class='empty'></div>";
        }

        return "<div id='" + key + "'><div class='date'>" + comment.Date.format( "dddd D MMMM YYYY HH:mm:ss") + "</div><div class='message'>" + line + "</div></div>";
    }

    /**
     * @param {any} container reference on the container having the webix component
     */
    drawWebix( container ) {
        container.append( '<div id="author">' +
                            '<div id="picture"><img></div>' +
                            '<div id="name"></div>' +
                          '</div>' + 
                          '<div id="comments"></div>' +
                          '<div id="message">' +
                            '<textarea id="text"></textarea>' +
                            '<div id="ok"></div>' +
                          '</div>' );
        return null;
    }

    /**
     * Method to refresh the table
     */
    refresh() {
        super.refresh();

        if ( this.Component === null )
            return;

        let currentUser = DSDatabase.Instance.CurrentUser;

        this.Component.find( "#author > #picture > img" )[0].src = currentUser === null || currentUser.Picture === null ? UserRecord.DEFAULT_PICTURE().picture : currentUser.Picture;
        this.Component.find( "#author > #name" ).html( String.encode( currentUser.Name ) );
        this.Component.find( "#message > #ok" ).html( Helper.Span( "BTN_OK" ) );

        if ( this.Box !== null && this.Box !== undefined && this.Box.Mode === GUI.Box.BoxRecord.MODE_DELETE ) {
            this.Component.find( "#message" ).hide();
        } else {
            this.Component.find( "#message" ).show();
        }
    }

    /**
     * Update events and actions on discussion
     */
    refreshDiscussion() {
        function handleDelete( board ) {
            return async function () {
                let id = $( this ).attr( 'id' );

                GUI.Box.Message.Message(
                    board._title,
                    "MSG_CONFIRMATION_DELETE",
                    async () => {
                        if ( id < 0 ) {
                            // Store comment into a queue if the item is new ... because it doesn't yet exist
                            let index = -id - 2;
                            let item = GUI.Board.BoardSocialNetwork.Queue[board._table][index][1];
                            GUI.Board.BoardSocialNetwork.Queue[board._table].splice( index, 1 );
                            board.List.raise( 'onDelete', board.List.Table, id, item );
                        } else {
                            // Remove the message into the database

                            let item = board.List.getItem( id );
                            if ( item === null || item === undefined )
                                return;

                            DSDatabase.Instance.deleteFromClient( board.List.Table, item, new Errors() );
                            await DSDatabase.Instance.commit();
                        }
                    } );
            };
        }

        // Update the scroll bar

        this.Component.find( "#comments" ).scrollTop( this.Component.find( "#comments" )[0].scrollHeight );

        // Handle the name of user

        this.Component.find( "#comments .message > .picture" ).hover( function () {
            $( '<p class="image webix_tooltip"></p>' ).html( $( this ).attr( 'name' ) ).appendTo( 'body' ).fadeIn( 'slow' );
        }, function () {
            $( '.image.webix_tooltip' ).remove();
        } ).mousemove( function ( e ) {
            let mousex = e.pageX - 10 - $( '.image.webix_tooltip' ).width();
            let mousey = e.pageY;
            $( '.image.webix_tooltip' ).css( { top: mousey, left: mousex } );
        } );

        // Handle delete message

        this.Component.find( "#comments .message .delete" ).off( 'click' ).on( 'click', handleDelete( this ) );
    }

    /**
     * Abstract method to populate the comments
     */
    async populateWebix() {
        await super.populateWebix();

        // Read the content of the table and push the content into the component

        let comments = [];
        if ( this.Item !== null && this.Item !== undefined &&
            this.Item._subLists !== null && this.Item._subLists !== undefined &&
            this.Item._subLists["Comments"] !== null && this.Item._subLists["Comments"] !== undefined ) {
            // First, retrieve cache data

            let list = List.ListRecord.CACHE_LIST( this._table );
            let key = list.getKey( this.Item );

            let id = -2;
            for ( let comment of GUI.Board.BoardSocialNetwork.Queue[this._table] ) {
                if ( comment[0] === key )
                    comments.push( [comment[1], id] );
                id--;
            }

            // Second, add database content

            this.Item._subLists["Comments"].values = null;
            for ( let comment of Array.toIterable( this.Item.Comments ) )
                comments.push( [comment, this.Item._subLists["Comments"].list.getId( comment )] );
        }

        comments.sort( ( comment1, comment2 ) => Dates.Compare( comment1[0].Date, comment2[0].Date ) );

        // Build the comments

        this.Component.find( "#comments" ).empty();

        let newComponents = "";
        for ( let comment of comments )
            newComponents += this.buildComment( comment[0], comment[1] );

        this.Component.find( "#comments" ).append( newComponents );

        // Refresh actions

        this.refreshDiscussion();
    }

    /**
     * Method adding a new row into the webix object
     * @param {any} event  event name
     * @param {any} table  table name
     * @param {any} id     id of the record added
     * @param {any} record record added
     */
    addRow( event, table, id, record ) {
        if ( this.IsDebug )
            this.debug( "Add comment (table = '" + table + "', id = " + id + ", record = " + String.JSONStringify( record ) + ")" );

        // Add a new comment

        this.Component.find( "#comments" ).append( this.buildComment( record, id ) );

        // Refresh actions

        this.refreshDiscussion();
    }

    /**
     * Method deleting a row into the webix object
     * @param {any} event  event name
     * @param {any} table  table name
     * @param {any} id     id of the record deleted
     * @param {any} record record deleted
     */
    deleteRow( event, table, id, record ) {
        if ( this.IsDebug )
            this.debug( "Delete comment (table = '" + table + "', id = " + id + ", record = " + String.JSONStringify( record ) + ")" );

        // Delete an existing comment

        this.Component.find( "#comments > #" + id ).remove();

        // Refresh actions

        this.refreshDiscussion();
    }

    /**
     * Called on onOpenning the field
     */
    onOpen() {
        function handleFocus( board ) {
            return function () {
                if ( board.Readonly )
                    return;

                if ( board.Box !== null )
                    board.Box.setFocus( board );
            };
        }

        function handleKeydown( board ) {
            return function ( event ) {
                switch ( event.key ) {
                    case "Tab":
                        event.stopImmediatePropagation();
                        if ( event.shiftKey )
                            board.previousFocus();
                        else
                            board.nextFocus();
                        return false;

                    case "Enter":
                        event.stopImmediatePropagation();
                        return true;

                    case "Escape":
                        event.stopImmediatePropagation();
                        return false;
                }
            };
        }

        function handleClick( board ) {
            return async function ( event ) {
                let comment = String.decode( board.Component.find( "#message > #text" ).val() );

                if ( String.isEmptyOrWhiteSpaces( comment ) )
                    return;

                // Add message into the database

                let newComment = board.List.NewItem;
                newComment[board._table + "Id"] = board.List.getId( board.Item );
                newComment.Date = new moment();
                newComment.AuthorId = DSDatabase.Instance.CurrentUser.Id;
                newComment.Comment = comment;

                if ( board.List.getId( board.Item ) < 0 ) {
                    // Store comment into a queue if the item is new ... because it doesn't yet exist

                    let list = List.ListRecord.CACHE_LIST( board._table );
                    if ( list === null )
                        return;

                    GUI.Board.BoardSocialNetwork.Queue[board._table].push( [list.getKey( board.Item ), newComment] );
                    board.List.raise( 'onCreate', board.List.Table, -GUI.Board.BoardSocialNetwork.Queue[board._table].length - 1, newComment );
                } else {
                    // Push the message into the database

                    DSDatabase.Instance.addFromClient( board.List.Table, newComment, new Errors() );
                    await DSDatabase.Instance.commit();
                }

                board.Component.find( "#message > #text" ).val( "" );
            };
        }

        /*
         * UUpdating the queue of messages if needed
         */
        function handleOnCreateDB( board ) {
            return async function ( event, table, id, record ) {
                if ( GUI.Board.BoardSocialNetwork.Queue === undefined ||
                    GUI.Board.BoardSocialNetwork.Queue[table] === undefined ||
                    Array.isEmpty( GUI.Board.BoardSocialNetwork.Queue[table] ) )
                    return;

                // add comments into the database

                let list = List.ListRecord.CACHE_LIST( table );
                if ( list === null )
                    return;

                List.ListRecord.SetExtendedFields( list, record );
                let key = list.getKey( record );

                // retrieve the list of comments depending on the record

                let comments = GUI.Board.BoardSocialNetwork.Queue[table];
                let oldComments = [];

                for ( let comment of comments ) {
                    if ( comment[0] === key ) {
                        let errors = new Errors();
                        comment[1][board._table + "Id"] = id;
                        DSDatabase.Instance.addFromClient( board.List.Table, comment[1], errors );
                        if ( errors.HasError )
                            board.warn( errors.toString() );
                    } else {
                        oldComments.push( comment );
                    }
                }

                GUI.Board.BoardSocialNetwork.Queue[table] = oldComments;

                await DSDatabase.Instance.commit();
            };
        }

        /*
         * Adding a new item into the list
         */
        function handleOnCreate( board ) {
            return function ( event, table, id, record ) {
                if ( record[board._table + "Id"] !== board.List.getId( board.Item ) )
                    return;

                board.addRow( event, table, id, record );
            };
        }

        /*
         * Deletion of an item
         */
        function handleOnDelete( board ) {
            return function ( event, table, id, record ) {
                if ( record[board._table + "Id"] !== board.List.getId( board.Item ) )
                    return;

                board.deleteRow( event, table, id, record );
            };
        }

        /*
         * Loading the list
         */
        function handleOnLoad( board ) {
            return async function ( event, table ) {
                board.refresh();
                await board.populateWebix();
                await board.adjustWebix();
            };
        }

        super.onOpen();

        this.Component.find( "#message > #text" ).on( 'focus', handleFocus( this ) );
        this.Component.find( "#message > #text" ).on( 'keydown', handleKeydown( this ) );
        this.Component.find( "#message > #ok" ).on( 'click', handleClick( this ) );

        if ( GUI.Board.BoardSocialNetwork.Queue[this._table] === undefined ) {
            GUI.Board.BoardSocialNetwork.Queue[this._table] = [];
            DSDatabase.Instance.addEventListener( "onCreate", this._table, "*", handleOnCreateDB( this ) );
        }

        this.List.on( "onCreate", handleOnCreate( this ) );
        this.List.on( "onDelete", handleOnDelete( this ) );
        this.List.on( "onLoad", handleOnLoad( this ) );

        this.List.onOpen();
    }

    /**
     * Called on onClosing the field
     */
    onClose() {
        super.onClose();

        this.Component.find( "#comments .message .delete" ).off( 'click' );
        this.Component.find( "#message > #text" ).off( 'focus keydown' );
        this.Component.find( "#message > #ok" ).off( 'click' );

        this.List.unbind( "onCreate" );
        this.List.unbind( "onDelete" );
        this.List.unbind( "onLoad" );

        this.List.onClose();
    }

    /**
     * Constructor
     * @param {any} box      string describing the html container, an html object or a GUI.Box
     * @param {string} name  identify the board
     * @param {string} title string describing the title of the table (using Helper.Span)
     * @param {string} table name of the table attached to the social network
     */
    constructor( box, name, title, table ) {
        super( box, name, "board_social_network", title, new List.ListRecord( "Comment" + table ), GUI.Board.BOARD_NONE );

        this.draw();

        this.Component.addClass( "socialnetwork" );

        this._table = table;

        if ( GUI.Board.BoardSocialNetwork.Queue === undefined )
            GUI.Board.BoardSocialNetwork.Queue = {};
    }
};
