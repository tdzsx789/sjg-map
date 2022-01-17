import * as maptalks from "maptalks";
import { getMarkerStyle } from './func';
import tooptipImage from './asset/tooltip.png';

class Marker {
    constructor(point, opts, layer) {
        const symbol = getMarkerStyle(point, opts);
        this.origin = new maptalks.Marker(point.coordinate, {
            id: point.id || Math.random(),
            draggable: opts.marker.draggable,
            symbol,
            cursor: opts.marker.style.cursor
        });

        this.origin.__option = point;
        this.__option = opts.marker;

        layer.addMarker(this.origin);

        const { tooltip } = this.__option;
        if (tooltip.show) {
            const x = point.coordinate.x.toFixed(2);
            const y = point.coordinate.y.toFixed(2);
            this.origin.setInfoWindow({
                width: tooltip.width,
                // minHeight: tooltip.height,
                autoOpenOn: 'click',
                autoCloseOn: 'click',
                content: `<div style="background-image: url(${tooptipImage});  width: ${tooltip.width}px;height: ${tooltip.height}px;background-repeat: no-repeat;background-size: 100% 100%;
                box-sizing: border-box;color: ${tooltip.color};font-size: ${tooltip.fontSize}; padding: ${tooltip.padding};line-height: ${tooltip.lineHeight};font-family: ${tooltip.fontFamily};">
                <div style="display: flex;">
                    <div style="margin-right: 8px;">类型:</div>
                    <div>${point.type}</div>
                </div>
                <div style="display: flex;">
                    <div style="margin-right: 8px;">状态:</div>
                    <div style="color: ${point.stats === 'alarm' ? tooltip.alarm : tooltip.normal};">${point.stats === 'alarm' ? '异常' : '正常'}</div>
                </div>
                <div style="display: flex;">
                    <div style="margin-right: 4px;">经纬度:</div>
                    <div>${x}, ${y}</div>
                </div>
                </div>`
            });
        }
    }

    on(event, func) {
        if (event === "drag") {
            this.origin.on('dragend', (d) => {
                if (this.__option.text.show) {
                    const x = d.coordinate.x.toFixed(this.__option.text.decimals);
                    const y = d.coordinate.y.toFixed(this.__option.text.decimals);
                    this.origin.updateSymbol([
                        {},
                        {
                            textName: `${x}, ${y}`,
                        },
                    ]);
                }
                func(d);
            })
        } else {
            this.origin.on(event, (d) => {
                func(d);
            })
        }
    }

    setImage(url) {
        this.origin.updateSymbol([
            { markerFile: url },
            {},
        ]);
    }

    setOption(opts) {
        for (let key in opts) {
            this.origin[key] = opts[key];
        }
    }

    get(type) {
        return this.origin.__option[type];
    }
}

export default Marker;