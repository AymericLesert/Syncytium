/// <reference path="../_references.js" />

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
 * Define a list of days (for each day of a month and for each month sorted by year, store elements)
 */
List.ListCalendar = class extends List.List {
    /**
     * Set offset month of the list (current month and year to see in the calendar)
     * @param {any} month current month
     * @param {any} year  current year
     */
    setMonth ( month, year ) {
        if ( month < 1 || month > 12 )
            return;

        this._offsetMonth = month;
        this._offsetYear = year;
    }

    /**
     * Go to the previous month
     */
    previousMonth () {
        this._offsetMonth--;

        if ( this._offsetMonth < 1 ) {
            this._offsetMonth = 12;
            this._offsetYear--;
        }
    }

    /**
     * Go to the next month
     */
    nextMonth () {
        this._offsetMonth++;

        if ( this._offsetMonth > 12 ) {
            this._offsetMonth = 1;
            this._offsetYear++;
        }
    }

    /**
     * Get the month on depends on the offset month
     * @param {int} offsetMonth offset of the month to retrieve from the current month and year
     * @returns {int} the month (1..12)
     */
    month ( offsetMonth ) {
        let month = this._offsetMonth + ( offsetMonth === null || offsetMonth === undefined ? 0 : offsetMonth );
        return ( month - 1 ) % 12 + 1;
    }

    /**
     * Get the year on depends on the offset month
     * @param {int} offsetMonth offset of the month to retrieve from the current month and year
     * @returns {int} the year
     */
    year ( offsetMonth ) {
        let month = this._offsetMonth + ( offsetMonth === null || offsetMonth === undefined ? 0 : offsetMonth );
        return this._offsetYear + Math.floor(( month - 1 ) / 12 );
    }

    /**
     * Get the day
     * @param {any} item record containing the id to retrieve
     * @returns {int} day of this item
     */
    getId ( item ) {
        return item.day;
    }

    /**
     * Abstract method: Id corresponding to the element (one element stored into this list)
     * @param {any} element item of the current element into the list
     * @returns {int} id of the element
     */
    getElementId ( element ) {
        return null;
    }

    /**
     * Abstract method: HTML Text corresponding to the element (one element stored into this list)
     * @param {any} element item of the current element into the list
     * @returns {string} HTML code representing the element
     */
    getElementHTML ( element ) {
        return null;
    }

    /**
     * Abstract method: extracting date from the element
     * @param {any} element item of the current element into the list
     * @returns {any} Date of the element
     */
    getElementDate ( element ) {
        return null;
    }

    /**
     * Abstract method: extracting value from the element to sort them
     * @param {any} element item of the current element into the list
     * @returns {string} string representing the element
     */
    getElementText ( element ) {
        return "";
    }

    /**
     * No text
     * @param {any} item item of the element
     * @returns {any} null
     */
    getText ( item ) {
        return null;
    }

    /**
     * No picture
     * @param {any} item item of the element
     * @returns {any} null
     */
    getPicture ( item ) {
        return null;
    }

    /**
     * Get the html content of an attribute (to show the attribute)
     * here, attribute is the id of the column
     * @param {any} item item of the element
     * @param {any} attribute property to retrieve
     * @returns {any} HTML code representing the value of the attribute
     */
    getAttributHTML ( item, attribute ) {
        function compare( list ) {
            return function ( item1, item2 ) {
                let v1 = list.getElementText( item1 );
                let v2 = list.getElementText( item2 );

                if ( v1 < v2 )
                    return -1;

                if ( v2 < v1 )
                    return 1;

                return 0;
            };
        }

        if ( attribute === "day" )
            return item.day.toString();

        let offsetMonth = parseInt( attribute );
        if ( isNaN( offsetMonth ) )
            return "";

        let i = null;
        let currentDay = item.day;
        let currentMonth = this._offsetMonth + offsetMonth;
        let currentYear = this._offsetYear;

        while ( currentMonth > 12 ) {
            currentMonth -= 12;
            currentYear++;
        }

        let day = this.day[currentDay];
        if ( !day )
            return "";

        let month = day.month[currentMonth];
        if ( !month )
            return "";

        let elements = month.year[currentYear];
        if ( !elements )
            return "";

        let arrayElement = [];
        for ( let element of Array.toIterable( elements ) )
            arrayElement.push( element );
        arrayElement.sort( compare( this ) );

        let content = "";
        for ( let element of arrayElement ) {
            if ( element === null || element === undefined )
                continue;

            let str = this.getElementHTML( element );
            if ( String.isEmptyOrWhiteSpaces( str ) )
                continue;

            if ( content !== "" )
                content += "</br>";

            content += str;
        }

        return content;
    }

    /**
     * Get the text of an attribute (to filter the value) - no filter possible
     * @param {any} item item of the element
     * @param {any} attribute property to retrieve
     * @returns {any} Text representing the value of the attribute
     */
    getAttributText ( item, attribute ) {
        if ( attribute === "ToolTip" )
            return "";

        if ( attribute === "day" )
            return item.day.toString();

        let offsetMonth = parseInt( attribute );
        if ( isNaN( offsetMonth ) )
            return "";

        let i = null;
        let currentDay = item.day;
        let currentMonth = this._offsetMonth + offsetMonth;
        let currentYear = this._offsetYear;

        while ( currentMonth > 12 ) {
            currentMonth -= 12;
            currentYear++;
        }

        return ( new moment( [currentYear, currentMonth - 1, currentDay] ) ).format( 'LLLL' );
    }

    /**
     * Get the value of an attribute (to sort it) - no sort available
     * @param {any} item item of the element
     * @param {any} attribute property to retrieve
     * @returns {any} Text representing the value of the attribute
     */
    getAttributValue ( item, attribute ) {
        return item.day.toString();
    }

    /**
     * Indicates if the item is visible in this list or not
     * @param {any} item record to check
     * @returns {boolean} true
     */
    isVisible ( item ) {
        return true;
    }

    /**
     * Retrieve an item into the list by its id (day)
     * @param {any} id    id of the record to look for
     * @returns {any} day item
     */
    getItem ( id ) {
        if ( this.day[id] === undefined )
            return null;

        return this.day[id];
    }

    /**
     * @returns {any} list of days
     */
    getList () {
        return this.day;
    }

    /**
     * Clean up all elements into the calendar
     */
    clear () {
        this.day = [];
        for ( let i = 1; i <= 31; i++ )
            this.day[i] = { day: i, month: {} };
    }

    /**
     * Add a new item into the calendar on depends on the date in newItem
     * @param {any} newItem item to add
     * @param {any} notify true to raise the event "onUpdate"
     * @returns {any} new item added into the list
     */
    addItem ( newItem, notify ) {
        let date = this.getElementDate( newItem );
        if ( date === null || date === undefined || !( date instanceof moment ) )
            return null;

        let currentDay = date.date();
        let currentMonth = date.month() + 1;
        let currentYear = date.year();

        let day = this.day[currentDay];
        if ( !day )
            return null;

        let month = day.month[currentMonth];
        if ( !month ) {
            day.month[currentMonth] = { month: currentMonth, year: {} };
            month = day.month[currentMonth];
        }

        let elements = month.year[currentYear];
        if ( !elements ) {
            month.year[currentYear] = {};
            elements = month.year[currentYear];
        }

        elements[this.getElementId( newItem )] = newItem;

        if ( typeof notify !== "boolean" || notify )
            this.raise( "onUpdate", "*", currentDay, { day: currentDay }, { day: currentDay } );

        return newItem;
    }

    /**
     * Update an item into the calendar on depends on the date
     * @param {any} oldItem item to delete
     * @param {any} newItem item to add
     */
    updateItem ( oldItem, newItem ) {
        let oldDate = this.getElementDate( oldItem );
        let newDate = this.getElementDate( newItem );

        this.deleteItem( oldItem, false );
        this.addItem( newItem, false );

        if ( oldDate === null && newDate === null )
            return;

        let fnEvent = this.getEvent( "onUpdate" );
        if ( !fnEvent )
            return;

        if ( oldDate !== null && newDate !== null && oldDate.date() === newDate.date() ) {
            fnEvent( "onUpdate", "*", oldDate.date(), { day: oldDate.date() }, { day: oldDate.date() } );
            return;
        }

        if ( oldDate !== null )
            fnEvent( "onUpdate", "*", oldDate.date(), { day: oldDate.date() }, { day: oldDate.date() } );

        if ( newDate !== null )
            fnEvent( "onUpdate", "*", newDate.date(), { day: newDate.date() }, { day: newDate.date() } );
    }

    /**
     * Remove an item into the calendar on depends on the date
     * @param {any} oldItem item to delete
     * @param {any} notify true to raise the event "onUpdate"
     * @returns {any} item deleted
     */
    deleteItem ( oldItem, notify ) {
        let date = this.getElementDate( oldItem );
        if ( date === null || date === undefined || !( date instanceof moment ) )
            return null;

        let currentDay = date.date();
        let currentMonth = date.month() + 1;
        let currentYear = date.year();

        let day = this.day[currentDay];
        if ( !day )
            return null;

        let month = day.month[currentMonth];
        if ( !month )
            return null;

        let elements = month.year[currentYear];
        if ( !elements )
            return null;

        delete elements[this.getElementId( oldItem )];

        if ( typeof notify !== "boolean" || notify )
            this.raise( "onUpdate", "*", currentDay, { day: currentDay }, { day: currentDay } );

        return oldItem;
    }

    /**
     * Constructor
     */
    constructor() {
        super();

        let now = new moment();

        this._offsetMonth = now.month() + 1;
        this._offsetYear = now.year();

        this.clear();
    }
};
