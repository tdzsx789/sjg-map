import * as maptalks from "maptalks";
import * as d3 from 'd3';
import Layer from './layer';
import buildingLabel from './asset/buildingLabel.png';

class Building {
    constructor(params, option, layer) {
        const {
            style: {
                fontFamily, fontSize, color
            }
        } = option.building;
        const nameLength = params.name ? params.name.length : 0;
        const width = nameLength ? nameLength * fontSize + 40 : 120;

        this.origin = new maptalks.Marker(params.coordinate, {
            id: params.name || Math.random(),
            symbol: [
                {
                    markerFile: buildingLabel,
                    markerWidth: width,
                    markerHeight: 32,
                    textFaceName: fontFamily,
                    textName: params.name,
                    textSize: fontSize,
                    textDy: -16,
                    textFill: color,
                    textVerticalAlignment: 'middle'
                },
                {
                    'markerType': 'square',
                    'markerFill': '#ffffff',
                    'markerFillOpacity': 1,
                    'markerLineColor': '#ffffff',
                    'markerLineWidth': 0,
                    'markerLineOpacity': 0,
                    'markerLineDasharray': [],
                    'markerWidth': 80,
                    'markerHeight': 60,
                    'markerDx': 0,
                    'markerDy': 30,
                    'markerOpacity': 0.01
                }
            ],
            cursor: 'pointer'
        });

        this.origin.addTo(layer);
        this.__params = params;
        this.__option = option;
    }

    addLayer(ele) {
        const currentLayer = new Layer(ele, this.__params, this.buildingLayer, this.__option);
        return currentLayer;
    }

    on(event, func) {
        this.origin.on(event, (d) => {
            if (event === 'click') {
                this.buildingLayer = d3.select('body').append('div')
                    .style('width', '1920px')
                    .style('height', '1080px')
                    .style('position', 'absolute')
                    .style('left', 0)
                    .style('top', 0)
                    .style('background-color', 'rgba(0,0,0,0.7)')
                    .on('mousedown', () => {
                        this.buildingLayer.remove();
                    })
                func(d);
            } else {
                func(d);
            }
        })
    }
}

export default Building;