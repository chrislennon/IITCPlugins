// ==UserScript==
// @id             iitc-plugin-polygon-portals-list@chrislennon
// @name           IITC plugin: show list of portals inside a polygon
// @category       Info
// @version        0.1.1.20140515.0004
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://raw.githubusercontent.com/chrislennon/IITCPlugins/master/polygon-portals-list.meta.js
// @downloadURL    https://raw.githubusercontent.com/chrislennon/IITCPlugins/master/polygon-portals-list.user.js
// @description    [jonatkins-2014-05-15-0004] Display a sortable list of all visible portals within a polygon. drawTools Required.
// @require        https://api.tiles.mapbox.com/mapbox.js/plugins/leaflet-pip/v0.0.2/leaflet-pip.js
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @grant          none
// ==/UserScript==


function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
plugin_info.buildName = 'jonatkins';
plugin_info.dateTimeVersion = '20140515.0004';
plugin_info.pluginId = 'polygon-portals-list';
//END PLUGIN AUTHORS NOTE



// PLUGIN START ////////////////////////////////////////////////////////

  /* whatsnew
   * 0.0.1 : initial release, runs with drawtools plugin installed, takes completed polygon(s) and attempts to determine what portals are in a polygon
   *
   * This is a hacked together version of the IITC plugin: show list of portals (v0.1.1.20140510.3203) https://github.com/teo96/iitc-plugins
   *
   * todo : 
   *  -polygons currently handled as "rectanges" only thus outlying portals from polygons can slip in - need to find a way to calculate incusion fast to true polygon
   */

// use own namespace for plugin
window.plugin.polygonportalslist = function() {};

window.plugin.polygonportalslist.listPortals = [];
window.plugin.polygonportalslist.sortBy = 'level';
window.plugin.polygonportalslist.sortOrder = -1;
window.plugin.polygonportalslist.enlP = 0;
window.plugin.polygonportalslist.resP = 0;
window.plugin.polygonportalslist.filter = 0;

var polyLayer;
var displayBounds;

//fill the listPortals array with portals avaliable on the map (level filtered portals will not appear in the table)
window.plugin.polygonportalslist.getPortals = function() {
  //filter : 0 = All, 1 = Res, 2 = Enl
  var retval=false;
  window.plugin.drawTools.drawnItems.eachLayer(function(layer) {
      if (!(layer instanceof L.GeodesicPolygon)) {
          console.log("polygon-portals-list error: layer was not a closed polygon - please use drawTools plugin polgon tool.");
          return;
      }
      else{
            polyLayer = layer.toGeoJSON();
            displayBounds = layer.getBounds();
      }

  $.each(window.portals, function(i, portal) {
    // eliminate offscreen portals (selected, and in padding)
    //if(!displayBounds.contains(portal.getLatLng())) return true;
    console.log(portal.getLatLng());
    console.log(polyLayer);
    console.log(leafletPip);

    var x = portal.getLatLng();
    var lat = x.lat;
    var lng = x.lng;

    console.log(lat);
    console.log(lng);

    console.log(leafletPip.pointInLayer([lng,lat], polyLayer, false));
    console.log(leafletPip.pointInLayer(portal.getLatLng(), polyLayer));
    if(!leafletPip.pointInLayer(portal.getLatLng(), polyLayer)) return true; 
    retval=true;
    var d = portal.options.data;
    var teamN = portal.options.team;

    switch (teamN) {
      case TEAM_RES:
        window.plugin.polygonportalslist.resP++;
        break;
      case TEAM_ENL:
        window.plugin.polygonportalslist.enlP++;
        break;
    }
    var l = window.getPortalLinks(i);
    var f = window.getPortalFields(i);
    var ap = portalApGainMaths(d.resCount, l.in.length+l.out.length, f.length);

    var thisPortal = {
      'portal': portal,
      'guid': i,
      'teamN': teamN, // TEAM_NONE, TEAM_RES or TEAM_ENL
      'team': d.team, // "NEUTRAL", "RESISTANCE" or "ENLIGHTENED"
      'name': d.title || '(untitled)',
      'nameLower': d.title && d.title.toLowerCase(),
      'level': portal.options.level,
      'health': d.health,
      'resCount': d.resCount,
      'img': d.img,
      'linkCount': l.in.length + l.out.length,
      'link' : l,
      'fieldCount': f.length,
      'field' : f,
      'enemyAp': ap.enemyAp,
      'ap': ap,
      'uid': prefix + j.toString(),
    };

  });
  prefix = window.plugin.polygonportalslist.nextChar(prefix);
  });

  //window.plugin.polygonportalslist.refreshlabels(map);
  return retval;
}

window.plugin.polygonportalslist.nextChar = function (c) {
    return String.fromCharCode(c.charCodeAt(0) + 1);
}

