import anime from 'animejs';
import Point from './point';

class Layer {
    constructor(params, data, buildingLayer, option) {
        const { layers } = data;
        const w = 30;
        const h = 50;

        const fl = params.floor - 1 || 0;
        const currentLayer = fl < 0 ? 0 : fl;

        const eachFloorNum = layers.length > 3 ? 3 : layers.length;
        const padding = (100 - w * eachFloorNum) / (eachFloorNum * 2);

        let left = padding + (w + padding * 2) * (currentLayer % 3);
        let top = 0;
        if (layers.length > 3) {
            const level = Math.floor(currentLayer / 3);
            top = level * h;
        }

        this.origin = buildingLayer.append('div')
            .style('position', 'absolute')
            .style('left', `${left}%`)
            .style('top', `${top}%`)
            .style('width', `${w}%`)
            .style('transform', 'translate(0, 25%)')
            // .style('height', `${h}%`)
            // .style('background-image', `url(${params.url})`)
            // .style('background-size', '100% auto')
            // .style('background-position', 'center')
            // .style('background-repeat', 'no-repeat')
            .on('mousedown', (evt) => {
                evt.stopPropagation();
                if (window.tooltip) {
                    window.tooltip.remove();
                    window.tooltip = null;
                    this.isClickable = false;
                } else {
                    this.isClickable = true;
                }
            })

        const image = this.origin.append('img')
            .attr('src', params.url)
            .style('width', '100%')
            .style('height', '100%');

        this.origin.append('div')
            .html(`${params.floor}层`)
            .style('color', '#ffffff')
            .style('position', 'absolute')
            .style('left', '0px')
            .style('bottom', '20px')
            .style('font-family', option.building.style.fontFamily)
            .style('font-weight', 'bolder')
            .style('font-size', '24px');

        this.__option = option;
    }

    on(event, func) {
        this.origin.on(event, (evt) => {
            evt.stopPropagation();
            const boundings = this.origin.node().getBoundingClientRect();
            const xPos = evt.offsetX / boundings.width;
            const yPos = evt.offsetY / boundings.height;
            if (this.isClickable) {
                func({
                    coordinate: {
                        x: xPos * 100,
                        y: yPos * 100
                    }
                });
            }
        })
    }

    add(data) {
        const point = new Point(data, this.origin, this.__option);
        return point;
    }
}

export default Layer;