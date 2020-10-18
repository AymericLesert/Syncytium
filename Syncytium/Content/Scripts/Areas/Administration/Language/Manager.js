/// <reference path="../../../_references.js" />
/// <reference path="Enum.js" />
/// <reference path="List.js" />
/// <reference path="Board.js" />

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
 * Manage labels for the multilingual features
 */
Language.Manager = class extends LoggerBaseObject {
    /**
     * @returns {string} "body > header > ul > "
     */
    static get LANGUAGE_ROOT() {
        return "body > header > ul > ";
    }

    /**
     * Function updating a key into a jquery object
     * @param {any} currentLanguage current language
     * @param {any} language        new language
     * @param {any} key             key to replace
     * @returns {any} function
     */
    static HandleReplacementKeyLabel( currentLanguage, language, key ) {
        return function ( index ) {
            try {
                let klabel = $( this ).attr( "k-label" );
                if ( !klabel || klabel === undefined )
                    return true;

                if ( klabel !== key )
                    return true;

                let klanguage = $( this ).attr( "k-language" );

                if ( !klanguage && language !== currentLanguage )
                    return true;

                if ( klanguage && klanguage !== language )
                    return true;

                if ( !klanguage )
                    klanguage = language;

                let parameters = [];
                let i = 0;
                while ( $( this ).attr( "k-label-" + i ) ) {
                    parameters.push( $( this ).attr( "k-label-" + i ) );
                    i++;
                }

                let value = Language.Manager.Instance.interpolation( klabel, parameters, klanguage );

                if ( $( this ).is( "input" ) ) {
                    $( this ).val( value );
                } else {
                    $( this ).html( String.encode( value ) );
                }

                return true;
            } catch ( e ) {
                return true;
            }
        };
    }

    /**
     * Function updating all keys into a jquery object on depends on a language
     * @param {any} currentLanguage current language to update
     * @returns {any} function
     */
    static HandleReplacementLabel( currentLanguage ) {
        return function ( index ) {
            try {
                let klabel = $( this ).attr( "k-label" );
                if ( !klabel || klabel === undefined )
                    return true;

                let klanguage = $( this ).attr( "k-language" );
                if ( !klanguage )
                    klanguage = currentLanguage;

                let parameters = [];
                let i = 0;
                while ( $( this ).attr( "k-label-" + i ) ) {
                    parameters.push( $( this ).attr( "k-label-" + i ) );
                    i++;
                }

                let value = Language.Manager.Instance.interpolation( klabel, parameters, klanguage );
                if ( $( this ).is( "input" ) ) {
                    $( this ).val( value );
                } else {
                    $( this ).html( String.encode( value ) );
                }

                return true;
            } catch ( e ) {
                return true;
            }
        };
    }

    /**
     * Get the list of languages included into the application
     */
    get Languages () {
        return this._languages;
    }

    /**
     * Populate the table by the data sent by the server
     */
    initialize () {
        function handleUpdateLanguage( manager ) {
            return function ( event, table, id, oldLabel, newLabel ) {
                manager.info( "Replace the label " + String.JSONStringify( manager._labels[newLabel.Key] ) + " by " + String.JSONStringify( newLabel ) );
                manager._labels[newLabel.Key] = newLabel;

                manager.onUpdateLabel( event, table, id, oldLabel, newLabel );
            };
        }

        function handleLoadLanguage( manager ) {
            return function ( event, table ) {
                manager.initialize();
                manager.onChangeLanguage( DSDatabase.Instance.CurrentLanguage, true );
            };
        }

        this.info( "Cleaning up ..." );

        this._labels = {};
        this._ignoreLabels = {};

        this.info( "Updating language table ..." );

        // load the content of the table

        let newTable = {};
        let index = 0;

        for ( let label of Array.toIterable( DSDatabase.Instance.getTable( "Language" ) ) ) {
            // current label in the table from the server
            newTable[label.Key] = label;

            if ( this._languages === null ) {
                this._languages = [];
                for ( let attr in label ) {
                    if ( attr.length === 2 && attr.toUpperCase() === attr ) {
                        this._languages.push( attr );
                    }
                }

                this.debug( "List of languages: " + String.JSONStringify( this._languages ) );
            }

            if ( this.IsVerboseAll )
                this.verbose( "[" + label.Key + "] = " + String.JSONStringify( label ) );

            index++;
        }

        // replace the current table by the table loaded

        this._labels = newTable;
        this._ignoreLabels = {};
        this.info( "Language table contains " + index + " labels" );

        // Add a listener on the database to be notified in case of update

        if ( this._eventOnUpdateKey === null ) {
            this._eventOnUpdateKey = DSDatabase.Instance.addEventListener( "onUpdate", "Language", "*", handleUpdateLanguage( this ) );
            DSDatabase.Instance.addEventListener( "onLoad", "Language", "*", handleLoadLanguage( this ) );
        }
    }

    /**
     * Check if the key is defined into the multilingual dictionary
     * @param {any} key key to look for
     * @returns {boolean} true if the key exists
     */
    existLabel( key ) {
        return this._labels[key] !== null && this._labels[key] !== undefined;
    }

    /**
     * Retrieve a label on depends on the key and the language
     * @param {any} language language corresponding to look for
     * @param {any} key      key to look for
     * @returns {string} label corresponding to the key
     */
    getLabel( language, key ) {
        try {
            let value = this._labels[key][language];
            return !value ? null : value;
        } catch ( e ) {
            // Handle some default messages until the end of loading data
            try {
                let value = Language.Default.Labels[key][language];
                return !value ? null : value;
            } catch ( e ) {
                // in all cases, keep in memory all inexisting messages to avoid too much message into the logger

                if ( !this._ignoreLabels[language + "." + key] ) {
                    this._ignoreLabels[language + "." + key] = true;
                    this.warn( "The label(" + language + "," + key + ") doesn't exist" );
                }
                return null;
            }
        }
    }

    /**
     * Retrieve a comment on depends on the key
     * @param {any} key key to look for
     * @returns {string} comment of the label
     */
    getComment( key ) {
        try {
            let value = this._labels[key].Comment;
            return !value ? "" : value;
        } catch ( e ) {
            return "";
        }
    }

    /**
     * Update a value into the table
     * @param {any} language language 
     * @param {any} key      key of the label
     * @param {any} newValue new value for the key
     * @returns {boolean} true if the label is changed
     */
    setLabel( language, key, newValue ) {
        let oldValue = this.getLabel( language, key );
        if ( !newValue || !oldValue || newValue === oldValue )
            return false;

        try {
            this.info( "The value '" + oldValue + "' of the label '" + key + "' is replaced by '" + newValue + "' ..." );
            this._labels[key][language] = newValue;
            return true;
        } catch ( e ) {
            this.exception( "Exception on updating the label(" + language + "," + key + ")", e );
            return false;
        }
    }

    /**
     * Add a new jQuery component into the language manager to update labels
     * @param {any} component jQuery component added
     */
    addComponent( component ) {
        this._components.push( component );
    }

    /**
     * Replace {n} by the n th element in parameters
     * Replace {Key} in the parameters by the value stored into the multilingual dictionary on depends on the language
     * @param {any} key        key of the label to look for
     * @param {any} parameters list of parameters to include into the message
     * @param {any} language   language to use for the label
     * @returns {string} multilingual label converted into a string value usable
     */
    interpolation( key, parameters, language ) {
        function handleReplacementParameter( currentTable, language ) {
            return function ( expr, key ) {
                try {
                    let value = currentTable.getLabel( language, key );

                    if ( value === null )
                        return expr;

                    return typeof value === 'string' || typeof value === 'number' ? value : expr;
                } catch ( e ) {
                    return expr;
                }
            };
        }

        function handleReplacement( listParameters ) {
            return function ( expr, index ) {
                try {
                    let value = listParameters[index];
                    return typeof value === 'string' || typeof value === 'number' ? value : expr;
                } catch ( e ) {
                    return expr;
                }
            };
        }

        let value = Helper.Label( key, parameters, language );
        language = value.language ? value.language : DSDatabase.Instance.CurrentLanguage;

        let label = this.getLabel( language, value.label );
        if ( !label )
            return value.label;

        let listParameters = [];

        if ( value.parameters && value.parameters.length > 0 ) {
            for ( let parameter of value.parameters ) {
                if ( parameter !== null && parameter !== undefined )
                    listParameters.push( parameter.toString().replace( /{([^{}]*)}/g, handleReplacementParameter( this, language ) ) );
                else
                    listParameters.push( "" );
            }
        }

        return label.replace( /{([^{}]*)}/g, handleReplacement( listParameters ) );
    }

    /**
     * Called when a label changes from the multilingual dictionary (DSDatabase)
     * @param {any} event     event of the update
     * @param {any} table     table name
     * @param {any} id        id of the record corresponding to a label
     * @param {any} oldLabel  old record describing a label
     * @param {any} newLabel  new record describing a label
     */
    onUpdateLabel( event, table, id, oldLabel, newLabel ) {
        for ( let attr in newLabel ) {
            if ( attr.length !== 2 || attr.toUpperCase() !== attr )
                continue;

            if ( newLabel[attr] === oldLabel[attr] )
                continue;

            let key = newLabel.Key;
            let language = attr;

            this.info( "Updating all labels having the key '" + key + "' (" + language + ")" );

            $( "div" ).each( Language.Manager.HandleReplacementKeyLabel( DSDatabase.Instance.CurrentLanguage, language, key ) );
            $( "span" ).each( Language.Manager.HandleReplacementKeyLabel( DSDatabase.Instance.CurrentLanguage, language, key ) );
            $( "input" ).each( Language.Manager.HandleReplacementKeyLabel( DSDatabase.Instance.CurrentLanguage, language, key ) );
            $( "select > option" ).each( Language.Manager.HandleReplacementKeyLabel( DSDatabase.Instance.CurrentLanguage, language, key ) );

            for ( let i = 0; i < this._components.length; i++ ) {
                let currentComponent = this._components[i];

                currentComponent.find( "div" ).each( Language.Manager.HandleReplacementKeyLabel( DSDatabase.Instance.CurrentLanguage, language, key ) );
                currentComponent.find( "span" ).each( Language.Manager.HandleReplacementKeyLabel( DSDatabase.Instance.CurrentLanguage, language, key ) );
                currentComponent.find( "input" ).each( Language.Manager.HandleReplacementKeyLabel( DSDatabase.Instance.CurrentLanguage, language, key ) );
                currentComponent.find( "select > option" ).each( Language.Manager.HandleReplacementKeyLabel( DSDatabase.Instance.CurrentLanguage, language, key ) );
            }

            for ( let listener of Array.toIterable( this._listeners ) ) {
                listener( DSDatabase.Instance.CurrentLanguage, language, key );
            }
        }
    }

    /**
     * Update the current language shown in the screen
     * @param {any} newLanguage new language into the screen
     * @param {any} force       true if the update must be done even if the current language is the new language
     */
    onChangeLanguage( newLanguage, force ) {
        if ( force === undefined )
            force = false;

        if ( DSDatabase.Instance.CurrentLanguage === newLanguage && !force )
            return;

        webix.i18n.setLocale( newLanguage );
        Locale.setLanguage( newLanguage );

        $( Language.Manager.LANGUAGE_ROOT + "#" + DSDatabase.Instance.CurrentLanguage ).removeClass( "selected" );
        DSDatabase.Instance.SelectedLanguage = newLanguage;
        $( Language.Manager.LANGUAGE_ROOT + "#" + newLanguage ).addClass( "selected" );

        this.info( "Translating all labels into '" + newLanguage + "' ..." );

        $( "div" ).each( Language.Manager.HandleReplacementLabel( newLanguage ) );
        $( "span" ).each( Language.Manager.HandleReplacementLabel( newLanguage ) );
        $( "input" ).each( Language.Manager.HandleReplacementLabel( newLanguage ) );
        $( "select > option" ).each( Language.Manager.HandleReplacementLabel( newLanguage ) );

        for ( let i = 0; i < this._components.length; i++ ) {
            let currentComponent = this._components[i];

            currentComponent.find( "div" ).each( Language.Manager.HandleReplacementLabel( newLanguage ) );
            currentComponent.find( "span" ).each( Language.Manager.HandleReplacementLabel( newLanguage ) );
            currentComponent.find( "input" ).each( Language.Manager.HandleReplacementLabel( newLanguage ) );
            currentComponent.find( "select > option" ).each( Language.Manager.HandleReplacementLabel( newLanguage ) );
        }

        for ( let listener of Array.toIterable( this._listeners ) ) {
            listener( newLanguage );
        }
    }

    /**
     * notify the listener if the language changes
     *      onChangeLanguage(newLanguage)
     * @param {any} onChangeLanguage function to call if the language changes
     * @returns {int} the id of the listener added into the manager
     */
    addListener( onChangeLanguage ) {
        this._indexListener++;
        this._listeners[this._indexListener] = onChangeLanguage;
        return this._indexListener;
    }

    /**
     * Remove an existing listener
     * @param {any} id id of the listener to remove
     */
    removeListener( id ) {
        if ( this._listeners[id] === null || this._listeners[id] === undefined )
            return;

        this._listeners.splice( id, 1 );
    }

    /**
     * Constructor
     */
    constructor() {
        super( "LanguageManager" );

        // All labels retrieving by the couple (key.language)
        this._labels = {};

        // All labels already log that it doesn't exist
        this._ignoreLabels = {};

        // List of languages
        this._languages = null;

        // key on the event listener key on updating label
        this._eventOnUpdateKey = null;

        // list of listeners about the changement of language
        this._indexListener = 0;
        this._listeners = [];

        // list of jQuery components
        this._components = [];
    }

    /**
     * @returns {Language.Manager} the instance of the singleton
     */
    static get Instance() {
        if ( !this._instance )
            this._instance = new Language.Manager();

        return this._instance;
    }
};
