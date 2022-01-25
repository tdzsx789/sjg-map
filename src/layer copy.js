import anime from 'animejs';
import Point from './point';

class Layer {
    constructor(params, data, buildingLayer, option) {
        const { layers } = data;
        const w = 480;
        const h = 360;

        const fl = params.floor - 1 || 0;
        const currentLayer = fl < 0 ? 0 : fl;

        const eachFloorNum = layers.length > 3 ? 3 : layers.length;
        const padding = (1920 - w * eachFloorNum) / (eachFloorNum * 2);

        let left = padding + (w + padding * 2) * (currentLayer % 3);
        let top = 540 - h / 2;
        if (layers.length > 3) {
            const level = Math.floor(currentLayer / 3);
            top = 540 - level * h;
            if (currentLayer > 2) {
                const topLayer = currentLayer - 3;
                const secondFloorNum = layers.length - 3;
                const secondFloorPadding = (1920 - w * secondFloorNum) / (secondFloorNum * 2);
                left = secondFloorPadding + (w + secondFloorPadding * 2) * (topLayer % 3);
            }
        }

        this.origin = buildingLayer.append('div')
            .style('position', 'absolute')
            .style('left', `${920 - w / 2}px`)
            .style('top', `${top}px`)
            .style('width', `${w}px`)
            .style('height', `${h}px`)
            .style('background-image', `url(${params.url})`)
            .style('background-size', '100% 100%')
            .style('background-repeat', 'no-repeat')
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

        this.origin.append('div')
            .html(`${params.floor}层`)
            .style('color', '#ffffff')
            .style('position', 'absolute')
            .style('left', '0px')
            .style('bottom', '20px')
            .style('font-family', option.building.style.fontFamily)
            .style('font-weight', 'bolder')
            .style('font-size', '24px');

        if (layers.length > 1) {
            anime({
                targets: this.origin.node(),
                left: `${left}px`,
                duration: 500,
                easing: 'linear',
                begin: () => {
                    this.isClickable = false;
                },
                complete: () => {
                    this.isClickable = true;
                }
            })
        }

        this.__option = option;
    }

    on(event, func) {
        this.origin.on(event, (evt) => {
            evt.stopPropagation();
            if (this.isClickable) {
                func({
                    coordinate: {
                        x: evt.offsetX,
                        y: evt.offsetY
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