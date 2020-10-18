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
 * Master class of the annotations (see DSAnnotationAttribute.cs)
 */
class DSAnnotationAttribute {
    /**
     * This function creates an instance of annotation on depends on the description
     * @param {any} annotation JSON structure describing an annotation
     * @returns {any} an instance of annotation
     */
    static Factory( annotation ) {
        switch ( annotation.Type ) {
            // DSConstraint

            case "ForeignKey":
                return new DSForeignKeyAttribute( annotation.Error, annotation.Table );
            case "Index":
                return new DSIndexAttribute( annotation.Error, annotation.CaseSensitive, annotation.Fields );
            case "Unique":
                return new DSUniqueAttribute( annotation.Error, annotation.CaseSensitive, annotation.Fields );

            // DSControl

            case "Decimal":
                return new DSDecimalAttribute( annotation.Error, annotation.Digit, annotation.Precision, annotation.Unit );
            case "Email":
                return new DSEmailAttribute( annotation.Error );
            case "Key":
                return new DSKeyAttribute( annotation.Error );
            case "Required":
                return new DSRequiredAttribute( annotation.Error );
            case "String":
                return new DSStringAttribute( annotation.Error, annotation.Min, annotation.ErrorMin, annotation.Max, annotation.ErrorMax );

            // DSFormat

            case "DateTime":
                return new DSDateTimeAttribute( annotation.Format );
            case "Mask":
                return new DSMaskAttribute( annotation.Mask );
            case "Sequence":
                return new DSSequenceAttribute(annotation.Key, annotation.Length);
            case "Password":
                return new SyncytiumasswordAttribute();
            case "File":
                return new DSFileAttribute();
        }

        Logger.Instance.error( "DSAnnotationAttribute", "Type '" + annotation.Type + "' not implemented!" );
        return null;
    }

    /**
     * This function creates a list of instances of annotation
     * @param {any} annotations list of annotations
     * @returns {array} a list of an instance of annotation
     */
    static FactoryList( annotations ) {
        let list = [];

        for ( let annotation of Array.toIterable( annotations ) ) {
            let newAnnotation = DSAnnotationAttribute.Factory( annotation );
            if ( newAnnotation )
                list.push( newAnnotation );

            if ( newAnnotation instanceof DSForeignKeyAttribute ) {
                // In case of ForeignKey, it means that the field will be used as a jointure into a sub list

                annotation = { Type: 'Index', Error: '', CaseSensitive: 'True', Fields: null };

                for ( let existingAnnotation of Array.toIterable( annotations ) ) {
                    if ( existingAnnotation.Type === annotation.Type &&
                        existingAnnotation.Error === annotation.Error &&
                        existingAnnotation.CaseSensitive === annotation.CaseSensitive &&
                        ( existingAnnotation.Fields === null || existingAnnotation.Fields === undefined ) ) {
                        annotation = null;
                        break;
                    }
                }

                if ( annotation !== null ) {
                    newAnnotation = DSAnnotationAttribute.Factory( annotation );
                    if ( newAnnotation )
                        list.push( newAnnotation );
                }
            }
        }

        return list;
    }

    /**
     * @returns {string} "Annotation"
     */
    get Type() {
        return "Annotation";
    }

    /**
     * Convert the annotation to a string value
     * @returns {string} a JSON string of the annotation
     */
    toString () {
        return this.Type + " = " + String.JSONStringify( this );
    }

    /**
     * Constructor
     */
    constructor() {
    }
}
