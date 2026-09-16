/* ==========================================================================
   NAVIDA — Schermate dell'altra pagina
   ==========================================================================
   Il questionario vive in index.html, l'app in fase3.html. Il pannello
   "Vai a" deve mostrare le schermate di tutte e due.

   Ordine nell'HTML:
     1. il file dei contenuti dell'ALTRA pagina
     2. questo file: mette da parte quelle schermate
     3. il file dei contenuti di QUESTA pagina (prende il posto giusto)
   ========================================================================== */

(function () {
  'use strict';
  var altra = window.NAVIDA_CONTENT;
  window.NAVIDA_ALTRA_PAGINA = { screens: (altra && altra.screens) || [] };
  window.NAVIDA_CONTENT = undefined;
})();
