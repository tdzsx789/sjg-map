import * as d3 from 'd3';
import tooptipImage from './asset/tooltip.png';

class Point {
    constructor(params, parent, option) {
        const { coordinate, type, stats } = params;
        const {
            marker: {
                images
            },
            building: {
                point: { width, height, draggable },
            }
        } = option;

        const currentType = images.find((ele) => type === ele.type);

        const pointNode = parent.append('div')
            .attr('class', 'pointer')
            .style('position', 'absolute')
            .style('left', `calc(${coordinate.x}% - ${width / 2}px)`)
            .style('top', `calc(${coordinate.y}% - ${height / 2}px)`)
            // .style('transform', `translate(${-width / 2}px, ${-height / 2}px)`)
            // .style('transform-origin', '50% 50%')
            .style('width', `${width}px`)
            .style('height', `${height}px`)
            .style('background-image', `url(${stats === 'normal' ? currentType.url : currentType.alarm})`)
            .style('background-repeat', 'no-repeat')
            .style('background-size', '100% 100%')
            .style('cursor', 'pointer')
        // .on('click', (evt) => {
        //     evt.stopPropagation();
        //     this.addTooltip();
        // })

        if (draggable) {
            pointNode.on('mousedown', (evt) => {
                evt.stopPropagation();
                const boundings = parent.node().getBoundingClientRect();
                this.position = {
                    x: boundings.x + width / 2,
                    y: boundings.y + height / 2,
                    width: boundings.width,
                    height: boundings.height
                };
                this.mousedownPosition = {
                    x: evt.pageX,
                    y: evt.pageY
                }
                d3.selectAll('.pointer').style('pointer-events', 'none');
                pointNode.style('pointer-events', 'auto').style('z-index', 99);
            }).on('mousemove', (evt) => {
                evt.stopPropagation();
                if (!this.position) return;
                const x = evt.pageX - this.position.x;
                const y = evt.pageY - this.position.y;
                if (x < 0 || y < 0 || x > this.position.width || y > this.position.height) return;
                const xPos = x / this.position.width * 100;
                const yPos = y / this.position.height * 100;
                pointNode.style('left', `${xPos}%`)
                    .style('top', `${yPos}%`);
            })
        }

        this.__pointNode = pointNode;
        this.__coordinate = coordinate;
        this.__building = option.building;
        this.__pointHeight = height;
        this.__params = params;
    }

    addTooltip() {
        const {
            point: { width: pointWidth },
            tooltip: {
                width, height, show, color, fontSize, padding, lineHeight, fontFamily, alarm, normal
            }
        } = this.__building;

        if (show) {
            if (window.tooltip) window.tooltip.remove();
            window.tooltip = this.__pointNode.append('div')
                .style('position', 'absolute')
                .style('left', `${-width / 2 + pointWidth / 2}px`)
                .style('top', `${-height - 10}px`)
                .style('width', `${width}px`)
                .style('height', `${height}px`)
                .style('background-image', `url(${tooptipImage}`)
                .style('background-repeat', 'no-repeat')
                .style('background-size', '100% 100%')
                .style('box-sizing', 'border-box')
                .style('color', color)
                .style('font-size', fontSize)
                .style('padding', padding)
                .style('line-height', lineHeight)
                .style('font - family', fontFamily)
                .style('pointer-events', 'none')
                .style('z-index', 99)
                .html(`<div style="display: flex;">
                <div style="margin-right: 8px;">类型:</div>
                <div>${this.__params.type}</div>
            </div>
            <div style="display: flex;">
                <div style="margin-right: 8px;">状态:</div>
                <div style="color: ${this.__params.stats === 'alarm' ? alarm : normal};">${this.__params.stats === 'alarm' ? '异常' : '正常'}</div>
            </div>`);
        }
    }

    on(event, func) {
        if (event === 'drag') {
            this.__pointNode.on('mouseup', (evt) => {
                evt.stopPropagation();
                this.position = null;
                if (!this.mousedownPosition) return;
                const { x, y } = this.mousedownPosition;
                if (x === evt.pageX && y === evt.pageY) return;
                d3.selectAll('.pointer').style('pointer-events', 'auto');
                func(this.__params);
            });
        } else {
            this.__pointNode.on(event, (evt) => {
                evt.stopPropagation();
                if (!this.mousedownPosition) {
                    func(this.__params);
                } else {
                    const { x, y } = this.mousedownPosition;
                    if (x !== evt.pageX || y !== evt.pageY) return;
                    func(this.__params);
                }
            });
        }
    }

    remove() {
        this.__pointNode.remove(); 
    }
}

export default Point;