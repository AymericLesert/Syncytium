/// <reference path="../../../_references.js" />
/// <reference path="Enum.js" />
/// <reference path="List.js" />

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
 * Class handling a board of languages
 */
Language.Board = class extends GUI.Board.BoardTable {
    /**
     * @param {string} value value to filter (on Type, Description or CodeEBP)
     */
    set FilterField( value ) {
        this.List.FilterField = value;
    }

    /**
     * Define the list of columns into the table
     */
    declareColumns () {
        function handleChangeValue( board ) {
            return function ( id, item, attribute ) {
                function onCheckValue( language ) {
                    return async function ( newValue ) {
                        let oldRecord = board.List.getItem( id, true );
                        if ( oldRecord === null )
                            return;

                        let newRecord = DSRecord.Clone( oldRecord );

                        // Update the field

                        newRecord[language] = newValue;

                        // notify the database that something has changed

                        await board.updateItem( oldRecord, newRecord );
                    };
                }

                GUI.Box.BoxInputText.Open( Helper.Label( "LANGUAGE_UPDATE", item.Key ),
                    Helper.Label( item.Key, null, attribute ),
                    Language.Manager.Instance.getLabel( attribute, item.Key ),
                    false,
                    onCheckValue( attribute ) );
            };
        }

        this.declareColumn( "Key", "LANGUAGE_KEY", 3 );
        for ( let language of Array.toIterable( Language.Manager.Instance.Languages ) ) {
            this.declareColumn( language, Helper.Label( "LANGUAGE_LABEL_" + language, null, language ), 7 );
            this.on( "onClick" + language, handleChangeValue( this ) );
        }
    }

    /**
     * called on openning the board
     */
    onOpen () {
        function handleNewLanguage( board ) {
            return async function ( currentLanguage, item, key ) {
                if ( item !== undefined )
                    return;

                for ( let language of Array.toIterable( Language.Manager.Instance.Languages ) ) {
                    if ( language === currentLanguage && !board.Webix.isColumnVisible( language ) ) {
                        board.showColumn( language );
                        continue;
                    }

                    if ( language === currentLanguage || !board.Webix.isColumnVisible( language ) )
                        continue;

                    board.hideColumn( language );
                }

                await board.adjustWebix();
            };
        }

        super.onOpen();

        this._listenerLanguageManager = Language.Manager.Instance.addListener( handleNewLanguage( this ) );
        handleNewLanguage( this )( DSDatabase.Instance.CurrentLanguage );
    }

    /**
     * Called on closing the board
     */
    onClose () {
        super.onClose();

        Language.Manager.Instance.removeListener( this._listenerLanguageManager );
        this._listenerLanguageManager = null;
    }

    /**
     * Constructor
     * @param {any} box      string describing the html container, an html object or a GUI.Box
     * @param {any} name     identify the board
     * @param {any} title    string describing the title of the table (using Helper.Span)
     */
    constructor( box, name, title ) {
        super( box, name, title ? title : "TITLE_LANGUAGE", new Language.List(), GUI.Board.BOARD_NONE );

        this._listenerLanguageManager = null;

        this.draw();
    }
};
