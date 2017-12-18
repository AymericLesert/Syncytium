/// <reference path="../../../_references.js" />
/// <reference path="Enum.js" />
/// <reference path="List.js" />

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
 * Class handling a board of languages
 */
Language.Board = class extends GUI.Board.BoardTable {
    /**
     * Define the list of columns into the table
     */
    declareColumns () {
        function handleChangeValue( board ) {
            return function ( id, item, attribute ) {
                function onCheckValue( language, labelId ) {
                    return function ( newValue ) {
                        var oldLabel = DSDatabase.Instance.getRowById( "Language", labelId );
                        var newLabel = DSDatabase.Instance.getRowById( "Language", labelId );
                        newLabel[language] = newValue;

                        var errors = new Errors();
                        DSDatabase.Instance.updateFromClient( "Language", oldLabel, newLabel, errors );

                        if ( errors.HasError )
                            return errors;

                        return true;
                    };
                }

                GUI.Box.BoxInputText.Open( Helper.Label( "LANGUAGE_UPDATE", item.Key ),
                    Helper.Label( item.Key, null, attribute ),
                    Language.Manager.Instance.getLabel( attribute, item.Key ),
                    false,
                    onCheckValue( attribute, id ) );
            };
        }

        this.declareColumn( "Key", "LANGUAGE_KEY", 3 );
        var languages = Language.Manager.Instance.Languages;
        for ( var i in languages ) {
            this.declareColumn( languages[i], Helper.Label( "LANGUAGE_LABEL_" + languages[i], null, languages[i] ), 7 );
            this.on( "onClick" + languages[i], handleChangeValue( this ) );
        }
    }

    /**
     * called on openning the board
     */
    onOpen () {
        function handleNewLanguage( board ) {
            return function ( currentLanguage, language, key ) {
                if ( language !== undefined )
                    return;

                var languages = Language.Manager.Instance.Languages;
                for ( var i in languages ) {
                    if ( languages[i] === currentLanguage && !board.Webix.isColumnVisible( languages[i] ) ) {
                        board.showColumn( languages[i] );
                        continue;
                    }

                    if ( languages[i] === currentLanguage || !board.Webix.isColumnVisible( languages[i] ) )
                        continue;

                    board.hideColumn( languages[i] );
                }

                board.adjustWebix();
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
        super( box, name, title ? title : "TITLE_LANGUAGE", new Language.List(), GUI.Board.BOARD_ALL );

        this.Help = Area.HTTP_ROOT_DOCUMENTATION + "module-d-administration/gestion-des-libelles";
        this._listenerLanguageManager = null;

        this.setVisible( GUI.Board.BOARD_ALL - GUI.Board.BOARD_HELP, false );
        this.draw();
    }
};
