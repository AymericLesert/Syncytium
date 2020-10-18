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

webix.i18n.locales["FR"]={
	groupDelimiter:" ",
	groupSize:3,
	decimalDelimiter:",",
	decimalSize:2,

	dateFormat:"%d/%m/%Y",
	timeFormat:"%H:%i",
	longDateFormat:"%d %F %Y",
	fullDateFormat:"%d.%m.%Y %H:%i",

	price:"{obj} €",
	priceSettings:null, //use number defaults
	
	calendar:{
		monthFull:["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
		monthShort:["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aôu", "Sep", "Oct", "Nov", "Déc"],	
		dayFull:["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
        dayShort:["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
		hours: "Heures",
		minutes: "Minutes",
		done:"Fini",
		clear: "Effacer",
		today: "Aujourd'hui"
	},

	controls:{
		select:"Sélectionner",
		invalidMessage:"Valeur d'entrée invalide"
	},
	dataExport:{
		page:"Page",
		of:"sur"
    },
    PDFviewer:{
		of:"sur",
		automaticZoom:"Zoom automatique",
		actualSize:"Taille actuelle",
		pageFit:"Taille de la page",
		pageWidth:"Largeur de la page",
		pageHeight:"Hauteur de page"
    },
    aria:{
		increaseValue:"Augmenter la valeur",
		decreaseValue:"Diminution de la valeur",
		navMonth:["Le mois précédent", "Le mois prochain"],
		navYear:["Année précédente", "L'année prochaine"],
		navDecade:["Décennie précédente", "Suivant décennie"],
		removeItem:"Retirer l'élément",
		pages:["Première page", "Page précédente", "Page suivante", "Dernière page"],
		page:"Page",
		headermenu:"Menu de titre",
		openGroup:"Ouvrir groupe de colonnes ",
		closeGroup:"Fermer groupe de colonnes",
		closeTab:"Fermer tab",
		showTabs:"Montrer plus tabs",
		resetTreeMap:"Revenir à la vue originale",
		navTreeMap:"Niveau supérieur",
		nextTab:"Prochain tab",
		prevTab:"Précédent tab",
		multitextSection:"Ajouter l'élément",
		multitextextraSection:"Retirer l'élément",
		showChart:"Montrer chart",
		hideChart:"Cacher chart",
		resizeChart:"Redimensionner chart"
    }
};