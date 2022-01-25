import * as maptalks from "maptalks";
import * as d3 from 'd3';
import Layer from './layer';
import { createHash } from './utils';

class Building {
    constructor(params, option, layer) {
        const {
            building: {
                content,
                update,
                dx,
                dy
            },
            marker: {
                images
            },
        } = option;
        const { name, coordinate, layers } = params;

        const totalPoints = [];
        layers.forEach((ele) => {
            totalPoints.push(...ele.points);
        })
        const typeObj = {};
        totalPoints.forEach((ele) => {
            const stats = ele.stats === 'alarm' ? '报警' : '';
            const type = stats + ele.type;
            if (!typeObj[type]) {
                typeObj[type] = [ele];
            } else {
                typeObj[type].push(ele);
            }
        })

        const types = Object.keys(typeObj);

        const points = types.map((ele) => {
            const split = ele.split('报警');
            const name = split.length > 1 ? split[1] : ele;
            const stats = split.length > 1 ? 'alarm' : 'normal';
            let url = null;
            if (images.length > 0) {
                const currentEle = images.find((ele) => ele.type === name);
                if (currentEle) {
                    url = split.length > 1 ? currentEle.alarm : currentEle.url;
                } else {
                    url = images[0].url;
                }
            }
            const hash = createHash(8);
            const children = typeObj[ele];
            return {
                id: name + hash,
                name,
                url,
                stats,
                children
            }
        });
        params.points = points;

        if (content) {
            const dom = content(params);
            this.origin = new maptalks.ui.UIMarker(coordinate, {
                id: name ? name + Math.random() : Math.random(),
                'draggable': false,
                'single': false,
                'content': dom,
                cursor: 'pointer',
                dx,
                dy
            });
            this.origin.addTo(layer);
        }

        if (update) {
            const func = update(points);
        }

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
                this.buildingLayer = d3.select('body')
                    .append('div')
                    .style('width', '100%')
                    .style('height', '100%')
                    .style('position', 'absolute')
                    .style('left', 0)
                    .style('top', 0)
                    .style('background-color', 'rgba(0,0,0,0.7)')
                    .style('overflow', 'auto')
                    .on('mousedown', () => {
                        this.buildingLayer.remove();
                    });

                const cross = this.buildingLayer.append('div')
                    .style('width', '20px')
                    .style('height', '20px')
                    .style('line-height', '18px')
                    .style('position', 'absolute')
                    .style('right', '20px')
                    .style('top', '20px')
                    .style('cursor', 'pointer')
                    .style('color', '#ffffff')
                    .style('border', '1px #ffffff solid')
                    .style('text-align', 'center')
                    .style('text-align', 'center')
                    .style('z-index', 999)
                    .style('border-radius', '4px')
                    .html('x')
                    .on('mouseover', () => {
                        cross.style('background', 'rgba(255,255,255,0.4)')
                    })
                    .on('mouseout', () => {
                        cross.style('background', 'transparent')
                    })
                    .on('click', () => {
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