window.plugin.polygonportalslist.removeallmarkers = function() {
  window.plugin.polygonportalslist.polyIDs.clearLayers();
}

window.plugin.polygonportalslist.addallmarkers = function() {
  $.each(window.plugin.polygonportalslist.listPortals, function(i, portal) {
    window.plugin.polygonportalslist.createlabel(portal);
    window.plugin.polygonportalslist.refreshlabels(map);
  });
}

window.plugin.polygonportalslist.createlabel = function(portal) {
  var marker = L.marker(portal.portal.getLatLng(), {
    icon: L.divIcon({
      className: 'portal-poly-numbers',
      iconSize: [12, 12],
      html: portal.uid
      }),
    guid: portal.portal.options.guid
  });
  marker.addTo(window.plugin.polygonportalslist.polyIDs);
}

window.plugin.polygonportalslist.refreshlabels = function(map) {
  window.plugin.polygonportalslist.polyIDs.addTo(map);
}

window.plugin.polygonportalslist.displayPL = function() {
  var html = '';
  window.plugin.polygonportalslist.sortBy = 'level';
  window.plugin.polygonportalslist.sortOrder = -1;
  window.plugin.polygonportalslist.enlP = 0;
  window.plugin.polygonportalslist.resP = 0;
  window.plugin.polygonportalslist.filter = 0;
  //resets portal list
  window.plugin.polygonportalslist.listPortals = [];

  if (window.plugin.polygonportalslist.getPortals()) {
    html += window.plugin.polygonportalslist.portalTable(window.plugin.polygonportalslist.sortBy, window.plugin.polygonportalslist.sortOrder,window.plugin.polygonportalslist.filter);
  } else {
    html = '<table class="noPortals"><tr><td>Nothing to show!</td></tr></table>';
  };

  if(window.useAndroidPanes()) {
    $('<div id="portalslist" class="mobile">' + html + '</div>').appendTo(document.body);
  } else {
    dialog({
      html: '<div id="portalslist">' + html + '</div>',
      dialogClass: 'ui-dialog-portalspolygonlist',
      title: 'Portal list: ' + window.plugin.polygonportalslist.listPortals.length + ' ' + (window.plugin.polygonportalslist.listPortals.length == 1 ? 'portal' : 'portals'),
      id: 'portal-list',
      width: 900
    });
  }
}

