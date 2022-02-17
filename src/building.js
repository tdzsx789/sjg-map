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

        const points = this.getPoints(layers, images);
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
        this.__content = content;
    }

    addLayer(ele) {
        const currentLayer = new Layer(ele, this.__params, this.buildingLayer, this.__option);
        return currentLayer;
    }

    getPoints(layers, images) {
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
        return points;
    }

    updateData(data) {
        const {
            building: {
                content
            },
            marker: {
                images
            },
        } = this.__option;
        const points = this.getPoints(data.layers, images);
        data.points = points;

        if (content) {
            const dom = content(data);
            this.origin.setContent(dom);
        }
    }

    on(event, func) {
        const { nodeId, className } = this.__option.building.mask;
        const container = d3.select(nodeId);
        if (!this.origin) return;
        if (event === 'close') {
            const cross = container.append('div')
                .attr('id', 'buildingClose')
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
                .style('z-index', 9999)
                .style('opacity', 0)
                .style('border-radius', '4px')
                .html('x')
                .on('mouseover', () => {
                    cross.style('background', 'rgba(255,255,255,0.4)')
                })
                .on('mouseout', () => {
                    cross.style('background', 'transparent')
                })
                .on('click', (evt) => {
                    evt.stopPropagation();
                    d3.select('#buildingClose').style('opacity', 0);
                    this.buildingLayer.remove();
                    func();
                })
        }

        this.origin.on(event, (d) => {
            if (event === 'click') {
                this.buildingLayer = container.append('div')
                    .attr('class', className)
                    .style('width', '100%')
                    .style('height', '100%')
                    .style('position', 'absolute')
                    .style('left', 0)
                    .style('top', 0)
                    .style('z-index', 9998)
                    .style('background-color', 'rgba(0,0,0,0.7)')
                    .style('overflow', 'hidden');
                d3.select('#buildingClose').style('opacity', 1);
                func(d);
            } else {
                func(d);
            }
        })
    }
}

export default Building;