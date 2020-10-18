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

/*
 * Define a dialog box handling a record
 */
ParameterRecord.Box = class extends GUI.Box.BoxRecord {
    /**
     * @returns {List.List} list representing all ressources
     */
    get List() {
        return this._list;
    }

    /**
     * @param {any} list set a list to this box
     */
    set List( list ) {
        this._list = list ? list : new ParameterRecord.List();
    }

    /**
     * Draw and show the content of the dialog box
     * @param {any} container zone having the content
     */
    drawContent ( container ) {
        super.drawContent( container );

        function handleChangeTitle( box ) {
            return function () {
                box.Title = Helper.Label( box.Title.label, box.getRecordLabel() );
            };
        }

        // ------------------------------- Panel '_fields'

        this.declarePanel( "_fields" );

        // 'Cle' : Key of the parameter

        this._fieldKey = this.declareField( "Key" );
        this._fieldKey.on( 'change', handleChangeTitle( this ) );

        // 'Description' : Long description of the parameter

        this._fieldDescription = this.declareField( "Description" );

        // 'Valeur' : Value assigned to the parameter

        this._fieldValue = this.declareField( "Value" );

        // ------- Panel '_history'

        let navigationPanels = [["_fields"]];

        // ------------------------------- List of navigation panels

        this.declareNavigationPanels( navigationPanels );
    }

    /**
     * Open the box
     */
    open() {
        super.open();

        this._fieldKey.raise( 'change' );
    }

    /**
     * Constructor
     * @param {any} list if undefined, UserRecord.List() or a reference on a UserRecord.List()
     */
    constructor( list ) {
        super( "Parameter", list ? list : new ParameterRecord.List() );

        this._fieldKey = null;
        this._fieldDescription = null;
        this._fieldValue = null;

        this.draw();
    }
};