window.plugin.polygonportalslist.portalTable = function(sortBy, sortOrder, filter) {
  // save the sortBy/sortOrder/filter
  window.plugin.polygonportalslist.sortBy = sortBy;
  window.plugin.polygonportalslist.sortOrder = sortOrder;
  window.plugin.polygonportalslist.filter = filter;

  var portals=window.plugin.polygonportalslist.listPortals;

  //Array sort
  window.plugin.polygonportalslist.listPortals.sort(function(a, b) {
    var retVal = 0;

    var aComp = a[sortBy];
    var bComp = b[sortBy];

    if (aComp < bComp) {
      retVal = -1;
    } else if (aComp > bComp) {
      retVal = 1;
    } else {
      // equal - compare GUIDs to ensure consistent (but arbitrary) order
      retVal = a.guid < b.guid ? -1 : 1;
    }

    // sortOrder is 1 (normal) or -1 (reversed)
    retVal = retVal * sortOrder;
    return retVal;
  });
    
  var sortAttr = window.plugin.polygonportalslist.portalTableHeaderSortAttr;
  var html = window.plugin.polygonportalslist.stats();

    html += 'Click <a onclick="window.plugin.polygonportalslist.addallmarkers()" title="Add">Here</a> to add markers. <br>';
    html += 'Click <a onclick="window.plugin.polygonportalslist.removeallmarkers()" title="Remove">Here</a> to remove markers. <br>';
  html += '<table class="portals">'
    + '<tr class="header">'
    + '<th ' + sortAttr('uid', sortBy, 1, 'uid') + '>#</th>'
    + '<th ' + sortAttr('nameLower', sortBy, -1, 'portalTitle') + '>Portal Name</th>'
    + '<th ' + sortAttr('level', sortBy, -1) + '>Level</th>'
    + '<th ' + sortAttr('teamN', sortBy, 1) + '>Team</th>'
    + '<th ' + sortAttr('health', sortBy, -1) + '>Health</th>'
    + '<th ' + sortAttr('resCount', sortBy, -1) + '>Res</th>'
/*    + '<th ' + sortAttr('linkCount', sortBy, -1) + '>Links</th>'
    + '<th ' + sortAttr('fieldCount', sortBy, -1) + '>Fields</th>'*/
    + '<th ' + sortAttr('enemyAp', sortBy, -1) + '>AP</th>'
//  + '<th ' + sortAttr('guid', sortBy, -1) + '>GUID</th>'
    + '<th ' + sortAttr('lat', sortBy, -1) + '>Lat</th>'
    + '<th ' + sortAttr('lng', sortBy, -1) + '>Lng</th>'
    + '</tr>\n';

  var rowNum = 1;

  $.each(portals, function(ind, portal) {
    
    if (filter === TEAM_NONE || filter === portal.teamN) {

      html += '<tr id="' + portal.guid + '"class="' + (portal.teamN === window.TEAM_RES ? 'res' : (portal.teamN === window.TEAM_ENL ? 'enl' : 'neutral')) + '">'
        + '<td class="rownum">'+portal.uid+'</td>'
        + '<td class="portalTitle" style="">' + window.plugin.polygonportalslist.getPortalLink(portal, portal.guid) + '</td>'
        + '<td class="L' + portal.level +'" style="background-color: '+COLORS_LVL[portal.level]+'">' + portal.level + '</td>'
        + '<td style="text-align:center;">' + portal.team.substr(0,3) + '</td>';

      html += '<td>' + (portal.teamN!=TEAM_NONE?portal.health+'%':'-') + '</td>'
        + '<td>' + portal.resCount + '</td>'
        //+ '<td class="help" title="In: ' + portal.link.in.length + ' Out: ' + portal.link.out.length + '">' + (portal.linkCount?portal.linkCount:'-') + '</td>'
        //+ '<td>' + (portal.fieldCount?portal.fieldCount:'-') + '</td>';

      var apTitle = '';
      if (PLAYER.team == portal.team) {
        apTitle += 'Friendly AP:\t'+portal.ap.friendlyAp+'\n'
                 + '- deploy '+(8-portal.resCount)+' resonator(s)\n'
                 + '- upgrades/mods unknown\n';
      }
      apTitle += 'Enemy AP:\t'+portal.ap.enemyAp+'\n'
               + '- Destroy AP:\t'+portal.ap.destroyAp+'\n'
               + '- Capture AP:\t'+portal.ap.captureAp;

      html += '<td class="help apGain" title="' + apTitle + '">' + digits(portal.ap.enemyAp) + '</td>';

      //html += '<td>' + portal.guid + '</td>';

      var coord = portal.portal.getLatLng();
      
      html += '<td>' + coord.lat + '</td>';
      
      html += '<td>' + coord.lng + '</td>';        
      
      html+= '</tr>';

      rowNum++;
    }
  });
  html += '</table>';

  html += '<div class="disclaimer">Click on portals table headers to sort by that column. '
    + 'Click on <b>All Portals, Resistance Portals, Enlightened Portals</b> to filter.</div>';

  return html;
}

window.plugin.polygonportalslist.stats = function(sortBy) {
  var html = '<table class="teamFilter"><tr>'
    + '<td class="filterAll" style="cursor:pointer"><a href=""></a>All Portals : (click to filter)</td><td class="filterAll">' + window.plugin.polygonportalslist.listPortals.length + '</td>'
    + '<td class="filterRes" style="cursor:pointer" class="sorted">Resistance Portals : </td><td class="filterRes">' + window.plugin.polygonportalslist.resP +' (' + Math.floor(window.plugin.polygonportalslist.resP/window.plugin.polygonportalslist.listPortals.length*100) + '%)</td>'
    + '<td class="filterEnl" style="cursor:pointer" class="sorted">Enlightened Portals : </td><td class="filterEnl">'+ window.plugin.polygonportalslist.enlP +' (' + Math.floor(window.plugin.polygonportalslist.enlP/window.plugin.polygonportalslist.listPortals.length*100) + '%)</td>'
    + '</tr>'
    + '</table>';
  return html;
}

// A little helper function so the above isn't so messy
window.plugin.polygonportalslist.portalTableHeaderSortAttr = function(name, by, defOrder, extraClass) {
  // data-sort attr: used by jquery .data('sort') below
  var retVal = 'data-sort="'+name+'" data-defaultorder="'+defOrder+'" class="'+(extraClass?extraClass+' ':'')+'sortable'+(name==by?' sorted':'')+'"';

  return retVal;
};

// portal link - single click: select portal
//               double click: zoom to and select portal
//               hover: show address
// code from getPortalLink function by xelio from iitc: AP List - https://raw.github.com/breunigs/ingress-intel-total-conversion/gh-pages/plugins/ap-list.user.js
window.plugin.polygonportalslist.getPortalLink = function(portal,guid) {
  var coord = portal.portal.getLatLng();
  var latlng = [coord.lat, coord.lng].join();
  var jsSingleClick = 'window.renderPortalDetails(\''+guid+'\');return false';
  var jsDoubleClick = 'window.zoomToAndShowPortal(\''+guid+'\', ['+latlng+']);return false';
  var perma = '/intel?ll='+coord.lat+','+coord.lng+'&z=17&pll='+coord.lat+','+coord.lng;

  //Use Jquery to create the link, which escape characters in TITLE and ADDRESS of portal
  var a = $('<a>',{
    text: portal.name,
    title: portal.name,
    href: perma,
    onClick: jsSingleClick,
    onDblClick: jsDoubleClick
  })[0].outerHTML;

  return a;
}

