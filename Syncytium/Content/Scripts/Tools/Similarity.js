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
 * SIMILARITY TOOLS : Compute a rank for a string value
 */
class Similarity {
    /**
     * Compute the list of pairs of the substrings
     * @param {any} word string to extract the list of pairs
     * @returns {array} list of pairs of the string
     */
    static pairs ( word ) {
        let pairs = [];

        let length = word.length;
        if ( length < 2 )
            return pairs;

        word = word.toUpperCase();
        for ( let i = 0; i < length - 1; i++ )
            pairs.push( word.substr( i, 2 ) );

        pairs.sort( function ( p1, p2 ) { return p1 < p2 ? -1 : p1 > p2 ? 1 : 0; } );

        return pairs;
    }

    /**
     * Compute the similarity between 2 words (value between 0 and 1)
     * @param {any} word1 first word
     * @param {any} word2 second word
     * @returns {double} value of the similarity of 2 words
     */
    static computeWord ( word1, word2 ) {
        let pair1 = Similarity.pairs( word1 );
        if ( pair1.length === 0 )
            return 0;

        let pair2 = Similarity.pairs( word2 );
        if ( pair2.length === 0 )
            return 0;

        if ( word1.length < 2 || word2.length < 2 )
            return 0;

        let cardPair1 = 0, cardPair2 = 0, cardPairs = 0;
        let i = 0, j = 0;

        let length1 = pair1.length, length2 = pair2.length;

        while ( i < length1 && j < length2 ) {
            if ( pair1[i] === pair2[j] ) {
                cardPairs++;
                cardPair1++;
                cardPair2++;
                for ( i++; i < length1 && pair1[i] === pair1[i - 1]; i++ );
                for ( j++; j < length2 && pair2[j] === pair2[j - 1]; j++ );
            } else if ( pair1[i] < pair2[j] ) {
                cardPair1++;
                for ( i++; i < length1 && pair1[i] === pair1[i - 1]; i++ );
            } else {
                cardPair2++;
                for ( j++; j < length2 && pair2[j] === pair2[j - 1]; j++ );
            }
        }

        while ( i < length1 ) {
            cardPair1++;
            for ( i++; i < length1 && pair1[i] === pair1[i - 1]; i++ );
        }

        while ( j < length2 ) {
            cardPair2++;
            for ( j++; j < length2 && pair2[j] === pair2[j - 1]; j++ );
        }

        return 2 * cardPairs / ( cardPair1 + cardPair2 );
    }

    /**
     * Compute the list of words contains into the text
     * @param {any} text string to extract the list of words
     * @returns {array} a list of string representing the words
     */
    static words ( text ) {
        let array = text.toUpperCase().replace( /[&/\\#,+()$~%.'":*?!<>{}]/g, ' ' ).split( ' ' );

        array.sort( function ( w1, w2 ) { return w1 < w2 ? -1 : w1 > w2 ? 1 : 0; } );

        let words = [];
        for ( let i = 0; i < array.length; i++ ) {
            if ( String.isEmptyOrWhiteSpaces( array[i] ) )
                continue;

            if ( i > 0 && array[i] === array[i - 1] )
                continue;

            if ( array[i].length < 2 )
                continue;

            words.push( array[i] );
        }

        return words;
    }

    /**
     * Compute the ranking between a list of keyxwords and a text
     * @param {any} keys list of keywords of the base
     * @param {any} text string in which computed the similarity within the key
     * @returns {double} value of the similarity of the keyword into a text
     */
    static rank ( keys, text ) {
        if ( String.isEmptyOrWhiteSpaces( keys ) || String.isEmptyOrWhiteSpaces( text ) )
            return 0;

        let wordKeys = Similarity.words( keys );
        let wordText = Similarity.words( text );

        let sum = 0;

        for ( let i = 0; i < wordKeys.length; i++ ) {
            // Max rank of the current word within all words included into the text

            let maxRank = 0;

            for ( let j = 0; j < wordText.length && maxRank < 1; j++ ) {
                let rank = Similarity.computeWord( wordKeys[i], wordText[j] );

                if ( rank > maxRank )
                    maxRank = rank;
            }

            sum += maxRank;
        }

        return wordKeys.length === 0 ? 0 : sum / wordKeys.length;
    }

    /**
     * Compute the ranking between a key and a text
     * @param {any} key    keyword of the base
     * @param {any} values list of strings in which computed the similarity within the key
     * @returns {double}   value of the similarity of the keyword into a text
     */
    static ranks ( key, values ) {
        let maxRank = 0;

        for ( let i = 0; i < values.length && maxRank < 1; i++ ) {
            let rank = Similarity.rank( key, values[i] );
            if ( rank > maxRank )
                maxRank = rank;
        }

        return maxRank;
    }
}
