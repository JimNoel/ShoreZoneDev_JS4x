/**
 * Widget version of MapStuff code
 * Modified from JS/MapStuff.js
 * Currently, this is only minimally "widgetized", to ensure that the MapStuff code runs only after the Dojo DOM has been constructed (in code)
 */



let map;
let view;

let szMapServiceLayer;
let faMapServiceLayer;
let ssMapServiceLayer;
let sslMapServiceLayer;

let siteTabs = new Object({tabs: ["sz", "fa", "ss"], currTab: "sz"});
siteTabs.sz = {};
siteTabs.fa = {};
siteTabs.ss = {};

let mapLoading = false;

define([
  "dojo/_base/declare",
  "esri/Basemap",
  "esri/core/watchUtils",
  "esri/Map",
  "esri/views/MapView",
  //"esri/views/SceneView",
  // SceneView produces this error:  GET http://localhost:63342/FDFA6052-1C12-4655-B658-0DBF2414422D/253/aHR0cDovL2pzLmFyY2dpcy5jb20vNC4zL2Vzcmkvd29ya2Vycy9tdXRhYmxlV29ya2VyLmpz 404 (Not Found)
  "esri/layers/MapImageLayer",
  "esri/portal/PortalItem",
  "esri/webmap/Bookmark",
  "esri/widgets/Bookmarks",
  "esri/widgets/Expand",
   "esri/widgets/LayerList",
  "esri/widgets/Legend",
  "esri/widgets/Search",
  "esri/widgets/BasemapGallery",
  "esri/widgets/Home",
  "esri/widgets/Locate",
  "esri/widgets/Popup",
  "esri/tasks/Geoprocessor",
  "esri/tasks/support/Query",
  "esri/tasks/QueryTask",
//  "esri/widgets/Print",
  "noaa/VideoPanelWidget",
  "noaa/PhotoPlaybackWidget",
  "noaa/UnitsPanelWidget",
  "noaa/QueryBasedTablePanelWidget",
  "noaa/ChartPanelWidget",
  "esri/geometry/Extent",
  "esri/geometry/Point",
  "esri/geometry/Polygon",
  "esri/geometry/support/webMercatorUtils",
  "esri/layers/GraphicsLayer",
  "esri/renderers/SimpleRenderer",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/Graphic",
  "dojo/dom",
  "esri/core/Collection",
  "esri/core/Accessor",
  "dojo/domReady!"
], function(declare, Basemap, watchUtils, Map, View, MapImageLayer, PortalItem, Bookmark, Bookmarks, Expand, LayerList, Legend, Search, BasemapGallery, Home, Locate, Popup, Geoprocessor, Query, QueryTask,
              //Print,
            VideoPanelWidget, PhotoPlaybackWidget, UnitsPanelWidget, QueryBasedTablePanelWidget, ChartPanelWidget,
            Extent, Point, Polygon, webMercatorUtils, GraphicsLayer, SimpleRenderer, SimpleMarkerSymbol, Graphic, dom, Collection, Accessor) {

    function addServiceLayers() {
      szMapServiceLayer =  new MapImageLayer(szMapServiceLayerURL,  {id: "szOpLayer", "opacity" : 0.5});
      szMapServiceLayer.when(function() {

      szPhotoWidget = new PhotoPlaybackWidget({
        objName: "szPhotoWidget",
        panelName: "szPhotosPanel",
        panelType: "media",
        contentPaneId: "photoDiv",
        baseName: "photo",
        headerDivName:  "photoHeaderDiv",
        disabledMsgInfix: "photo points",
        disabledMsgDivName: "disabledMsg_photo",
        mapServiceLayer: null,
        noQuery: true,
        trackingSymbolInfo: "assets/images/Camera24X24.png:24:24",
        clickableSymbolType: "point",
        clickableSymbolInfo: {"style":"square", "color":[0,0,255,1], "size":8,     // invisible if 4th value in "color" is 0
          "outline": {color: [ 0, 0, 255, 0 ] }},
        popupTitle: "Photo Point",
        clickableMsg: "Move camera to this location",
        sync_photos: true,
        photoResInsert: "stillphotos_lowres/280_",
        relPathField: "RelPath",
        fileNameField: "StillPhoto_FileName",
        controlData: [
          ['szPhoto_resetBackwardButton', 'Reset to Beginning', 'w_expand.png', 'toStart'],
          ['szPhoto_backwardButton', 'Play Backwards', 'w_left.png', 'playBackward'],
          ['szPhoto_pauseButton', 'Pause', 'w_close_red.png', 'pause'],
          ['szPhoto_ForwardButton', 'Play Forwards', 'w_right.png', 'playForward'],
          ['szPhoto_resetForwardButton', 'Reset to End', 'w_collapse.png', 'toEnd']
        ],
        map: map,
        view: view
      });
      extentDependentWidgets.push(szPhotoWidget);
      szPhotoWidget.resizeImg();
      photoWidgets.push(szPhotoWidget);

      szVideoWidget = new VideoPanelWidget({
        objName: "szVideoWidget",
        panelName: "szVideoPanel",
        sublayerIDs: szSublayerIDs,
        panelType: "media",
        contentPaneId: "videoDiv",
        baseName: "video",
        headerDivName:  "videoHeaderDiv",
        disabledMsgInfix: "video points",
        disabledMsgDivName: "disabledMsg_video",
        //displayDivName: "#videoImageContainer",
        mapServiceLayer: szMapServiceLayer,
        layerName: "1s",
        layerPath: "Video Flightline/1s",

        // TODO:  Set up filter to query subset of points, when full set is greater than the service limit
        //initWhere:  "DateTime_str like '%0'",    // example:  "n*(MP4_Seconds/n)=MP4_Seconds" returns just multiples of n

        spatialRelationship: "contains",
        featureOutFields: ["*"],
        orderByFields: ["Date_Time"],
        trackingSymbolInfo: "assets/images/video24X24.png:24:24",
        clickableSymbolType: "point",
        clickableSymbolInfo: {"style":"circle", "color":[255,255,0,1], "size":3,      //  invisible if 4th value in "color" is 0
          "outline": {color: [ 128, 128, 128, 0 ] }},
        popupTitle: "Video Point",
        clickableMsg: "Move camera to this location",
        syncTo: szPhotoWidget,
        controlData: [
          ['video_resetBackwardButton', 'Reset to Beginning', 'w_expand.png', 'toStart'],
          ['video_backwardButton', 'Play Backwards', 'w_left.png', 'playBackward'],
          ['video_pauseButton', 'Pause', 'w_close_red.png', 'pause'],
          ['video_ForwardButton', 'Play Forwards', 'w_right.png', 'playForward'],
          ['video_resetForwardButton', 'Reset to End', 'w_collapse.png', 'toEnd']
        ],
        map: map,
        view: view
      });
      extentDependentWidgets.push(szVideoWidget);

      szUnitsWidget = new UnitsPanelWidget({
        objName: "szUnitsWidget",
        widgetName: "szUnitsWidget",    // for reference to instance
        tabName: "Units",
        panelType: "table",
        sublayerIDs: szSublayerIDs,
        panelName: "szUnitsPanel",
        contentPaneId: "unitsDiv",
        baseName: "units",
        headerDivName:  "unitsHeaderDiv",
        displayDivName: "unitsContainer",
        disabledMsgInfix: "units",
        disabledMsgDivName: "disabledMsg_units",
        mapServiceLayer: szMapServiceLayer,
        layerName: "Mapped Shoreline",      // "AK_Unit_lines_wAttrs",
        layerPath: "Mapped Shoreline",      // "AK_Unit_lines_wAttrs",
        spatialRelationship: "contains",
        idField: "PHY_IDENT",
        featureOutFields:  ["PHY_IDENT"],     // Other fields will be added based on queries of map service layers
        orderByFields: ["PHY_IDENT"],
        extraOutFields:  ["CMECS_1", "CMECS_2", "CMECS_3", "Length_M", "Slope_calc", "SHORE_PROB", "LOST_SHORE", "Fetch_max", "Wave_Dissipation", "Orient_dir", "Tidal_height", "CVI_Rank"],
        specialFormatting: {      // Special HTML formatting for field values
          CMECS_1: { colWidth: 130 },
          CMECS_2: { colWidth: 130 },
          CMECS_3: { colWidth: 130 }
        },

        showFieldsInPopup: "*",
        //trackingSymbolInfo: "assets/images/video24X24.png:24:24",
        hideMarkersAtStart: true,
        clickableSymbolType: "extent",
        clickableSymbolInfo: {
          color: [ 255, 96, 96, 0.25 ],
          style: "solid",
          outline: null
        },
        highlightSymbolType: "polyline",
        highlightSymbolInfo: {
          color: "red",
          style: "solid",
          width: "4px"
        },
        popupTitle: "ShoreZone Unit",
        clickableMsg: null,
        map: map,
        view: view
      });
      extentDependentWidgets.push(szUnitsWidget);

      showPanelContents("video,photo,units", false);

      siteTabs.sz.widgets = [szPhotoWidget, szVideoWidget, szUnitsWidget];


      /*  TRY:  attempt to catch sublayer visibility change event
      let subLayers = szMapServiceLayer.allSublayers;
      alert(subLayers.length);
      for (let L=0; L<subLayers.length; L++) {
        subLayers.items[L].watch("visible", function(newValue, oldValue, property, subLayer) {
          alert(subLayer.title + " visibility changed");
        });
      };
      /**/

    }, function(error){
        console.log("szMapServiceLayer failed to load:  " + error);
      });

      ssMapServiceLayer = new MapImageLayer(ssMapServiceLayerURL,  {id: "ssOpLayer", opacity: 0.5, listMode: "hide"});
      ssMapServiceLayer.when(function(resolvedVal) {
        //console.log("Shore Station MapServiceLayer loaded.");
        ssMapServiceLayer.visible = false;


        /*  ssWidget def */
        ssWidget = new QueryBasedTablePanelWidget({
          objName: "ssWidget",
          //gotoFlexMsg: "Sorry, Shore Stations has not been implemented yet on this site.  If you would like to open @ on the older Flex site, click 'OK'.",
          title: "Shore Stations",
          sublayerIDs: ssSublayerIDs,
          panelName: "ssPanel",
          panelType: "table",
          contentPaneId: "ssDiv",
          baseName: "ss",
          headerDivName:  "ssHeaderDiv",
          //footerDivName:  "ssFooterDiv",
          tableHeaderTitle: "All Regions",
          displayDivName: "ssContainer",
          disabledMsgDivName: "disabledMsg_ss",
          mapServiceLayer: ssMapServiceLayer,
          dynamicLayerName: true,
          dropDownInfo: [
            { ddName: "Region",
              LayerNameAddOn: "",
              subLayerName: "Regions",
              ddOutFields: ["Region", "RegionalID", "Envelope"],
              orderByFields: ["Region"],
              options: [ { label: "[All Alaska regions]", value: "All", extent: "-19224680, 6821327, -14019624, 11811136" } ],
              SelectedOption: "All",
              whereField: "RegionalID",
              isAlpha: true
            }
          ],
          speciesTableInfo : {
            iconLabel: 'Total Species Data',
            args: 'ssSpTableWidget,"vw_AlaskaSpecies",null,null,"All Regions"'
          },
          currTab: 0,
          tabInfo: [
            {
              tabName: 'Regions',
              tabTitle: 'ShoreStation Regions',
              popupTitle: "ShoreStation Region",
              LayerNameAddOn: 'Regions',
              parentAreaType: '',
              visibleHeaderElements: ['ssTableHeaderTitle', 'ssLabelSpan_featureCount', 'ssCheckboxSpan_showFeatures', 'ssIconSpeciesTable'],
              featureOutFields: ["Envelope", "RegionNumID", "RegionalID", "Region"],
              orderByFields: ["Region"],
              calcFields:  [{name: "SpTableBtn", afterField: "Region"}, {name: "SelRegionBtn", afterField: "SpTableBtn"}],
              specialFormatting: {      // Special HTML formatting for field values
                Envelope: {
                  title:  "",
                  colWidth:  20,
                  plugInFields: ["Envelope"],
                  args: '"{0}"',
                  html:   "<img src='assets/images/i_zoomin.png' onclick='mapStuff.gotoExtent({args})' height='15' width='15' alt=''>"
                },
                RegionNumID: {
                  title:  "Region Id",
                  colWidth:  20
                },
                RegionalID: {
                  title:  "Regional Id",
                  colWidth:  20
                },
                Region: {
                  title:  "Region Name",
                  colWidth:  20
                },
                SpTableBtn: {
                  title:  "Species Data",
                  colWidth:  30,
                  plugInFields: ["RegionalID", "Region"],
                  args: 'ssSpTableWidget,"vw_RegionSpecies",null,"RegionalID=&#039;{0}&#039;","{1}"',
                  html:   "<img src='assets/images/table.png' onclick='mapStuff.openSpeciesTable({args})' height='15' width='15' alt=''>"
                },
                SelRegionBtn: {
                  title:  "Stations",
                  colWidth:  20,
                  plugInFields: ["RegionalID", "Envelope"],
                  args: 'ssWidget,"{0}","{1}"',
                  html:   "<img src='assets/images/start.png' onclick='mapStuff.selectAndZoom({args})' height='15' width='15' alt=''>"
                }
              },
              idField: 'Region',
              subTableDD: "Region",
              //resetDDs:  ["Region", "Locale"],
              clickableSymbolType: "extent",
              clickableSymbolInfo: {
                color: [ 51,51, 204, 0.1 ],
                style: "solid",
                width: "2px"
              },
              //textOverlayPars: null     // IMPORTANT:  Otherwise, will retain previous text overlay settings on tab switch
            },
            {
              tabName: 'Stations',
              subWidgetInfo: ["ssPhotoWidget:station:hasPhotos", "ssProfileWidget:station:hasProfile"],     // name of subwidget : filter field : column to check before running query
              tabTitle: 'ShoreStation Stations',
              popupTitle: "ShoreStation Stations",
              LayerNameAddOn: 'Field Stations',
              parentAreaType: 'Regions',
              visibleHeaderElements: ['ssDropdownSpan_Region', 'ssTableHeaderTitle', 'ssLabelSpan_featureCount', 'ssCheckboxSpan_showFeatures'],
              featureOutFields: ["LocaleConcat", "station", "ExpBio", "CoastalClass", "date_", "hasPhotos", "hasSpecies", "hasProfile"],
              orderByFields: ["station"],
              //calcFields:  [{name: "SpTableBtn", afterField: "hasPhotos"}],
              specialFormatting: {      // Special HTML formatting for field values
  /*
  // TODO: Generate envelope from point coords, or from POINT_X and POINT_Y?
                Envelope: {
                  title:  "",
                  colWidth:  20,
                  plugInFields: ["Envelope"],
                  args: '"{0}"',
                  html:   "<img src='assets/images/i_zoomin.png' onclick='mapStuff.gotoExtent({args})' height='15' width='15' alt=''>"
                },
  */
                LocaleConcat: {
                  title:  "Geographic Name",
                  colWidth:  50
                },
                station: {
                  title:  "Station Id",
                  colWidth:  20
                },
                ExpBio: {
                  title:  "EXP BIO",
                  colWidth:  20
                },
                CoastalClass: {
                  title:  "Coastal Class",
                  colWidth:  20
                },
                date_: {
                  title:  "Date Sampled",
                  colWidth:  20,
                  dateFormat: true
                },
                hasPhotos: {
                  title:  "Photos",
                  colWidth:  10,
                  html:   "<img src='assets/images/Camera24X24.png' class='tableIcon' alt=''>",
                  showWhen: "1"
                },
                hasSpecies: {
                  title:  "Species",
                  colWidth:  10,
                  plugInFields: ["station", "station"],
                  args: 'ssSpTableWidget,"vw_StationSpecies",null,"station=&#039;{0}&#039;","{1}"',
                  html:   "<img src='assets/images/table.png' onclick='mapStuff.openSpeciesTable({args})' class='tableIcon' alt=''>",
                  showWhen: "1"
                },
                hasProfile: {
                  title:  "Profile",
                  colWidth:  10,
                  html:   "<img src='assets/images/graph.png' class='tableIcon' alt=''>",
                  showWhen: "1"
                },
              },
              idField: 'station',
              //subTableDD: "Region",
              //resetDDs:  ["Region", "Locale"],
              clickableSymbolType: "point",
              clickableSymbolInfo: {
                "style":"circle",
                "color":[255,255,255,1.0],
                outline: {  // autocasts as new SimpleLineSymbol()
                  color: [ 0, 0, 0, 1.0 ],
                  width: "0.5px"
                },
                "size":4
              },
            }

          ],

          layerBaseName: "",      // Blank for Shore Stations, since there are no group queries
          // All layers queried for data tables will have names that start with this.  The QueryBasedPanelWidget method runQuery generates the full name
          //   using the current panel info and dropdown info for any dropdowns that have something selected.

          spatialRelationship: null,      // Using null as a flag to not filter spatially
          showFieldsInPopup: "*",

          // TODO: Remove, and use something like setActiveTab in constructor
          clickableSymbolType: "extent",
          clickableSymbolInfo: {
            color: [ 51,51, 204, 0.1 ],
            style: "solid",
            width: "2px"
          },

          hasTextOverlayLayer: true,
          clickableMsg: null
        });
        /* end szWidget def*/

        if (initTab === "ssTab")
          stateNavigator.selectChild(initTab);

        ssSpTableWidget = new QueryBasedTablePanelWidget({
          objName: "ssSpTableWidget",
          title: "Species Data",       // "Shore Stations",
          sublayerIDs: ssSublayerIDs,
          panelName: "ssSpTablePanel",
          panelType: "table",
          draggablePanelId: "ssSpTableDiv",
          contentPaneId: "ssSpTableDiv_content",
          baseName: "ssSpTable",
          headerDivName:  "ssSpTableHeaderDiv",
          //footerDivName:  "ssSpTableFooterDiv",
          featureOutFields: ["SppNameHtml", "Common_name"],
          tableHeaderTitle: "All Regions",
          displayDivName: "ssSpTableContainer",
          mapServiceLayer: ssMapServiceLayer,
          dynamicLayerName: true,
          dropDownInfo: [
            /*
                      { ddName: "Region",
                        LayerNameAddOn: "",
                        totalsLayerNameAddOn: "Regions",
                        subLayerName: "Regions",
                        ddOutFields: ["RegionName", "RegionID", "Envelope"],
                        orderByFields: ["RegionName"],
                        options: [ { label: "[All Alaska regions]", value: "All", extent: "-19224680, 6821327, -14019624, 11811136" } ],
                        SelectedOption: "All",
                        whereField: "RegionID"
                      },
                      { ddName: "Locale",
                        LayerNameAddOn: "",
                        totalsLayerNameAddOn: "Locales",
                        subLayerName: "vw_CatchStats_Locales",    //"Locales (area)",
                        ddOutFields: ["Locale", "LocaleID", "Envelope"],
                        orderByFields: ["Locale"],
                        options: [ { label: "[All]", value: "All" } ],
                        SelectedOption: "All",
                        whereField: "LocaleID"
                      },
                      { ddName: "Species",
                        LayerNameAddOn: "Species",
                        totalsLayerNameAddOn: "Species",
                        subLayerName: "vw_SpCatch_allAK",
                        ddOutFields: ["Sp_CommonName", "SpCode"],
                        orderByFields: ["Sp_CommonName"],
                        options: [ { label: "[All]", value: "All" } ],
                        SelectedOption: "All",
                        whereField: "SpCode",
                        isAlpha: true
                      }
            */
          ],
          currTab: 0,
          tabName: 'Species',     // No tabs, actually, but this provides a name for feature counts
          orderByFields: ["SppNameHtml"],
          visibleHeaderElements: ['ssSpTableLabelSpan_featureCount'],
          specialFormatting: {      // Special HTML formatting for field values
            SppNameHtml: {
              title: "Species",
              colWidth: 200
            },
            Common_name: {
              title: "Common Name",
              colWidth: 100
            }
          },
          /*
                  tabInfo: [
                    {
                      tabName: 'Regions',
                      tabTitle: 'Fish Atlas Regions',
                      LayerNameAddOn: 'Regions',
                      visibleHeaderElements: [],
                      specialFormatting: {      // Special HTML formatting for field values
                      },
                      idField: 'Region'
                    },
                    {
                      tabName: 'Locales',
                      tabTitle: 'Fish Atlas Locales',
                      LayerNameAddOn: 'Locales',
                      visibleHeaderElements: [],
                      specialFormatting: {      // Special HTML formatting for field values
                      },
                      idField: 'Locale'
                    },
                    {
                      tabName: 'Sites',
                      tabTitle: 'Fish Atlas Sites',
                      LayerNameAddOn: 'Sites',
                      visibleHeaderElements: [],
                      idField: 'Site'
                    }
                    ],
          */
          layerBaseName: "vw_CatchStats_",      // All layers queried for data tables will have names that start with this.  The QueryBasedPanelWidget method runQuery generates the full name
          //   using the current panel info and dropdown info for any dropdowns that have something selected.
          //totalsBaseName: "vw_CatchStats_",   // When specified, use this as the base name for totals
          spatialRelationship: null,      // Using null as a flag to not filter spatially
          noGeometry: true
        });

        // Shore Station photos
        ssPhotoWidget = new PhotoPlaybackWidget({
          objName: "ssPhotoWidget",
          sublayerIDs: ssSublayerIDs,
          panelName: "ssPhotosPanel",
          panelType: "media",
          contentPaneId: "ssPhotosDiv",
          baseName: "ssPhoto",
          headerDivName:  "ssPhotoHeaderDiv",
          //displayDivName: "ssPhotoContainer",
          disabledMsgInfix: "photo points",
          disabledMsgDivName: "disabledMsg_ssPhoto",
          defaultDisabledMsg: 'Station photos can be seen by going to the "ShoreStation Stations" tab and clicking on a row having a "photo" icon in the Photos column.',
          noDataMsg: "No photos available for this station.",
          mapServiceLayer: ssMapServiceLayer,
          layerName: "GVDATA_STNPHOTOS",
          featureOutFields: ["*"],
          photoServer: "https://alaskafisheries.noaa.gov/mapping/shorestationdata/",      // TODO: Set up so this info appears near top of GlobarVars.js
          relPathField: "FileLocation",
          fileNameField: "ImageFileName",
          captionFields: ["CaptionText", "Description"],
          noGeometry: true,
          controlData: [
            ['ssPhoto_resetBackwardButton', 'Reset to Beginning', 'w_expand.png', 'toStart'],
            ['ssPhoto_backwardButton', 'Previous Photo', 'backward.png', 'playBackward'],
            ['ssPhoto_pauseButton', 'Pause', 'w_close_red.png', 'pause'],
            ['ssPhoto_ForwardButton', 'Next Photo', 'forward.png', 'playForward'],
            ['ssPhoto_resetForwardButton', 'Reset to End', 'w_collapse.png', 'toEnd']
          ]
        });
        ssPhotoWidget.resizeImg();
        photoWidgets.push(ssPhotoWidget);

        // Shore Station profiles
        ssProfileWidget = new ChartPanelWidget({
          objName: "ssProfileWidget",
          sublayerIDs: ssSublayerIDs,
          panelName: "ssProfilesPanel",
          panelType: "chart",
          contentPaneId: "ssChartsDiv",
          baseName: "ssProfile",
          headerDivName:  "ssProfileHeaderDiv",
          displayDivName: "ssProfileContainer",
          disabledMsgInfix: "profiles",
          disabledMsgDivName: "disabledMsg_ssProfile",
          defaultDisabledMsg: 'Station profiles can be seen by going to the "ShoreStation Stations" tab and clicking on a row having a "graph" icon in the Profiles column.',
          noDataMsg: "No profile available for this station.",
          mapServiceLayer: ssMapServiceLayer,
          layerName: "SHORESTATIONS_STATIONPROFILE_FLAT",
          featureOutFields: ["*"],
          orderByFields: ["Point"],
          titleTemplate: "Shore Station: {0}",
          titleField: "station",
          noGeometry: true,
        });

        siteTabs.ss.widgets = [ssWidget, ssPhotoWidget, ssProfileWidget];
      }, function(error){
        console.log("Shore Station MapServiceLayer failed to load:  " + error);
      });

      faMapServiceLayer = new MapImageLayer(faMapServiceLayerURL,  {id: "faOpLayer", opacity: 0.5, listMode: "hide"});
      faMapServiceLayer.when(function() {
        //console.log("Fish Atlas MapServiceLayer loaded.");
        faMapServiceLayer.visible = false;

        faWidget = new QueryBasedTablePanelWidget({
          objName: "faWidget",
          title: "Fish Atlas",
          sublayerIDs: faSublayerIDs,
          panelName: "faPanel",
          panelType: "table",
          contentPaneId: "faDiv",
          baseName: "fa",
          headerDivName:  "faHeaderDiv",
          footerDivName:  "faFooterDiv",
          totalOutFields: ["Hauls", "Species", "Catch"],
          tableHeaderTitle: "All Regions",
          displayDivName: "faContainer",
          disabledMsgDivName: "disabledMsg_fa",
          mapServiceLayer: faMapServiceLayer,
          mapServiceSublayers: ["Regions", "Locales", "Sites"],
          dynamicLayerName: true,
          dropDownInfo: [
            { ddName: "Region",
              LayerNameAddOn: "",
              totalsLayerNameAddOn: "Regions",
              subLayerName: "Regions",
              ddOutFields: ["RegionName", "RegionID", "Envelope"],
              orderByFields: ["RegionName"],
              options: [ { label: "[All Alaska regions]", value: "All", extent: "-19224680, 6821327, -14019624, 11811136" } ],
              SelectedOption: "All",
              whereField: "RegionID"
            },
            { ddName: "Locale",
              LayerNameAddOn: "",
              totalsLayerNameAddOn: "Locales",
              subLayerName: "vw_CatchStats_Locales",    //"Locales (area)",
              ddOutFields: ["Locale", "LocaleID", "Envelope"],
              orderByFields: ["Locale"],
              options: [ { label: "[All]", value: "All" } ],
              SelectedOption: "All",
              whereField: "LocaleID"
            },
            { ddName: "Habitat",
              LayerNameAddOn: "Habitats",
              totalsLayerNameAddOn: "Habitats",
              options: [
                { label: "All", value: "All" },
                { label: "Bedrock", value: "Bedrock" },
                { label: "Eelgrass", value: "Eelgrass" },
                { label: "Kelp", value: "Kelp" },
                { label: "Sand-Gravel", value: "Sand-Gravel" }
              ],
              SelectedOption: "All",
              whereField: "Habitat",
              isAlpha: true
            },
            { ddName: "Species",
              LayerNameAddOn: "Species",
              totalsLayerNameAddOn: "Species",
              subLayerName: "vw_SpCatch_allAK",
              ddOutFields: ["Sp_CommonName", "SpCode"],
              orderByFields: ["Sp_CommonName"],
              options: [ { label: "[All]", value: "All" } ],
              SelectedOption: "All",
              whereField: "SpCode",
              isAlpha: true
            }
          ],
          speciesTableInfo : {
            iconLabel: 'Total Fish Catch',
            args: 'faSpTableWidget,"vw_CatchStats_Species","vw_CatchStats_",null,"All Regions"'
          },
          currTab: 0,
          featureOutFields: ["Envelope", "Region", "Hauls", "Species", "Catch", "RegionID"],
          tabInfo: [
            {
              tabName: 'Regions',
              tabTitle: 'Fish Atlas Regions',
              popupTitle: "Fish Atlas Region",
              LayerNameAddOn: 'Regions',
              parentAreaType: '',
              visibleHeaderElements: ['faTableHeaderTitle', 'faDropdownSpan_Habitat', 'faLabelSpan_featureCount', 'faCheckboxSpan_showFeatures', 'faIconSpeciesTable'],
              featureOutFields: ["Envelope", "Region", "Hauls", "Species", "Catch", "RegionID"],
              calcFields:  [{name: "SelRegionBtn", afterField: "RegionID"}],
              orderByFields: ["Region"],
              specialFormatting: {      // Special HTML formatting for field values
                Envelope: {
                  title:  "",
                  colWidth:  10,
                  plugInFields: ["Envelope"],
                  args: '"{0}"',
                  html:   "<img src='assets/images/i_zoomin.png' onclick='mapStuff.gotoExtent({args})' height='15' width='15' alt=''>"
                },
                Hauls: {
                  colWidth: 20,
                  useCommas: true
                },
                Species: {
                  colWidth: 20,
                  useCommas: true
                },
                Catch: {
                  colWidth: 20,
                  useCommas: true
                },
                RegionID: {
                  title:  "Fish Catch",
                  colWidth:  30,
                  plugInFields: ["RegionID", "Region"],
                  args: 'faSpTableWidget,"vw_CatchStats_RegionsSpecies","vw_CatchStats_Regions","RegionID={0}","{1}"',
                  html:   "<img src='assets/images/table.png' onclick='mapStuff.openSpeciesTable({args})' height='15' width='15' alt=''>"
                },
                SelRegionBtn: {
                  title:  "Locales",
                  colWidth:  20,
                  plugInFields: ["RegionID", "Envelope"],
                  args: 'faWidget,{0},"{1}"',
                  html:   "<img src='assets/images/start.png' onclick='mapStuff.selectAndZoom({args})' height='15' width='15' alt=''>"
                }
              },
              idField: 'Region',
              subTableDD: "Region",
              //resetDDs: [0, 1],      //["Region", "Locale"],
              clickableSymbolType: "extent",
              clickableSymbolInfo: {
                color: [ 51,51, 204, 0.1 ],
                style: "solid",
                width: "2px"
              },
              mapServiceSublayerVisibility: [false, false, true]
              //textOverlayPars: null     // IMPORTANT:  Otherwise, will retain previous text overlay settings on tab switch
            },
            {
              tabName: 'Locales',
              tabTitle: 'Fish Atlas Locales',
              popupTitle: "Fish Atlas Locale",
              LayerNameAddOn: 'Locales',
              parentAreaType: 'Regions',
              visibleHeaderElements: ['faDropdownSpan_Region', 'faDropdownSpan_Habitat', 'faLabelSpan_featureCount', 'faCheckboxSpan_showFeatures'],
              featureOutFields: ["Envelope", "Region", "MapID", "Locale", "Hauls", "Species", "Catch", "LocaleID"],
              calcFields:  [{name: "SelLocaleBtn", afterField: "LocaleID"}],
              orderByFields: ["Region", "Locale"],
              specialFormatting: {      // Special HTML formatting for field values
                Envelope: {
                  title:  "",
                  colWidth:  10,
                  plugInFields: ["Envelope"],
                  args: '"{0}"',
                  html:   "<img src='assets/images/i_zoomin.png' onclick='mapStuff.gotoExtent({args})' height='15' width='15' alt=''>"
                },
                MapID: {
                  colWidth: 20                },
                Hauls: {
                  colWidth: 20,
                  useCommas: true
                },
                Species: {
                  colWidth: 20,
                  useCommas: true
                },
                Catch: {
                  colWidth: 20,
                  useCommas: true
                },
                LocaleID: {
                  title:  "Fish Catch",
                  colWidth:  20,
                  plugInFields: ["LocaleID", "Locale"],
                  args: 'faSpTableWidget,"vw_CatchStats_LocalesSpecies","vw_CatchStats_Locales","LocaleID={0}","{1}"',
                  html:   "<img src='assets/images/table.png' onclick='mapStuff.openSpeciesTable({args})' height='15' width='15' alt=''>"
                },
                SelLocaleBtn: {
                  title:  "Sites",
                  colWidth:  20,
                  plugInFields: ["LocaleID", "Envelope"],
                  args: 'faWidget,{0},"{1}"',
                  html:   "<img src='assets/images/start.png' onclick='mapStuff.selectAndZoom({args})' height='15' width='15' alt=''>"
                }
              },
              idField: 'Locale',
              subTableDD: "Locale",
              //resetDDs: [1],      //["Region", "Locale"],
              clickableSymbolType: "point",
              clickableSymbolInfo: {
                style:"square",
                color:[255,255,255,1.0],
                outline: {  // autocasts as new SimpleLineSymbol()
                  color: [ 128, 128, 128, 1.0 ],
                  width: "0.5px"
                },
                size:12
              },
              textOverlayPars: {
                type: "text",  // autocasts as new TextSymbol()
                color: "black",
                verticalAlignment: "middle",
                font: {  // autocast as new Font()
                  size: 8,
                  family: "arial",
                  //weight: "bolder"
                }
              },
              textOverlayField: "MapID",
            },
            {
              tabName: 'Sites',
              subWidgetInfo: ["faPhotoWidget:SiteID:PhotoCount"],     // name of subwidget : filter field : column to check before running query
              tabTitle: 'Fish Atlas Sites',
              popupTitle: "Fish Atlas Site",
              LayerNameAddOn: 'Sites',
              parentAreaType: 'Locales',
              visibleHeaderElements: [/*'faDropdownSpan_Region',*/ 'faDropdownSpan_Locale', 'faDropdownSpan_Habitat', 'faDropdownSpan_Species', 'faLabelSpan_featureCount', 'faCheckboxSpan_showFeatures'],
              featureOutFields: ["Envelope", "Region", "Locale", "Site", "Latitude", "Longitude", "Habitat", "Hauls", "Species", "Catch", "SiteID", "PhotoCount"],
              calcFields:  [{name: "FishCatch", afterField: "SiteID"}],
              orderByFields: ["Region", "Locale", "Site"],
              specialFormatting: {      // Special HTML formatting for field values
                Envelope: {     //TODO:  For Sites, Envelope is null.  Replace with set-sized envelope centered on the point
                  title:  "",
                  colWidth:  20,
                  plugInFields: ["Envelope"],
                  args: '"{0}"',
                  html:   "<img src='assets/images/i_zoomin.png' onclick='mapStuff.gotoExtent({args})' height='15' width='15' alt=''>"
                },
                Latitude: {
                  colWidth: 50,
                  numDecimals: 4
                },
                Longitude: {
                  colWidth: 50,
                  numDecimals: 4
                },
                Hauls: {
                  colWidth: 50,
                  useCommas: true
                },
                Species: {
                  colWidth: 50,
                  useCommas: true
                },
                Catch: {
                  colWidth: 50,
                  useCommas: true
                },
                FishCatch: {
                  title:  "Fish Catch",
                  colWidth:  60,
                  plugInFields: ["SiteID", "Site"],
                  args: 'faSpTableWidget,"vw_CatchStats_SitesSpecies","vw_CatchStats_Sites","SiteID={0}","{1}"',
                  html:   "<img src='assets/images/table.png' onclick='mapStuff.openSpeciesTable({args})' height='15' width='15' alt=''>"
                },
                SiteID: {
                  hidden: true
                },
                PhotoCount: {
                  title:  "Photos",
                  colWidth:  50,
                  html:   "<img src='assets/images/Camera24X24.png' class='tableIcon' alt=''>",
                  showWhen: 1
                }
              },
              idField: 'SiteID',
              clickableSymbolType: "point",
              clickableSymbolInfo: {
                "style":"circle",
                "color":[255,255,255,1.0],
                outline: {  // autocasts as new SimpleLineSymbol()
                  color: [ 0, 0, 0, 1.0 ],
                  width: "0.5px"
                },
                "size":4
              },
              renderingInfo: {
                field: "Habitat",
                uniqueColors: {
                  "Bedrock": "blue",
                  "Eelgrass": "green",
                  "Kelp": "red",
                  "Sand-Gravel": "yellow"
                },
              }

            },
            {
              tabName: 'Temperature',
              tabTitle: 'Temperature Data',
              popupTitle: "Thermograph",
              LayerNameAddOn: 'Temperature',
              featureOutFields: ["Region", "Hauls", "Species", "Catch"],
              idField: 'Region'
            },
            {
              tabName: 'Eelgrass',
              tabTitle: 'Eelgrass Data',
              popupTitle: "Eelgrass Bed",
              LayerNameAddOn: 'Eelgrass',
              featureOutFields: ["Region", "Hauls", "Species", "Catch"],
              idField: 'Region'
            }
          ],
          layerBaseName: "vw_CatchStats_",      // All layers queried for data tables will have names that start with this.  The QueryBasedPanelWidget method runQuery generates the full name
                                                //   using the current panel info and dropdown info for any dropdowns that have something selected.
          spatialRelationship: null,      // Using null as a flag to not filter spatially
          showFieldsInPopup: "*",

          // TODO: Remove, and use something like setActiveTab in constructor
          clickableSymbolType: "extent",
          clickableSymbolInfo: {
            color: [ 51,51, 204, 0.1 ],
            style: "solid",
            width: "2px"
          },

          hasTextOverlayLayer: true,
          clickableMsg: null
        });

        if (initTab === "faTab")
          stateNavigator.selectChild(initTab);

        faSpTableWidget = new QueryBasedTablePanelWidget({
          objName: "faSpTableWidget",
          title: "Fish Catch",
          sublayerIDs: faSublayerIDs,
          panelName: "faSpTablePanel",
          panelType: "table",
          draggablePanelId: "faSpTableDiv",
          contentPaneId: "faSpTableDiv_content",
          baseName: "faSpTable",
          headerDivName:  "faSpTableHeaderDiv",
          footerDivName:  "faSpTableFooterDiv",
          featureOutFields: ["Sp_CommonName", "Catch", "AvgFL", "Count_measured"],
          totalOutFields: ["Catch", "Count_measured"],
          tableHeaderTitle: "All Regions",
          displayDivName: "faSpTableContainer",
          mapServiceLayer: faMapServiceLayer,
          dynamicLayerName: true,
          dropDownInfo: [
            /*
                      { ddName: "Region",
                        LayerNameAddOn: "",
                        totalsLayerNameAddOn: "Regions",
                        subLayerName: "Regions",
                        ddOutFields: ["RegionName", "RegionID", "Envelope"],
                        orderByFields: ["RegionName"],
                        options: [ { label: "[All Alaska regions]", value: "All", extent: "-19224680, 6821327, -14019624, 11811136" } ],
                        SelectedOption: "All",
                        whereField: "RegionID"
                      },
                      { ddName: "Locale",
                        LayerNameAddOn: "",
                        totalsLayerNameAddOn: "Locales",
                        subLayerName: "vw_CatchStats_Locales",    //"Locales (area)",
                        ddOutFields: ["Locale", "LocaleID", "Envelope"],
                        orderByFields: ["Locale"],
                        options: [ { label: "[All]", value: "All" } ],
                        SelectedOption: "All",
                        whereField: "LocaleID"
                      },
                      { ddName: "Species",
                        LayerNameAddOn: "Species",
                        totalsLayerNameAddOn: "Species",
                        subLayerName: "vw_SpCatch_allAK",
                        ddOutFields: ["Sp_CommonName", "SpCode"],
                        orderByFields: ["Sp_CommonName"],
                        options: [ { label: "[All]", value: "All" } ],
                        SelectedOption: "All",
                        whereField: "SpCode",
                        isAlpha: true
                      }
            */
          ],
          currTab: 0,
          tabName: 'Species',     // No tabs, actually, but this provides a name for feature counts
          orderByFields: ["Catch DESC"],
          visibleHeaderElements: ['faSpTableLabelSpan_featureCount'],
          specialFormatting: {      // Special HTML formatting for field values
            Sp_CommonName: {
              title: "Species",
              colWidth: 200
            },
            Catch: {
              title: "Catch",
              colWidth: 80,
              useCommas: true
            },
            AvgFL: {
              title: "Average Length",
              colWidth: 120,
              numDecimals: 1
            },
            Count_measured: {
              title: "# Measured",
              colWidth: 120,
              useCommas: true
            },
          },
  /*
          tabInfo: [
            {
              tabName: 'Regions',
              tabTitle: 'Fish Atlas Regions',
              LayerNameAddOn: 'Regions',
              visibleHeaderElements: [],
              specialFormatting: {      // Special HTML formatting for field values
              },
              idField: 'Region'
            },
            {
              tabName: 'Locales',
              tabTitle: 'Fish Atlas Locales',
              LayerNameAddOn: 'Locales',
              visibleHeaderElements: [],
              specialFormatting: {      // Special HTML formatting for field values
              },
              idField: 'Locale'
            },
            {
              tabName: 'Sites',
              tabTitle: 'Fish Atlas Sites',
              LayerNameAddOn: 'Sites',
              visibleHeaderElements: [],
              idField: 'Site'
            }
            ],
  */
          layerBaseName: "vw_CatchStats_",      // All layers queried for data tables will have names that start with this.  The QueryBasedPanelWidget method runQuery generates the full name
          //   using the current panel info and dropdown info for any dropdowns that have something selected.
          //totalsBaseName: "vw_CatchStats_",   // When specified, use this as the base name for totals
          spatialRelationship: null,      // Using null as a flag to not filter spatially
          noGeometry: true
        });

        // Fish Atlas photos
        faPhotoWidget = new PhotoPlaybackWidget({
                    objName: "faPhotoWidget",
                    sublayerIDs: faSublayerIDs,
                    panelName: "faPhotosPanel",
                    panelType: "media",
                    contentPaneId: "faPhotosDiv",
                    baseName: "faPhoto",
                    headerDivName:  "faPhotoHeaderDiv",
                    disabledMsgInfix: "photo points",
                    disabledMsgDivName: "disabledMsg_faPhoto",
                    defaultDisabledMsg: 'Site photos can be seen by going to the "Fish Atlas Sites" tab and clicking on a row having a "photo" icon in the Photos column.',
                    noDataMsg: "No photos available for this site.",
                    mapServiceLayer: faMapServiceLayer,
                    layerName: "Photos_Sites",
                    featureOutFields: ["*"],
                    photoServer: "https://alaskafisheries.noaa.gov/mapping/FishAtlasData/SitePhotos_ReducedSize/",      // TODO: Set up so this info appears near top of GlobarVars.js
                    //relPathField: "FileLocation",
                    fileNameField: "SitePhoto1",
                    captionFields: ["GenericCaption"],
                    noGeometry: true,
                    controlData: [
                      ['faPhoto_resetBackwardButton', 'Reset to Beginning', 'w_expand.png', 'toStart'],
                      ['faPhoto_backwardButton', 'Previous Photo', 'backward.png', 'playBackward'],
                      ['faPhoto_pauseButton', 'Pause', 'w_close_red.png', 'pause'],
                      ['faPhoto_ForwardButton', 'Next Photo', 'forward.png', 'playForward'],
                      ['faPhoto_resetForwardButton', 'Reset to End', 'w_collapse.png', 'toEnd']
                    ]
        });
        faPhotoWidget.resizeImg();
        photoWidgets.push(faPhotoWidget);
        siteTabs.fa.widgets = [faWidget, faPhotoWidget];

      }, function(error){
        console.log("Fish Atlas MapServiceLayer failed to load:  " + error);
      });

      sslMapServiceLayer = new MapImageLayer(sslMapServiceLayerURL, {id: "sslOpLayer", "opacity" : 0.5});

      serviceLayers = [sslMapServiceLayer, ssMapServiceLayer, faMapServiceLayer, szMapServiceLayer];
      llServiceLayers = [sslMapServiceLayer, szMapServiceLayer];
    }


/*
//Might eventually use this function, if 3D option is added
  function sceneViewExtent(view, m) {
    // Calculate true extent of tilted 3D view
    // view is the SceneView being used
    // m is an optional margin, in pixels
    // Query.geometry can be a Polygon, so doesn't have to be a right-angled rectangle like extent?
    if (m === undefined)
      m = 0;
    //console.log(view.extent);
    let maxX = view.container.offsetWidth;
    let maxY = view.container.offsetHeight;
    let screenPoints = [[m,m], [maxX-m,m], [maxX-m,maxY-m], [m,maxY-m]];
    let mapPoints = [];
    for (let p=0; p<screenPoints.length; p++) {
      let screenPoint = new Point({x: screenPoints[p][0], y: screenPoints[p][1]});
      let mapPoint = view.toMap(screenPoint);     // These are the points I want to use to get true extent
      if (!mapPoint)
        return null;
      let geogPoint = webMercatorUtils.webMercatorToGeographic(mapPoint);
      mapPoints.push([mapPoint.x, mapPoint.y, mapPoint.z]);
    }
    mapPoints.push(mapPoints[0]);
    let newPolygon = new Polygon(mapPoints);
    return newPolygon;
  }
*/

  function handleExtentChange(newExtent) {
    // For 3D, change newExtent to Polygon of tilted view extent
    // If using MapView (2D), comment out these lines
    //let extent3d = sceneViewExtent(view, 200);
    //let extent3d_geog = webMercatorUtils.webMercatorToGeographic(extent3d);


/*
    //JN  Works, times out at 60s (~1M records).
      this.prequeryTask = new QueryTask(szMapServiceLayerURL + "/2");
      let maxNum = 6000;
      console.log(new Date() + ":  Getting count of video points...");
      this.prequeryTask.executeForCount({
        spatialRelationship: "contains",
        geometry: view.extent,
        num: maxNum
      }).then(function(results){
        console.log(new Date() + ":  Received response (video point count)");
        if (results===maxNum) {
          console.log(this.baseName + ":  max features (" + maxNum + ") returned.");
        } else {
          console.log(results + " features returned");
        }
      }.bind(this), function(error) {
        console.log(new Date() + ":  QueryTask failed.");
      }.bind(this));
*/


    //OBS?  lastExtent = newExtent;
/*
    if (draggingSplitter)      // Don't do if splitter is being dragged
      return;
*/
    featureRefreshDue = (newExtent.width/1000 < maxExtentWidth);
    if (lock_points)      // If point set is locked,
      return;             //    then don't reset or query new points
    if (settings.autoRefresh) {
      refreshFeatures();
/*
      resetCurrentFeatures();
      mapLoading = true;
      if (featureRefreshDue) {    // newExtent.width/1000 < maxExtentWidth
        if (szVideoWidget)
          szVideoWidget.runQuery(newExtent);         // 3D: use extent3d?
        if (szUnitsWidget)
          szUnitsWidget.runQuery(newExtent);         // 3D: use extent3d?
      }
*/
    } else {
        setRefreshButtonVisibility(featureRefreshDue);
    }

    if (bookmarkSelected) {
      bookmarkSelected = false;
      return;
    }
    let km = Math.round(newExtent.width/1000) + " km";
    let bookmark = new Bookmark({name: savedExtentsWidget.bookmarks.items.length + ":" + km, extent: newExtent});
    //bookmark.thumbnail = "assets/images/noaa_wb.png";
    savedExtentsWidget.bookmarks.add(bookmark);       // TODO: Successfully initializes with initial extent, but this is lost because bookmarks array is subsequently reset
    currentBookmarkNumber = savedExtentsWidget.bookmarks.length -1;
  }

  function addMapWatchers() {
    view.when(function() {
      //searchWidget.activeSource.filter = {geometry: view.extent};
      //homeExtent = view.extent;
      map.basemap = startBasemap;   //HACK:  Because inital basemap setting of "oceans" messes up initial extent and zooming
      let moveButtonAction = {title: "Move the camera", id: "move-camera"};
      let p = view.popup;     // new Popup();
      if (popupsDocked) {
        p.dockEnabled = true;
        p.dockOptions = {position: "bottom-right" };
      }
      p.actions.removeAll();      // not working
      p.actions.push(moveButtonAction);
      p.on("trigger-action", function(event){
        if (event.action.id === "move-camera") {
          if (currentWidgetController)
            currentWidgetController.moveButtonPressHandler(currentHoveredGraphic.attributes);
        }
      });
      //view.popup = p;     // if using new popup
    });

    view.watch("extent", function(newExtent, oldExtent, property, theView) {
      if (theView.interacting || theView.resizing)    // Bypass if panning or using mouse wheel.  In this case, the watch on "interacting" (below) will kick in when the interaction is complete
        return;
      if (theView.animation && theView.animation.state==="running")      // Wait until extent change is complete
        return;
      handleExtentChange(newExtent);
    });

    view.watch("interacting", function(isInteracting, oldValue, property, object) {
      if (isInteracting)
        return;
      handleExtentChange(view.extent);
    });

    view.watch("resizing", function(isResizing, oldValue, property, object) {
      if (isResizing)
        resizeWidgets();
    });

    /* Suggestion for repositioning map popup
    view.popup.watch("visible", function() {
      setTimeout(function(){
        view.popup.reposition();
      }, 500);
    });
    */

    // Handle click events:  Check for mouse over graphic features
    // Create a symbol for rendering the graphic
    let zoomRectFillSymbol = {
      type: "simple-fill", // autocasts as new SimpleFillSymbol()
      color: [227, 0, 0, 0.2],
      outline: { // autocasts as new SimpleLineSymbol()
        color: [255, 0, 0],
        width: 1
      }
    };

    let extentGraphic = null;
    let origin = null;
    view.on('drag', [], function(e){
      if (panning)
        return;
      e.stopPropagation();
      if (e.action === 'start'){
        if (extentGraphic) view.graphics.remove(extentGraphic)
        origin = view.toMap(e);
      } else if (e.action === 'update'){
        if (extentGraphic) view.graphics.remove(extentGraphic)
        let p = view.toMap(e);
        extentGraphic = new Graphic({
          geometry: new Extent({
            xmin: Math.min(p.x, origin.x),
            xmax: Math.max(p.x, origin.x),
            ymin: Math.min(p.y, origin.y),
            ymax: Math.max(p.y, origin.y),
            spatialReference: { wkid: 102100 }
          }),
          symbol: zoomRectFillSymbol
        })

        view.graphics.add(extentGraphic)
      } else if (e.action === 'end'){
        view.goTo(extentGraphic);
        view.graphics.remove(extentGraphic);
      }
    });

      // Handle click events:  Check for mouse over graphic features
    view.on('click', [], function(e){
      let screenPoint = {x: e.x, y: e.y};
      view.hitTest(screenPoint).then(handleGraphicHits);
    });


    // Handle mouse-move events:  Update map coordinate display, and check for mouse over graphic features
    view.on('pointer-move', [], function(e){
      let screenPoint = {x: e.x, y: e.y};
      let mapPoint = view.toMap(screenPoint);

      if (!mapPoint) {
        console.log("3D point is outside globe");
        return;
      }
      let geogPoint = webMercatorUtils.webMercatorToGeographic(mapPoint);    //szVideoWidget._webMercatorToGeographic(mapPoint);
      dom.byId("coordinates").innerHTML = decDegCoords_to_DegMinSec(geogPoint.x, geogPoint.y);

      view.hitTest(screenPoint).then(handleGraphicHits);

    });
  }


  // If mouse if over a video/photo graphic, open popup allowing moving the "camera" to this point
  function handleGraphicHits(response) {
    if (response.results.length === 0) {
      if (hoverTimeout)
        clearTimeout(hoverTimeout);
      return;
    }
    // // Check for point that is both video and photo
    // if (response.results.length > 1) {
    //   alert("More than 1 hit!")
    // };

    let i=0;      // Respond only to hits on "_Clickable" layers
    while (i<response.results.length && response.results[i].graphic.layer.id.slice(-10)!=="_Clickable")
      i++;
    if (i === response.results.length) {
      if (hoverTimeout)
        clearTimeout(hoverTimeout);
      return;
    }

    if (response.results[i].graphic !== currentHoveredGraphic) {
      currentHoveredGraphic = response.results[i].graphic;
      currentWidgetController = currentHoveredGraphic.layer.widgetController;
      if (hoverTimeout)
        clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(currentWidgetController.displayPlayButton(currentHoveredGraphic), minHoverTime);       // delay popup
      if (currentWidgetController.grid)
        currentWidgetController.highlightAssociatedRow(currentHoveredGraphic)
    }
  };

  function clearAllHoverGraphics() {
  }

  function getLegendHtml(n) {
    if (n === llServiceLayers.length) {
      makeLayerListWidget();
      return;
    };
    const serviceLayer = llServiceLayers[n];

    let legendQueryTimeout = setTimeout(function() {    // In case service is not running, this bypasses
      if (!legendInfo[this.title])
        getLegendHtml(n+1);
    }.bind({title: serviceLayer.title, n: n}), 5000);

    queryServer(serviceLayer.url + "/legend", true, function(R) {
      legendInfo[this.title] = R.layers;
      getLegendHtml(n+1);
    }.bind(serviceLayer));
  }

  function makeWidgetDiv(divID, placement, maxHeight, theClass) {
    if (placement === undefined)
      placement = "";
    let newDiv = document.createElement("div");
    newDiv.id = divID;
    if (theClass)
      newDiv.setAttribute("class", theClass);
    newDiv.style.position = "absolute";
    if (placement==="bottom")
      newDiv.style.bottom = "5px";
    if (placement==="right")
      newDiv.style.right = "5px";
    newDiv.draggable = true;
    newDiv.ondragstart = drag_start;
    newDiv.style.maxHeight = maxHeight;
    return newDiv;
  }

  function drag_start(event) {
    let style = window.getComputedStyle(event.target, null);
    let str = (parseInt(style.getPropertyValue("left")) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top")) - event.clientY)+ ',' + event.target.id;
    event.dataTransfer.setData("Text",str);
  }

  function drop(event) {
    let offset = event.dataTransfer.getData("Text").split(',');
    let dm = getEl(offset[2]);
    dm.style.left = (event.clientX + parseInt(offset[0],10)) + 'px';
    dm.style.top = (event.clientY + parseInt(offset[1],10)) + 'px';
    event.preventDefault();
    return false;
  }

  function drag_over(event) {
    event.preventDefault();
    return false;
  }

  function wrapperWithOpacitySlider(divNode, title) {
    // Inserts a panel (divNode) into a wrapper DIV with a slider controlling the panel's opacity
    // Returns a handle to the new wrapper DIV
    let divID = divNode.id;
    let newDiv = document.createElement("div");
    newDiv.id = divID + "_wrapper";
    let sliderDiv = document.createElement("div")
    sliderDiv.innerHTML = '<input type="range" value="90" oninput="sliderHandler(\'' + divID + '\')" id="' + divID + '_slider" >';
    sliderDiv.innerHTML += '<label style="position: absolute; top: 5px; left:20px; color: #76766e">' + title + '</label>';
    let contentDiv = document.createElement("div")
    contentDiv.id = divID + "_content";
    contentDiv.appendChild(divNode);
    newDiv.appendChild(sliderDiv);
    newDiv.appendChild(contentDiv);
    return newDiv;
  }


  function makeLayerListWidget() {
    // Add ESRI LayerList widget.  This goes in the "layerListDom" DIV, rather than the map
    // NOTE:  To prevent a layer from appearing in the LayerList, set the layer's "listMode" property to "hide"
    layerListWidget = new LayerList({
      //    container: "layerListDom",
      container: makeWidgetDiv("layerListDiv","right",(mapDiv.offsetHeight - 100) + "px", "nowrap_ScrollX"),     // Set max height of LayerListWidget to mapDiv height - 100
      view: view
    });


    layerListWidget.listItemCreatedFunction = function(event) {
      const item = event.item;

      // This option collapses groups when nothing under them is visible at the current extent
      item.open = item.visibleAtCurrentScale;
      item.watch("visibleAtCurrentScale", function() {
        item.open = item.visibleAtCurrentScale;
        if (item.panel)
          item.panel.open = (item.visible && item.visibleAtCurrentScale);
      });

      const serviceName = getSublayerServiceName(item);
      const layerId = item.layer.id;
      const svcLegendInfo = legendInfo[serviceName];
      let legendDivId = null;
      const l = svcLegendInfo.findIndex(obj => obj.layerId === layerId );
      if (l !== -1) {
        const lTitle = svcLegendInfo[l].layerName;
        let fInfo = null;
        const f = legendFilters.findIndex(obj => obj.layerTitle === lTitle);

        if (f !== -1) {
          fInfo = legendFilters[f];
          legendDivId = 'swatch_'  + serviceName + '_' + fInfo.fieldName;
        }

        const lInfo = svcLegendInfo[l].legend;
        let theContentHtml = '';
        for (let row=0; row<lInfo.length; row++) {
          let rowInfo = lInfo[row];
          const imgSrc = 'data:image/png;base64,' + rowInfo.imageData;
          const imgHtml = '<img src="' + imgSrc + '" border="0" width="' + rowInfo.width + '" height="' + rowInfo.height + '">';
          let idInsert = '';

          if (fInfo) {
            let value = rowInfo.values[0];      // label;
            if (fInfo.delimiter)
              value = value.split(fInfo.delimiter)[0];
            if (rowInfo.label !== '') {
              const swatchId = legendDivId + '_' + value;
              idInsert = ' id="' + swatchId + '"';
            }
          }

          theContentHtml += '<div' + idInsert + '>' + imgHtml + rowInfo.label + '</div>';     // + '<br>';
        }
        let contentDiv = makeHtmlElement("DIV",legendDivId,null,null,theContentHtml);
        if (fInfo)
          fInfo.contentDiv = contentDiv;
        item.panel = {
          content: contentDiv,
          open: (item.visible && item.visibleAtCurrentScale)
        };
        item.watch("visible", function() {
          item.panel.open = (item.visible && item.visibleAtCurrentScale);
/*
          if (item.panel.open)
            filterLegend(item.title, nonNullList);
*/
        });
      }

      if (item.layer.title === "Video Flightline") {
        listItem_VideoFlightline = item;
        //item.layer.listMode = "hide-children";
      }
      if (item.layer.title === "10s") {
        listItem_10s_legendHtml = item.panel.content.innerHTML;
        modify_LayerListItem_VideoFlightline();
      }

      /*
            //  NOT SURE WHAT THIS WAS FOR?
            if (event.item.layer.title === "Derived ShoreZone Attributes")
              event.item.layer.visible = false;     // turn off layer display
            if (event.item.layer.title === "Video Flightline")
              event.item.visible = false;
      */
    };

    llExpand.content = wrapperWithOpacitySlider(layerListWidget.domNode, "Layers");
  }


  function addMapWidgets() {

    view.container.ondragover = drag_over;
    view.container.ondrop = drop;

/*  Upper-left widgets  */
    let homeWidget = new Home({
      view: view
    });
    view.ui.add({ component: homeWidget, position: "top-left", index: 0});    // Specify index=0, so this widget appears before the (default) Zoom +/- widget

    let panZoomDiv = document.createElement("DIV");
    panZoomDiv.innerHTML = panZoomHtml;
    view.ui.add(panZoomDiv, "top-left");

    let prevNextBtnsDiv = document.createElement("DIV");
    prevNextBtnsDiv.innerHTML = prevNextBtnsHtml;
    view.ui.add(prevNextBtnsDiv, "top-left");

    savedExtentsWidget = new Bookmarks({
      //bookmarks: new Collection(),      // In 4.12, needed to get past bug
      view: view
    });
    let savedExtentsExpand = new Expand({
      expandIconClass: "esri-icon-collection",  // see https://developers.arcgis.com/javascript/latest/guide/esri-icon-font/
      expandTooltip: "Show extents history", // optional, defaults to "Expand" for English locale
      view: view,
      content: savedExtentsWidget
    });
    view.ui.add(savedExtentsExpand, {
      position: "top-left"
    });

    savedExtentsWidget.on("select-bookmark", function(event){
      currentBookmarkNumber = parseInt(event.target.activeBookmark.name.split(":")[0]);
      bookmarkSelected = true;
    });

/*  Upper-left widgets  */


/*  Upper-right widgets  */

    //makeLayerListWidget();

    // place the LayerList in an Expand widget
    llExpand = new Expand({
      view: view,
      //content is added later, after querying server for legend info
      expandIconClass: "esri-icon-layer-list",
      expandTooltip: "Click here to view and select layers",
      collapseTooltip: "Hide layer list",
      expanded: true      // PUB: set to true
    });
    view.ui.add({ component: llExpand, position: "top-right", index: 0});

    // NOAA offline app link
    let olExpand = new Expand({
      view: view,
      content: makeWidgetDiv("offlineAppPanel", "right")   ,
      expandIconClass: "esri-icon-download",
      expandTooltip: "Click here to download data in the current extent and use with the offline app",
      collapseTooltip: "Hide the offline app widget"
    });
    olExpand.content.innerHTML = download_notZoomedInEnoughContent;
    view.ui.add(olExpand, "top-right");


    // Settings widget
    let settingsExpand = new Expand({
      view: view,
      content: makeWidgetDiv("settingsPanel", "right")   ,
      expandIconClass: "esri-icon-settings",
      expandTooltip: "Click here to go to website settings.",
      collapseTooltip: "Hide settings widget"
    });
    settingsExpand.content.innerHTML = settingsHtml;
    view.ui.add(settingsExpand, "top-right");

    let refreshFeaturesDiv = document.createElement("DIV");
    refreshFeaturesDiv.innerHTML = refreshFeaturesHtml;
    view.ui.add(refreshFeaturesDiv, "top-right");


    /*  Upper-right widgets  */


/*  Bottom widgets  */
    let nauticalLayer = new MapImageLayer({
      url: "https://seamlessrnc.nauticalcharts.noaa.gov/ArcGIS/rest/services/RNC/NOAA_RNC/MapServer"
    });

    let nauticalBaseLayer = new Basemap({
      baseLayers: nauticalLayer,
      title: "NOAA Nautical Charts",
      id: "noaaNautical",
      thumbnailUrl:
        "assets/images/thumbnail_noaaNautical.png"
    });

    /*    Attempt to add USA Topo Maps to Basemap Gallery
        // https://www.arcgis.com/home/webmap/viewer.html?webmap=931d892ac7a843d7ba29d085e0433465
        let item = new PortalItem({
          id: "931d892ac7a843d7ba29d085e0433465"
        });

        let newBaseLayer = new Basemap({
          baseLayers: item
        });
    */


    let basemapSource = [nauticalBaseLayer];
    //basemapSource.push(newBaseLayer);
    for (bId of basemapIds) {
      basemapSource.push(Basemap.fromId(bId));
    }

    // Add ESRI basemap gallery widget to map, inside an Expand widget
    let basemapGallery = new BasemapGallery({
      view: view,
      source: basemapSource,
      container: makeWidgetDiv("basemapDiv", "bottom")    // document.createElement("div")
    });
    /*
        basemapGallery.on("selection-change", function(event){
          // event is the event handle returned after the event fires.
          console.log(event.mapPoint);
        });
    */
    let bgExpand = new Expand({
      view: view,
      content: wrapperWithOpacitySlider(basemapGallery.domNode, "Basemaps"),
      expandIconClass: "esri-icon-basemap",
      expandTooltip: "Click here to use a different base map!",
      collapseTooltip: "Hide base maps"
    });
    view.ui.add(bgExpand, "bottom-left");

    let showUnitsDiv = document.createElement("DIV");
    showUnitsDiv.innerHTML = showUnitsCheckbox2;
    view.ui.add(showUnitsDiv, "bottom-left");

    // Add ESRI search widget to map
    let searchWidget = new Search({ view: view, maxSuggestions: 4 });
    view.ui.add(searchWidget, "bottom-right");

    // Default source:  https://developers.arcgis.com/rest/geocode/api-reference/overview-world-geocoding-service.htm
    searchWidget.on("suggest-start", function(event){
      this.activeSource.filter = {
        geometry: view.extent
        //where: "countryCode='USA'"
      };
      this.activeSource.countryCode = "US";
    });

/*    // This filters search suggestions to initial extent
    searchWidget.watch("activeSource", function() {
      this.activeSource.filter = {
        geometry: view.extent
        //where: "name like '*Alaska*'"
      };
    });

    // Code to handle search results with improper extents
    searchWidget.goToOverride = function(view, goToParams) {
      let type =  this.results[0].results[0].feature.geometry.type;
      let tgt = goToParams.target.target;
      let goToTarget = tgt;
      return view.goTo({
        center: tgt.center,
        zoom: 8
      }, goToParams.options);
    };
*/

    /*  Bottom widgets  */


/*  Disabled widgets  *

        let locateWidget = new Locate({
          view: view,   // Attaches the Locate button to the view
          graphicsLayer: locateIconLayer  // The layer the locate graphic is assigned to
        });
        view.ui.add({ component: locateWidget, position: "top-left", index: 2});

        // ESRI Legend widget.  This goes in the "legendDom" DIV, rather than the map
        //let legendDom = document.createElement("div");
        //legendDom.style.backgroundColor = "blueviolet";     //.className = "noaaWidget";
        legend = new Legend({
          container: makeWidgetDiv("legendDiv", "right"),     // "legendDom",
          draggable: true,
          view: view,
          //declaredClass: "noaaWidget",
          layerInfos: [
            //{layer: szMapServiceLayer.sublayers.items[6], title: "stuff" }
            { layer: szMapServiceLayer, title: "ShoreZone layers" },
            { layer: faMapServiceLayer, title: "Fish Atlas layers" },
            { layer: ssMapServiceLayer, title: "Shore Station layers" },
            { layer: sslMapServiceLayer, title: "SSL layers" }
          ]
        });

        // place the Legend in an Expand widget
        let legendExpand = new Expand({
          view: view,
          content: wrapperWithOpacitySlider(legend.domNode, "Legend"),
          expandIconClass: "esri-icon-layers",
          expandTooltip: "Click here to see the legend",
          collapseTooltip: "Hide legend",
          expanded: false      // PUB: set to true
        });
        view.ui.add(legendExpand, "top-right");

/*  Disabled widgets  */

  };

  function initMap() {
    gp = new Geoprocessor(gpUrl);
    addServiceLayers();
    map = new Map({
      basemap: "hybrid",
      //ground: "world-elevation",      // Used only with SceneView
      layers: serviceLayers     //  [sslMapServiceLayer, ssMapServiceLayer, faMapServiceLayer, szMapServiceLayer]
    });
    view = new View({
      container: "mapDiv",
      map: map,
      center: [-152, 62.5], // longitude, latitude
      constraints: {maxScale: 4000},
      zoom: 4               // MapView
      //scale: 50000000,     // SceneView:  Sets the initial scale
      //sliderOrientation : "horizontal",
      //sliderStyle: "large"
    });

    addMapWatchers();
    addMapWidgets();

    getLegendHtml(0);

    // This graphics layer will store the graphic used to display the user's location
    locateIconLayer = new GraphicsLayer();
    locateIconLayer.listMode = "hide";
    map.add(locateIconLayer);
  };


  return declare(null, {

    gotoExtent: function(extText) {
      let a = extText.split(",");
      let newExtent = new Extent({
        xmin: a[0],
        xmax: a[2],
        ymin: a[1],
        ymax: a[3],
        spatialReference: { wkid: 102100 }
      });
      //view.constraints.snapToZoom = false;    // Makes no difference?
      view.goTo(newExtent);
    },

    selectAndZoom: function(w, id, extText) {
      if (w.grid)
        w.grid = null;
      let newTab = parseInt(w.currTab) + 1;
      let currTabInfo = w.tabInfo[w.currTab];
      let ddName = currTabInfo.subTableDD;
      let ddIndex = w.dropDownInfo.findIndex(function(f){
        return f.ddName === ddName;
      });
      let ddInfo = w.dropDownInfo[ddIndex];
      let ddDom = getEl(ddInfo.domId);
      ddDom.value = id;
      ddInfo.SelectedOption = ddDom.value;
      w.setActiveTab(newTab);
      // TODO: Write function to get the ddItem for w.subTableDD, etc.
      this.gotoExtent(extText);
    },

    openSpeciesTable: function(w, tableName, totalsTableName, theWhere, headerText) {
      console.log("openSpeciesTable");
      if (headerText)
        headerText = w.title + " for " + headerText;     //"Fish Catch for " + headerText;
      w.setHeaderItemVisibility();
      setDisplay(w.draggablePanelId, true);
      w.runQuery(null, {tableName: tableName, totalsTableName: totalsTableName, theWhere: theWhere, header: headerText} );
    },

    constructor: function (kwArgs) {
      //lang.mixin(this, kwArgs);
      initMap();
      //console.log("MapStuff object created.");
    },     // end of constructor

  });

});