window.plugin.polygonportalslist.onPaneChanged = function(pane) {
  if(pane == "plugin-portalslist")
    window.plugin.polygonportalslist.displayPL();
  else
    $("#portalslist").remove()
};

var setup =  function() {
    window.plugin.polygonportalslist.polyIDs = new L.LayerGroup();
  if(window.useAndroidPanes()) {
    android.addPane("plugin-portalslist", "Portals list", "ic_action_paste");
    addHook("paneChanged", window.plugin.polygonportalslist.onPaneChanged);
  } else {
    $('#toolbox').append(' <a onclick="window.plugin.polygonportalslist.displayPL()" title="Display a list of portals in the current Polygon">Polygon list</a>');
  }

  $('head').append('<style>' +
    '#portalslist.mobile {background: transparent; border: 0 none !important; height: 100% !important; width: 100% !important; left: 0 !important; top: 0 !important; position: absolute; overflow: auto; }' +
    '#portalslist table { margin-top:5px; border-collapse: collapse; empty-cells: show; width: 100%; clear: both; }' +
    '#portalslist table td, #portalslist table th {border-bottom: 1px solid #0b314e; padding:3px; color:white; background-color:#1b415e}' +
    '#portalslist table tr.res td { background-color: #005684; }' +
    '#portalslist table tr.enl td { background-color: #017f01; }' +
    '#portalslist table tr.neutral td { background-color: #000000; }' +
    '#portalslist table th { text-align: center; }' +
    '#portalslist table td { text-align: center; }' +
    '#portalslist table.portals td { white-space: nowrap; }' +
    '#portalslist table td.portalTitle { text-align: left;}' +
    '#portalslist table th.sortable { cursor:pointer;}' +
    '#portalslist table th.portalTitle { text-align: left;}' +
    '#portalslist table .portalTitle { min-width: 120px !important; max-width: 240px !important; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }' +
    '#portalslist table .apGain { text-align: right !important; }' +
    '#portalslist .sorted { color:#FFCE00; }' +
    '#portalslist .filterAll { margin-top: 10px;}' +
    '#portalslist .filterRes { margin-top: 10px; background-color: #005684  }' +
    '#portalslist .filterEnl { margin-top: 10px; background-color: #017f01  }' +
    '#portalslist .disclaimer { margin-top: 10px; font-size:10px; }' +
    '.portal-poly-numbers {\
            font-size: 10px;\
            color: #FFFFBB;\
            font-family: monospace;\
            text-align: center;\
            text-shadow: 0 0 0.5em black, 0 0 0.5em black, 0 0 0.5em black;\
            pointer-events: none;\
            -webkit-text-size-adjust:none;\
            border-radius: 50%;\
            background: #ff0000;\
          }'+           
    '</style>');

  // Setup sorting
  $(document).on('click.portalslist', '#portalslist table th.sortable', function() {
    var sortBy = $(this).data('sort');
    // if this is the currently selected column, toggle the sort order - otherwise use the columns default sort order
    var sortOrder = sortBy == window.plugin.polygonportalslist.sortBy ? window.plugin.polygonportalslist.sortOrder*-1 : parseInt($(this).data('defaultorder'));
    $('#portalslist').html(window.plugin.polygonportalslist.portalTable(sortBy,sortOrder,window.plugin.polygonportalslist.filter));
  });

  $(document).on('click.portalslist', '#portalslist .filterAll', function() {
    $('#portalslist').html(window.plugin.polygonportalslist.portalTable(window.plugin.polygonportalslist.sortBy,window.plugin.polygonportalslist.sortOrder,0));
  });
  $(document).on('click.portalslist', '#portalslist .filterRes', function() {
    $('#portalslist').html(window.plugin.polygonportalslist.portalTable(window.plugin.polygonportalslist.sortBy,window.plugin.polygonportalslist.sortOrder,1));
  });
  $(document).on('click.portalslist', '#portalslist .filterEnl', function() {
    $('#portalslist').html(window.plugin.polygonportalslist.portalTable(window.plugin.polygonportalslist.sortBy,window.plugin.polygonportalslist.sortOrder,2));
  });
}

// PLUGIN END //////////////////////////////////////////////////////////


setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);

