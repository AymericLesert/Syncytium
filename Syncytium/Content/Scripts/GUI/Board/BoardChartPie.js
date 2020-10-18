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
 * Handle a webix pie chart into a board
 */
GUI.Board.BoardChartPie = class extends GUI.Board.BoardChart {

    /**
     * @returns {any} Webix component representing the chart
     */
    createChart () {
        return new webix.ui( {
            view: "chart",
            type: "pie",
            css: "webix_board_pie",
            container: this.TableZone[0],
            value: "#value#",
            color: "#color#",
            shadow: false,
            border: false,
            borderless: true,
            tooltip: { template: "#value#" },
            pieInnerText: "<div class='webix_pieInnerText'>#percentage#</div>",
            legend: { values: this.Legends, align: "left", layout: "y" },
            data: this._data
        } );
    }

    /**
     * Draw a webix component representing a pie
     * @param {any} container reference on the container having the webix component
     * @returns {any} Webix object representing the board
     */
    drawWebix( container ) {
        this._data = [];
        this._values = {};
        this._indicator = {};

        for ( let i in this.Legends ) {
            let newData = { id: i, value: 0, color: this.Legends[i].color, percentage: 0 };

            this._data.push( newData );
            this._values[this.Legends[i].id] = newData;
            this._indicator[this.Legends[i].id] = 0;
        }

        return this.createChart();
    }

    /**
     * Abstract method
     * Compute the indicator attached to the record
     * @param {any} record record to compute
     * @returns {any} indicator extracted from the record
     */
    computeIndicator ( record ) {
        return this.newIndicator();
    }

    /**
     * Populate the webix object on async mode
     */
    async populateWebix() {
        let i = 0;

        function handleRead( board ) {
            return function ( record ) {
                board.updateIndicator( board.computeIndicator( record ), null, false );
            };
        }

        await super.populateWebix();

        this._indicator = this.newIndicator();
        this.List.each( handleRead( this ) );

        for ( i = 0; i < this.Legends.length; i++ )
            this.setValue( this.Legends[i].id, this._indicator[this.Legends[i].id] );

        // compute the percentage

        let total = 0;
        for ( i = 0; i < this._data.length; i++ )
            total += this._data[i].value;

        let currentTotal = 0;
        for ( i = 0; i < this._data.length; i++ ) {
            if ( this._data[i].value > 0 ) {
                currentTotal += this._data[i].value;
                this._data[i].percentage = ( Math.ceil( currentTotal * 100 / total ) - Math.ceil( ( currentTotal - this._data[i].value ) * 100 / total ) ).toString();
            } else {
                this._data[i].percentage = "0";
            }
            this._data[i].percentage += '%';
        }
    }

    /**
     * Adjust the webix tool into the board
     */
    async adjustWebix() {
        if ( this.Webix === null )
            return;

        let tableZone = this.TableZone;
        let width = tableZone.width();
        let height = tableZone.height();

        this.Webix.config.width = width;
        this.Webix.config.height = height;
        this.Webix.config.x = width / 2;
        this.Webix.config.y = height / 2;
        this.Webix.config.radius = ( width < height ? width : height ) / 2 - 5;
        this.Webix.resize();

        await super.adjustWebix();
    }

    /**
     * set a value into the chart
     * @param {any} legend legend concerned by the new value
     * @param {any} value  new value set to the legend
     */
    setValue ( legend, value ) {
        if ( this._values[legend] === null || this._values[legend] === undefined )
            return;

        let newValue = 0;

        if ( typeof value === "string" )
            newValue = String.parseFloat( value );
        else if ( typeof value === "number" )
            newValue = value;
        else
            newValue = 0;

        if ( newValue < 0 )
            newValue = 0;

        this._values[legend].value = newValue;
    }

    /**
     * Update indicator = current indicator + indicatorToAdd - indicatorToSub
     * @param {any} indicatorToAdd indicator added to the indicator
     * @param {any} indicatorToSub indicator substracted to the indicator
     * @param {any} adjust         true if the chart must be adjusted or not
     */
    async updateIndicator ( indicatorToAdd, indicatorToSub, adjust ) {
        let update = false;
        let i = null;
        let inc = null;

        adjust = adjust === null || adjust === undefined || adjust;

        if ( indicatorToAdd !== null && indicatorToAdd !== undefined &&
            indicatorToSub !== null && indicatorToSub !== undefined ) {
            for ( i = 0; i < this.Legends.length; i++ ) {
                inc = indicatorToAdd[this.Legends[i].id] - indicatorToSub[this.Legends[i].id];
                if ( inc === 0 )
                    continue;

                update = true;
                this._indicator[this.Legends[i].id] += inc;
            }
        } else if ( indicatorToAdd !== null && indicatorToAdd !== undefined ) {
            for ( i = 0; i < this.Legends.length; i++ ) {
                inc = indicatorToAdd[this.Legends[i].id];
                if ( inc === 0 )
                    continue;

                update = true;
                this._indicator[this.Legends[i].id] += inc;
            }
        } else if ( indicatorToSub !== null || indicatorToSub !== undefined ) {
            for ( i = 0; i < this.Legends.length; i++ ) {
                inc = indicatorToSub[this.Legends[i].id];
                if ( inc === 0 )
                    continue;

                update = true;
                this._indicator[this.Legends[i].id] -= inc;
            }
        }

        if ( update && adjust ) {
            await this.populateWebix();
            await this.adjustWebix();
        }
    }

    /**
     * Method called on onOpen of the box containing the chart
     */
    onOpen () {
        function handleLoad( board ) {
            return async function () {
                board.refresh();
                await board.populateWebix();
                await board.adjustWebix();
            };
        }

        function handleRecord( board ) {
            return function ( event, table, id, oldRecord, newRecord ) {
                let newIndicator = null;
                let oldIndicator = null;

                switch ( event ) {
                    case "onCreate":
                        newIndicator = board.computeIndicator( oldRecord );
                        break;
                    case "onUpdate":
                        oldIndicator = board.computeIndicator( oldRecord );
                        newIndicator = board.computeIndicator( newRecord );
                        break;
                    case "onDelete":
                        oldIndicator = board.computeIndicator( oldRecord );
                        break;
                }

                board.debug( "Handle event (" + event + "," + table + ") : " + String.JSONStringify( oldIndicator ) + " - " + String.JSONStringify( newIndicator ) );

                board.updateIndicator( newIndicator, oldIndicator );
            };
        }

        this.List.on( "onLoad", handleLoad( this ) );

        this.List.on( "onCreate", handleRecord( this ) );
        this.List.on( "onUpdate", handleRecord( this ) );
        this.List.on( "onDelete", handleRecord( this ) );

        super.onOpen();
    }

    /**
     * Method called on onClose of the box containing the chart
     */
    onClose () {
        super.onClose();

        this.List.unbind( "onCreate" );
        this.List.unbind( "onUpdate" );
        this.List.unbind( "onDelete" );
        this.List.unbind( "onLoad" );

        this.List.onClose();
    }

    /**
     * Draw the chart into the canvas (before inserting into the PDF document)
     * For a pie chart, width must be greater than height
     * @param {any} canvas  canvas which concerns the chart
     * @param {any} context conext 2D of the canvas
     */
    drawCanvas ( canvas, context ) {
        // Sum all values

        let i = 0;
        let total = 0;
        for ( i = 0; i < this._data.length; i++ )
            total += this._data[i].value;

        // Draw the pie

        let radius = ( canvas.height > canvas.width / 2 ? canvas.width / 2 : canvas.height ) / 2;
        let centerX = radius;
        let centerY = radius;

        if ( total > 0 ) {
            let currentAngle = 1.5 * Math.PI;
            for ( i = 0; i < this._data.length; i++ ) {
                context.fillStyle = this._data[i].color;
                context.beginPath();
                context.moveTo( centerX, centerY );
                context.arc( centerX, centerY, radius * 0.9, currentAngle, currentAngle + Math.PI * 2 * ( this._data[i].value / total ), false );
                context.lineTo( centerX, centerY );
                context.fill();

                currentAngle += Math.PI * 2 * ( this._data[i].value / total );
            }

            // Show the percentage

            currentAngle = 1.5 * Math.PI;
            for ( i = 0; i < this._data.length; i++ ) {
                currentAngle += Math.PI * 2 * ( this._data[i].value / total );

                if ( this._data[i].value > 0 ) {
                    let relativeX = radius * 0.5 * Math.cos( currentAngle - Math.PI * 2 * ( this._data[i].value / total ) / 2 );
                    let relativeY = radius * 0.5 * Math.sin( currentAngle - Math.PI * 2 * ( this._data[i].value / total ) / 2 );

                    context.font = "22px var(--syncytium-font)";
                    context.fillStyle = "#eeeeee";
                    context.textAlign = "center";
                    context.fillText( this._data[i].percentage, centerX + relativeX, centerY + relativeY );
                }
            }
        } else {
            // get the default color

            let defaultBodyColor = String.parseRGBToHEX( $( "body" ).css( 'color' ) );

            let div = $( "<webix id='" + this.Name + "' class='default_color'></webix>" );
            if ( !String.isEmptyOrWhiteSpaces( this.CSSClass ) )
                div.addClass( this.CSSClass );
            let element = div.appendTo( "body" );
            context.fillStyle = String.parseRGBToHEX( div.css( 'color' ) );
            element.remove();

            context.beginPath();
            context.moveTo( centerX, centerY );
            context.arc( centerX, centerY, radius, 0, Math.PI * 2 );
            context.fill();
        }

        if ( this.Legends.length > 0 ) {
            // Show the legends (max 12 elements)

            let boxWidth = canvas.width / 4;
            let boxHeight = canvas.height / 6;

            let nbLines = Math.ceil( this.Legends.length / 2 );

            let startX = canvas.width / 2;
            let startY = ( canvas.height - nbLines * boxHeight ) / 2;

            for ( i = 0; i < this.Legends.length; i++ ) {
                let value = this._values[this.Legends[i].id].value;

                let legendX = startX + i % 2 * boxWidth;
                let legendY = startY + Math.floor( i / 2 ) * boxHeight;

                let legendRadius = boxHeight / 2;
                let legendCenterX = legendX + legendRadius + legendRadius * 0.4;
                let legendCenterY = legendY + legendRadius;

                context.fillStyle = this.Legends[i].color;
                context.beginPath();
                context.moveTo( legendCenterX, legendCenterY );
                context.arc( legendCenterX, legendCenterY, legendRadius * 0.4, 0, Math.PI * 2 );
                context.lineTo( legendCenterX, legendCenterY );
                context.fill();

                context.font = "20px var(--syncytium-font)";
                context.fillStyle = "#666666";
                context.textAlign = "left";
                context.fillText( Language.Manager.Instance.interpolation( this.Legends[i].label ) + " (" + value.toString() + ")", legendX + 2 * legendRadius, legendY + boxHeight / 2 + 7 );
            }
        }
    }

    /**
     * constructor
     * @param {any} box      string describing the html container, an html object or a GUI.Box
     * @param {any} name     identify the board
     * @param {any} title    string describing the title of the table (using Helper.Span)
     * @param {any} list     list of elements (See List.List)
     * @param {any} icons    icons expected into the table (See BOARD_ICON, BOARD_ADD, ...)
     */
    constructor( box, name, title, list, icons ) {
        super( box, name, "board_chart_pie", title, list, icons );

        this._indicator = {};
        this._data = [];
        this._values = {};
    }
};
