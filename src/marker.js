import * as maptalks from "maptalks";
import { isFunction } from "./utils";

class CalcuMarker {
    constructor(point, opts, layer, removeMarker, onMarker) {
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

        this.origin = new maptalks.ui.UIMarker(point.coordinate, {
            id: point.id ? point.id + Math.random() : Math.random(),
            'draggable': true,
            'single': false,
            'content': '',
            dx: 0,
            dy: - height / 2
        });
        this.origin.addTo(layer);
        this.calcuMarker.uimarker = this.origin;

        this.__removeMarker = removeMarker;
        this.__on = onMarker;

        const { tooltip } = option;
        if (tooltip.show) {
            let content = '';

            if (tooltip.content && isFunction(tooltip.content)) {
                content = tooltip.content(point);
            }

            const infoWindow = new maptalks.ui.InfoWindow({
                custom: true,
                width: tooltip.width,
                'dx': tooltip.dx,
                'dy': - height + tooltip.dy,
                // minHeight: tooltip.height,
                autoOpenOn: 'click',
                autoCloseOn: 'click',
                content,
                autoPan: false
            });
            infoWindow.addTo(this.origin);

            if (tooltip.update) {
                const func = tooltip.update(point);
            }
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