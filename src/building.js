import * as maptalks from "maptalks";
import * as d3 from 'd3';
import Layer from './layer';
import buildingLabel from './asset/buildingLabel.png';

class Building {
    constructor(params, option, layer) {
        const {
            content,
            style: {
                fontFamily, fontSize, color
            }
        } = option.building;
        const nameLength = params.name ? params.name.length : 0;
        const width = nameLength ? nameLength * fontSize + 40 : 120;

        if (content) {
            this.origin = new maptalks.ui.UIMarker(coordCenter, {
                id: params.name || Math.random(),
                'draggable': false,
                'single': false,
                'content': dom,
            });
            this.origin.addTo(layer);
        }
        // this.origin = new maptalks.Marker(params.coordinate, {
        //     id: params.name || Math.random(),
        //     symbol: [
        //         {
        //             markerFile: buildingLabel,
        //             markerWidth: width,
        //             markerHeight: 32,
        //             textFaceName: fontFamily,
        //             textName: params.name,
        //             textSize: fontSize,
        //             textDy: -16,
        //             textFill: color,
        //             textVerticalAlignment: 'middle'
        //         },
        //     ],
        //     cursor: 'pointer'
        // });

        this.__params = params;
        this.__option = option;
    }

    addLayer(ele) {
        const currentLayer = new Layer(ele, this.__params, this.buildingLayer, this.__option);
        return currentLayer;
    }

    on(event, func) {
        if (!this.origin) return;
        this.origin.on(event, (d) => {
            if (event === 'click') {
                const buildingContainer = d3.select('body')
                    .append('div')
                    .style('width', '100%')
                    .style('height', '100%')
                    .style('position', 'absolute')
                    .style('left', 0)
                    .style('top', 0)
                    .style('background-color', 'rgba(0,0,0,0.7)')
                    .style('overflow', 'auto');

                this.buildingLayer = buildingContainer.append('div')
                    .style('width', '1920px')
                    .style('height', '1080px')
                    .style('position', 'absolute')
                    .style('left', 0)
                    .style('top', 0)
                    .on('mousedown', () => {
                        buildingContainer.remove();
                    })

                if (!this.__option.maskImage && !this.__option.backgroundImage) {
                    this.buildingLayer.style('margin-left', '120px');
                } else {
                    buildingContainer.style('overflow', 'hidden');
                }

                func(d);
            } else {
                func(d);
            }
        })
    }
}

export default Building;