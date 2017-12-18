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

/**
 * Define a bar chart
 */
GUI.Webix.WebixBar = class extends GUI.Webix.Webix {
    /**
     * set a label into the chart
     * @param {any} id    id of the column
     * @param {any} label multilingual label of the column
     */
    setLabel ( id, label ) {
        if ( id < 0 || id >= this._values.length || this._values[id] === undefined )
            return;

        this._values[id].label = Helper.Label( label );
    }

    /**
     * Set a value into the chart
     * @param {any} id    id of the column
     * @param {any} value value of the column
     */
    setValue ( id, value ) {
        if ( id < 0 || id >= this._values.length || this._values[id] === undefined )
            return;

        if ( typeof value === "string" )
            this._values[id].value = String.parseFloat( value );
        else if ( typeof value === "number" )
            this._values[id].value = String.parseFloat( value );
        else
            this._values[id].value = 0;

        if ( this._values[id].value < 0 )
            this._values[id].value = 0;

        this.refresh();
    }

    /**
     * @returns {any} Instanciate a webix bar chart
     */
    createChart () {
        var maxValue = this._maxValue ? this._maxValue : this._nbSteps;

        return new webix.ui( {
            view: "chart",
            type: "bar",
            css: "webix_bar",
            container: this.ChartZone[0],
            value: "#value#",
            color: "#color#",
            shadow: false,
            border: false,
            borderless: true,
            tooltip: { template: function ( obj, common ) { return Helper.Span( obj.label ); } },
            yAxis: { start: 0, end: maxValue, step: maxValue / this._nbSteps },
            data: []
        } );
    }

    /**
     * Draw the chart
     * @param {any} container zone having the field
     */
    drawChart ( container ) {
        this.Webix = this.createChart();

        // get the color

        var defaultColor = "#000000";

        var div = $( "<webix id='" + this.Name + "' class='color'></webix>" );
        if ( !String.isEmptyOrWhiteSpaces( this.CSSClass ) )
            div.addClass( this.CSSClass );
        var element = div.appendTo( "body" );
        var color = div.css( 'color' );
        element.remove();
        if ( !String.isEmptyOrWhiteSpaces( color ) )
            defaultColor = String.parseRGBToHEX( color );

        for ( var i = 0; i < this._values.length; i++ ) {
            div = $( "<webix id='" + this.Name + "' class='color_" + ( i + 1 ).toString() + "'></webix>" );
            if ( !String.isEmptyOrWhiteSpaces( this.CSSClass ) )
                div.addClass( this.CSSClass );
            element = div.appendTo( "body" );
            color = div.css( 'color' );
            element.remove();
            this._values[i].color = !String.isEmptyOrWhiteSpaces( color ) ? String.parseRGBToHEX( color ) : defaultColor;
        }
    }

    /**
     * Method to refresh the bar chart
     */
    refresh () {
        super.refresh();

        if ( this.Component === null || this.Webix === null )
            return;

        // handle the resizing on the field

        var width = this.ChartZone.width();
        var height = this.ChartZone.height();
        var maxValue = 0;

        this.Webix.clearAll();
        for ( var i = 0; i < this._values.length; i++ ) {
            this.Webix.add( this._values[i] );
            if ( maxValue < this._values[i].value )
                maxValue = Math.ceil( this._values[i].value / this._nbSteps ) * this._nbSteps;
        }

        if ( this._maxValue !== maxValue ) {
            this._maxValue = maxValue;
            this.Webix = this.createChart();
        }

        this.Webix.config.barWidth = width / ( this._values.length + 1 );
        this.Webix.config.width = width;
        this.Webix.config.height = height;
        this.Webix.config.x = width / 10;
        this.Webix.config.y = height / 10;
        this.Webix.resize();
    }

    /**
     * Constructor
     * @param {any} box    reference on the box containing the component (inheritance of the readonly and visible flag)
     * @param {any} name   name of the component
     * @param {any} nbBars nb bars to show
     */
    constructor( box, name, nbBars ) {
        super( box, name, "bar" );

        this._values = [];
        for ( var i = 0; i < nbBars; i++ )
            this._values.push( { id: i + 1, value: 0, color: "#000000", label: null } );
        this._maxValue = 0;
        this._nbSteps = 5;

        this.draw();
    }
};
