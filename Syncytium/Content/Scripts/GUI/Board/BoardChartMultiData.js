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
 * Class handling a chart with lines or bars
 */
GUI.Board.BoardChartMultiData = class extends GUI.Board.BoardChart {
    /**
     * @returns {string} "bar"
     */
    static get BAR() {
        return "bar";
    }

    /**
     * @returns {string} "line"
     */
    static get LINE() {
        return "line";
    }

    /**
     * set the number of values on the y-axis
     * @param {any} value new value of the number of steps
     */
    set NbSteps( value ) {
        this._nbSteps = value < 1 ? 1 : Math.ceil( value );
    }

    /**
     * @returns {any} list of values
     */
    get Values() {
        return this._values;
    }

    /**
     * @returns {any} Webix component representing the chart
     */
    createChart () {
        function handleOnMouseMove( board ) {
            return function ( id, event ) {
                var value = board.getTooltip( board.Webix.getItem( id ), "label" );
                if ( String.isEmptyOrWhiteSpaces( value ) )
                    return;
                GUI.Webix.Tooltip.Instance.show( value, event );
            };
        }

        function handleOnMouseOut( board ) {
            return function ( event ) {
                GUI.Webix.Tooltip.Instance.hide();
            };
        }

        var maxValue = this._maxValue ? this._maxValue : this._nbSteps;

        var chart = {
            view: "chart",
            type: this._chartType,
            css: "webix_board_line",
            container: this.TableZone[0],
            color: "#color#",
            shadow: false,
            border: false,
            borderless: true,
            xAxis: { template: this._showXAxis ? "#label#" : "", lines: false },
            tooltip: false,
            yAxis: { start: 0, end: maxValue, step: maxValue / this._nbSteps, lines: true },
            legend: { values: this.Legends, align: "center", layout: "x" },
            series: this._series,
            data: this._data,
            on: {
                onMouseMove: handleOnMouseMove( this ),
                onMouseOut: handleOnMouseOut( this )
            }
        };

        if ( this._chartType === GUI.Board.BoardChartMultiData.LINE ) {
            chart.offset = 0;
            chart.eventRadius = 5;
        }

        return new webix.ui( chart );
    }

    /**
     * Draw a webix component representing a chart
     * @param {any} container reference on the container having the webix component
     * @returns {any} Webix object representing the board
     */
    drawWebix ( container ) {
        var i = null;

        this._series = [];

        // retrieve the width of the line

        for ( i in this.Legends ) {
            let legend = this.Legends[i];

            let div = $( "<webix id='" + this.Name + "' class='color_" + legend.id + "'></webix>" );
            if ( !String.isEmptyOrWhiteSpaces( this.CSSClass ) )
                div.addClass( this.CSSClass );
            let element = div.appendTo( "body" );

            var width = parseInt( div.css( 'width' ) );
            if ( width < 1 ) width = 1;

            element.remove();

            legend.width = width;
            legend.type = legend.type === null || legend.type === undefined ? this._chartType : legend.type;
        }

        // Build the series
        // Notes : Webix has an issue about the multiview dataset. The series must start within the type of the chart. Else, webix doesn't take into account the color!

        for ( i in this.Legends ) {
            let legend = this.Legends[i];
            if ( legend.type !== this._chartType )
                continue;

            switch ( this._chartType ) {
                case GUI.Board.BoardChartMultiData.BAR:
                    this._series.push( { value: "#" + legend.id + "#", color: legend.color } );
                    break;
                case GUI.Board.BoardChartMultiData.LINE:
                    this._series.push( { value: "#" + legend.id + "#", item: { radius: 0 }, line: { color: legend.color, width: legend.width } } );
                    break;
            }
        }

        for ( i in this.Legends ) {
            let legend = this.Legends[i];
            if ( legend.type === this._chartType )
                continue;

            switch ( legend.type ) {
                case GUI.Board.BoardChartMultiData.BAR:
                    this._series.push( { value: "#" + legend.id + "#", type: "bar", color: legend.color } );
                    break;
                case GUI.Board.BoardChartMultiData.LINE:
                    this._series.push( { value: "#" + legend.id + "#", type: "line", item: { radius: 0 }, line: { color: legend.color, width: legend.width } } );
                    break;
            }
        }

        return this.createChart();
    }

    /**
     * Adjust the webix tool into the board
     * @param {boolean} force true if the Webix component must be adjusted (false by default)
     */
    adjustWebix ( force ) {
        force = force === null || force === undefined ? false : force;

        if ( this.Webix === null )
            return;

        // handle the resizing on the chart

        var maxValue = 0;
        for ( var i = 0; i < this._data.length; i++ ) {
            for ( var j = 0; j < this.Legends.length; j++ ) {
                if ( maxValue < this._data[i][this.Legends[j].id] )
                    maxValue = Math.ceil( this._data[i][this.Legends[j].id] / this._nbSteps ) * this._nbSteps;
            }
        }

        if ( this._maxValue !== maxValue || this.Webix.config.yAxis.step !== maxValue / this._nbSteps || force ) {
            this._maxValue = maxValue;
            this.Webix = this.createChart();
        }

        var tableZone = this.TableZone;
        var width = tableZone.width();
        var height = tableZone.height();

        this.Webix.config.width = width;
        this.Webix.config.height = height;
        this.Webix.config.x = width / 10;
        this.Webix.config.y = height / 10;
        this.Webix.resize();

        super.adjustWebix();
    }

    /**
     * Clean up all data into the chart
     */
    clear () {
        this._data.splice( 0, this._data.length );
        this._values = {};
    }

    /**
     * Declare a new abscissa
     * @param {any} value new abscissa
     * @param {any} label multilinugal label describing the abscissa
     */
    declareAbscissa ( value, label ) {
        label = label === null || label === undefined ? value : label;

        if ( this._values[value] !== undefined )
            return;

        var newValue = { id: this._data.length, abscissa: value, label: label };
        for ( var i = 0; i < this.Legends.length; i++ )
            newValue[this.Legends[i].id] = 0;

        this._data.push( newValue );
        this._values[value] = newValue;
    }

    /**
     * Set a value into the chart
     * @param {any} abscissa X
     * @param {any} legend   legend attached
     * @param {any} value    value of the couple (X, legend)
     */
    setValue ( abscissa, legend, value ) {
        if ( this._values[abscissa] === null || this._values[abscissa] === undefined )
            return;

        if ( this._values[abscissa][legend] === null || this._values[abscissa][legend] === undefined )
            return;

        var newValue = 0;

        if ( typeof value === "string" )
            newValue = String.parseFloat( value );
        else if ( typeof value === "number" )
            newValue = value;
        else
            newValue = 0;

        if ( newValue < 0 )
            newValue = 0;

        this._values[abscissa][legend] = newValue;
    }

    /**
     * Draw the chart into the canvas (before inserting into the PDF document)
     * For a pie chart, width must be greater than height
     * @param {any} canvas  canvas which concerns the chart
     * @param {any} context conext 2D of the canvas
     */
    drawCanvas ( canvas, context ) {
        var i = 0;
        var j = 0;
        var k = 0;

        // handle the resizing on the chart

        var maxValue = this._nbSteps;
        for ( i = 0; i < this._data.length; i++ ) {
            for ( j = 0; j < this.Legends.length; j++ ) {
                if ( maxValue < this._data[i][this.Legends[j].id] )
                    maxValue = Math.ceil( this._data[i][this.Legends[j].id] / this._nbSteps ) * this._nbSteps;
            }
        }

        // set properties

        var sizeFont = 16;
        var sizeFontLegend = 20;

        var width = canvas.width * 0.95;
        var height = Math.ceil( canvas.height * 0.7 );

        var originX = canvas.width - width;
        var originY = height;

        var offsetX = 0;
        var stepX = 0;
        var stepY = 0;
        var barWidthX = 0;

        context.translate( 0.5, 6.5 );

        if ( this._data.length > 0 && this.Legends.length > 0 ) {
            var nbBars = 0;

            for ( i = 0; i < this.Legends.length; i++ ) {
                if ( this.Legends[i].type === GUI.Board.BoardChartMultiData.BAR )
                    nbBars++;
            }

            if ( nbBars > 0 ) {
                stepX = width / Math.max( 1, this._data.length );
                offsetX = stepX / 2;
                barWidthX = stepX / nbBars;
            } else {
                stepX = width / Math.max( 1, this._data.length - 1 );
                offsetX = 0;
            }

            stepY = height / maxValue;

            // draw bars

            for ( i = 0, k = 0; i < this.Legends.length; i++ ) {
                if ( this.Legends[i].type !== GUI.Board.BoardChartMultiData.BAR )
                    continue;

                context.fillStyle = this.Legends[i].color;
                for ( j = 0; j < this._data.length; j++ ) {
                    var value = this._data[j][this.Legends[i].id];
                    if ( value <= 0 )
                        continue;

                    context.fillRect( originX + j * stepX + barWidthX * ( k + 0.1 ), originY - 1, barWidthX * 0.8, -value * stepY + 1 );
                }

                k++;
            }

            // draw lines

            for ( i = 0; i < this.Legends.length; i++ ) {
                if ( this.Legends[i].type !== GUI.Board.BoardChartMultiData.LINE )
                    continue;

                context.beginPath();
                context.lineWidth = 2;
                context.moveTo( originX + offsetX + 1, originY - stepY * this._data[0][this.Legends[i].id] );
                for ( j = 1; j < this._data.length; j++ )
                    context.lineTo( originX + offsetX + stepX * j, originY - stepY * this._data[j][this.Legends[i].id] );
                context.strokeStyle = this.Legends[i].color;
                context.stroke();
            }

            for ( i = 0, k = 0; i < this.Legends.length; i++ ) {
                if ( this.Legends[i].type !== GUI.Board.BoardChartMultiData.LINE )
                    continue;

                context.fillStyle = this.Legends[i].color;
                for ( j = 0; j < this._data.length; j++ ) {
                    var centerX = originX + offsetX + stepX * j;
                    var centreY = originY - stepY * this._data[j][this.Legends[i].id];

                    context.beginPath();
                    context.moveTo( centerX, centreY );
                    context.lineTo( centerX, centreY );
                    context.fill();
                }
            }
        }

        // draw axisX / axisY

        context.beginPath();
        context.lineWidth = 1;
        context.moveTo( originX, 0 );
        context.lineTo( originX, originY );
        context.lineTo( canvas.width, originY );
        context.strokeStyle = '#000000';
        context.stroke();

        // draw axisY

        context.setLineDash( [5, 5] );
        for ( i = 1; i <= this._nbSteps; i++ ) {
            var offsetY = Math.ceil(( height * i ) / this._nbSteps );

            context.beginPath();
            context.lineWidth = 1;
            context.moveTo( originX + 1, originY - offsetY );
            context.lineTo( originX + width, originY - offsetY );
            context.strokeStyle = '#d8d8d8';
            context.stroke();

            context.font = sizeFont.toString() + "px Arial";
            context.fillStyle = "#333333";
            context.textAlign = "right";
            var legend = Math.ceil(( maxValue * i ) / this._nbSteps ).toString();
            context.fillText( legend, originX - 2, originY - offsetY + sizeFont / 3 );
        }
        context.setLineDash( [] );

        // Show the legends

        if ( this.Legends.length > 0 ) {
            var boxWidth = canvas.width / ( this.Legends.length > 4 ? 4 : this.Legends.length );
            var boxHeight = sizeFontLegend;
            var legendRadius = boxHeight / 2;

            var startX = 0;
            var startY = canvas.height - 7 - sizeFontLegend / 2 - ( boxHeight + 14 ) * Math.floor(( this.Legends.length - 1 ) / 4 );

            context.font = "20px Arial";

            for ( i = 0, j = 0; i < this.Legends.length; i++ ) {
                let legend = Language.Manager.Instance.interpolation( this.Legends[i].label );
                var metrics = context.measureText( legend );
                var legendX = startX + ( i % 4 ) * boxWidth + ( boxWidth - metrics.width - boxHeight ) / 2;
                var legendY = startY + j * ( boxHeight + 14 );

                context.fillStyle = "#666666";
                context.textAlign = "left";
                context.fillText( legend, legendX + boxHeight, legendY );

                var legendCenterX = legendX + legendRadius;
                var legendCenterY = legendY - legendRadius;

                context.fillStyle = this.Legends[i].color;
                context.beginPath();
                context.arc( legendCenterX, legendCenterY + 4, legendRadius * 0.8, 0, Math.PI * 2 );
                context.fill();

                if ( ( i + 1 ) % 4 === 0 )
                    j++;
            }
        }

        // draw abscissa

        if ( this._data.length > 0 && this.Legends.length > 0 ) {
            var incX = Math.max( 1, Math.ceil( 20 / stepX ) );

            for ( i = 0; i < this._data.length; i += incX ) {
                var label = this._data[i].label;
                if ( String.isEmptyOrWhiteSpaces( label ) )
                    label = "";
                else
                    label = label.length > 23 ? ( label.substr( 0, 20 ) + " ..." ) : label;

                context.save();
                context.font = sizeFont.toString() + "px Arial";
                context.translate( originX + offsetX + stepX * i, originY + 2 );
                context.rotate( -Math.PI / 4 );
                context.textAlign = 'right';
                context.fillStyle = '#000000';
                context.fillText( label, 0, sizeFont );
                context.restore();
            }
        }
    }

    /**
     * constructor
     * @param {any} box       string describing the html container, an html object or a GUI.Box
     * @param {any} name      identify the board
     * @param {any} cssClass  css class of the board
     * @param {any} title     string describing the title of the table (using Helper.Span)
     * @param {any} list      list of elements (See List.List)
     * @param {any} icons     icons expected into the table (See BOARD_ICON, BOARD_ADD, ...)
     * @param {any} chartType "line" or "bar" (type of chart by default)
     * @param {any} showXAxis true or false to show the axis or not
     */
    constructor( box, name, cssClass, title, list, icons, chartType, showXAxis ) {
        super( box, name, "board_chart_multi " + cssClass ? cssClass : "", title, list, icons );

        this._chartType = chartType === null || chartType === undefined ? GUI.Board.BoardChartMultiData.LINE : chartType;
        this._series = [];
        this._data = [];
        this._values = {}; // data getting by abscissa

        this._maxValue = 0;
        this._showXAxis = showXAxis === null || showXAxis === undefined || showXAxis;
        this._nbSteps = 1;
    }
};
