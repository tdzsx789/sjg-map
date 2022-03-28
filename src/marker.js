import * as maptalks from "maptalks";
import { isFunction } from "./utils";

class CalcuMarker {
    constructor(point, map, opts, layer, removeMarker, onMarker) {
        this.calcuMarker = new maptalks.Marker(point.coordinate, {
            id: point.id ? point.id + Math.random() : Math.random(),
            editable: false,
            interactive: false,
            draggable: false,
            dragShadow: false,
            symbol: {
            }
        });
        layer.addMarker(this.calcuMarker);

        const option = opts.marker;
        const { images } = option;
        let url = null;
        if (images.length > 0) {
            if (point.type) {
                const currentEle = images.find((ele) => ele.type === point.type);
                const alarmUrl = currentEle.alarm || currentEle.url;
                url = point.stats === 'alarm' ? alarmUrl : currentEle.url;
            } else {
                url = images[0].url;
            }
        }
        point.url = url;
        this.calcuMarker.__option = point;
        this.__option = option;
        const { height } = option;
        const __height = isFunction(height) ? height(point) : height;

        this.origin = new maptalks.ui.UIMarker(point.coordinate, {
            id: point.id ? point.id + Math.random() : Math.random(),
            'draggable': option.draggable,
            'single': false,
            'content': '',
            dx: 0,
            dy: - __height / 2,
            markerVerticalAlignment: 'top'
        });
        this.origin.addTo(layer);
        this.calcuMarker.uimarker = this.origin;

        this.__removeMarker = removeMarker;
        this.__on = onMarker;

        const { tooltip } = option;
        if (tooltip.show) {
            this.infoWindow = new maptalks.ui.InfoWindow({
                custom: true,
                width: tooltip.width,
                'dx': tooltip.dx,
                'dy': - __height + tooltip.dy,
                autoOpenOn: 'click',
                autoCloseOn: false,
                autoPan: false,
                eventsPropagation: true,
                eventsToStop: 'click mousedown'
            });
            let content = '';
            if (tooltip.content && isFunction(tooltip.content)) {
                content = tooltip.content(point, this.infoWindow);
            }
            this.infoWindow.setContent(content);
            this.infoWindow.addTo(this.origin);
            this.infoWindow.on('showend', (e) => {
                if (tooltip.update && isFunction(tooltip.update)) {
                    const func = tooltip.update(point, this.infoWindow);
                }

                const infoDom = this.infoWindow.getDOM();
                infoDom.style['z-index'] = 9999;
                window.unclickable = true;
            })
            this.infoWindow.on('hide', () => {
                window.unclickable = false;
            })
            map.on('mousedown', (evt) => {
                this.infoWindow.hide();
            })
        }
    }

    on(event, func) {
        this.__on(event, func, this);
    }

    remove() {
        this.__removeMarker(this);
    }

    get(type) {
        return this.calcuMarker.__option[type];
    }
}

export default CalcuMarker;