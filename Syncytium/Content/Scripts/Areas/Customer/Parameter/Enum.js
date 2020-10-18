/// <reference path="../../../_references.js" />

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
 * Global parameters
 */

var ParameterRecord = {};

/*
 * Parameters included into this table
 */

ParameterRecord.MyValue = 0;

/**
 * This function listens changes into the table "Parameter" to set parameters
 */
ParameterRecord.OnLoadedData = function () {
    function handleUpdateParameter() {
        return function ( event, table, id, oldRecord, newRecord ) {
            function setParameter( record ) {
                let oldValue = null;

                if ( record === null || record === undefined )
                    return;

                switch ( record.Cle ) {
                    case "MyValue":
                        ParameterRecord.MyValue = String.parseInt( record.Valeur );
                        break;
                }
            }

            switch ( event ) {
                case "onLoad":
                    List.ListRecord.CACHE_LIST( "Parameter" ).each( setParameter );
                    break;
                case "onCreate":
                case "onDelete":
                    setParameter( oldRecord );
                    break;
                case "onUpdate":
                    setParameter( newRecord );
                    break;
            }
        };
    }

    DSDatabase.Instance.addEventListener( "onCreate", "Parameter", "*", handleUpdateParameter() );
    DSDatabase.Instance.addEventListener( "onUpdate", "Parameter", "*", handleUpdateParameter() );
    DSDatabase.Instance.addEventListener( "onDelete", "Parameter", "*", handleUpdateParameter() );
    DSDatabase.Instance.addEventListener( "onLoad", "Parameter", "*", handleUpdateParameter() );

    handleUpdateParameter()( "onLoad", "Parameter" );
}