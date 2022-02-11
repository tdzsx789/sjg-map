import * as maptalks from "maptalks";
import { getMarkerStyle } from './func';
import { isFunction } from "./utils";

class Marker {
    constructor(point, opts, layer) {
        const symbol = getMarkerStyle(point, opts);
        this.origin = new maptalks.Marker(point.coordinate, {
            id: point.id ? point.id + Math.random() : Math.random(),
            draggable: opts.marker.draggable,
            symbol,
            dragShadow: false,
            cursor: opts.marker.style.cursor
        });

        this.origin.__option = point;
        this.__option = opts.marker;

        layer.addMarker(this.origin);

        const { tooltip } = this.__option;
        if (tooltip.show) {
            let content = '';

            if (tooltip.content && isFunction(tooltip.content)) {
                content = tooltip.content(point);
            }

            this.origin.setInfoWindow({
                custom: true,
                width: tooltip.width,
                'dx': 0,
                'dy': 0,
                // minHeight: tooltip.height,
                autoOpenOn: 'click',
                autoCloseOn: 'click',
                content
            });

            if (tooltip.update) {
                const func = tooltip.update(point);
            }
        }
    }

    on(event, func) {
        if (event === "drag") {
            this.origin.on('dragend', (d) => {
                if (this.__option.text.show) {
                    const x = d.gaodeCoordinate.x.toFixed(this.__option.text.decimals);
                    const y = d.gaodeCoordinate.y.toFixed(this.__option.text.decimals);
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

    remove() {
        this.origin.remove();
    }
}

export default Marker;