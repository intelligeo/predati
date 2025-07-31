ol.proj.proj4.register(proj4);
//ol.proj.get("EPSG:3857").setExtent([808148.893320, 5746205.158805, 1147271.506376, 5884645.901652]);
var wms_layers = [];


        var lyr_Ortofoto_0 = new ol.layer.Tile({
            'title': 'Ortofoto',
            'type':'base',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
            attributions: ' ',
                url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg'
            })
        });

        var lyr_CNgrigio_1 = new ol.layer.Tile({
            'title': 'CN grigio',
            'type':'base',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
            attributions: ' ',
                url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg'
            })
        });

        var lyr_CNcolori_2 = new ol.layer.Tile({
            'title': 'CN colori',
            'type':'base',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
            attributions: ' ',
                url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg'
            })
        });
var format_PredazioniTicinoHeatmap_3 = new ol.format.GeoJSON();
var features_PredazioniTicinoHeatmap_3 = format_PredazioniTicinoHeatmap_3.readFeatures(json_PredazioniTicinoHeatmap_3, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_PredazioniTicinoHeatmap_3 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_PredazioniTicinoHeatmap_3.addFeatures(features_PredazioniTicinoHeatmap_3);
var lyr_PredazioniTicinoHeatmap_3 = new ol.layer.Heatmap({
                declutter: false,
                source:jsonSource_PredazioniTicinoHeatmap_3, 
                radius: 10 * 2,
                gradient: ['#000004', '#621980', '#6a1c81', '#721f81', '#792282', '#812581', '#892881', '#912b81', '#992d80', '#a1307e', '#aa337d', '#b2357b', '#ba3878', '#c23b75', '#ca3e72', '#d2426f', '#d9466b', '#e04c67', '#e75263', '#ec5860', '#f1605d', '#f4695c', '#f7725c', '#f97b5d', '#fb8560', '#fc8e64', '#fd9869', '#fea16e', '#feaa74', '#feb47b', '#febd82', '#fec68a', '#fecf92', '#fed89a', '#fde2a3', '#fdebac', '#fcf4b6', '#fcfdbf'],
                blur: 15,
                shadow: 250,
                title: 'Predazioni Ticino - Heatmap'
            });
var format_PredazioniTicinoCasistica_4 = new ol.format.GeoJSON();
var features_PredazioniTicinoCasistica_4 = format_PredazioniTicinoCasistica_4.readFeatures(json_PredazioniTicinoCasistica_4, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_PredazioniTicinoCasistica_4 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_PredazioniTicinoCasistica_4.addFeatures(features_PredazioniTicinoCasistica_4);
var lyr_PredazioniTicinoCasistica_4 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_PredazioniTicinoCasistica_4, 
                style: style_PredazioniTicinoCasistica_4,
                popuplayertitle: 'Predazioni Ticino - Casistica',
                interactive: true,
    title: 'Predazioni Ticino - Casistica<br />\
    <img src="styles/legend/PredazioniTicinoCasistica_4_0.png" /> 1 - 2<br />\
    <img src="styles/legend/PredazioniTicinoCasistica_4_1.png" /> 2 - 5<br />\
    <img src="styles/legend/PredazioniTicinoCasistica_4_2.png" /> 5 - 10<br />\
    <img src="styles/legend/PredazioniTicinoCasistica_4_3.png" /> 10 - 16<br />\
    <img src="styles/legend/PredazioniTicinoCasistica_4_4.png" /> 16 - 23<br />' });
var group_PredazioniTicino = new ol.layer.Group({
                                layers: [lyr_PredazioniTicinoHeatmap_3,lyr_PredazioniTicinoCasistica_4,],
                                fold: 'open',
                                title: 'Predazioni Ticino'});
var group_Basemaps = new ol.layer.Group({
                                layers: [lyr_Ortofoto_0,lyr_CNgrigio_1,lyr_CNcolori_2,],
                                fold: 'open',
                                title: 'Basemaps'});

lyr_Ortofoto_0.setVisible(false);lyr_CNgrigio_1.setVisible(false);lyr_CNcolori_2.setVisible(true);lyr_PredazioniTicinoHeatmap_3.setVisible(false);lyr_PredazioniTicinoCasistica_4.setVisible(true);
var layersList = [group_Basemaps,group_PredazioniTicino];
lyr_PredazioniTicinoCasistica_4.set('fieldAliases', {'id': 'id', 'data': 'data', 'luogo': 'luogo', 'x': 'x', 'y': 'y', 'numero_predati': 'numero_predati', 'specie_predate': 'specie_predate', 'osservazioni': 'osservazioni', 'icon_url': 'icon_url', });
lyr_PredazioniTicinoCasistica_4.set('fieldImages', {'id': 'TextEdit', 'data': 'DateTime', 'luogo': 'TextEdit', 'x': 'Range', 'y': 'Range', 'numero_predati': 'Range', 'specie_predate': 'TextEdit', 'osservazioni': 'TextEdit', 'icon_url': 'TextEdit', });
lyr_PredazioniTicinoCasistica_4.set('fieldLabels', {'id': 'hidden field', 'data': 'inline label - always visible', 'luogo': 'inline label - always visible', 'x': 'hidden field', 'y': 'hidden field', 'numero_predati': 'inline label - always visible', 'specie_predate': 'inline label - always visible', 'osservazioni': 'inline label - visible with data', 'icon_url': 'hidden field', });
lyr_PredazioniTicinoCasistica_4.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});