import * as maptalks from "maptalks";
import { createHash } from './utils';

class ClusterMarker {
    constructor(point, opts, layer, map) {
        const {
            marker: {
                images
            },
            cluster: {
                content,
                update,
                dx,
                dy,
                line: {
                    color: lineColor,
                    lineWidth,
                    lineHeight,
                    opacity: lineOpacity,
                    pointSize
                },
            }
        } = opts;

        const { center, children } = point;
        const containerPoint = map._prjToContainerPoint(center);
        const coordCenter = map.containerPointToCoordinate(containerPoint);

        const typeObj = {};
        children.forEach((ele) => {
            const stats = ele.__option.stats === 'alarm' ? '报警' : '';
            const type = stats + ele.__option.type;
            if (!typeObj[type]) {
                typeObj[type] = [ele.__option];
            } else {
                typeObj[type].push(ele.__option);
            }
        })

        const types = Object.keys(typeObj);

        const categories = [
            {
                markerType: "ellipse",
                markerFill: lineColor,
                markerWidth: pointSize,
                markerHeight: pointSize,
                markerLineColor: lineColor,
                markerLineWidth: 0,
                markerDx: 0,
                markerDy: 0,
                markerOpacity: lineOpacity,
                markerHorizontalAlignment: 'middle',
                markerVerticalAlignment: 'top'
            },
            {
                markerType: "rectangle",
                markerFill: lineColor,
                markerWidth: lineWidth,
                markerHeight: lineHeight,
                markerLineColor: '#000000',
                markerLineWidth: 0,
                markerDx: 0,
                markerDy: 0,
                markerOpacity: lineOpacity,
                markerHorizontalAlignment: 'middle',
                markerVerticalAlignment: 'top'
            },
        ]

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

        if (content) {
            const dom = content(points);
            this.content = new maptalks.ui.UIMarker(coordCenter, {
                'draggable': false,
                'single': false,
                'content': dom,
                dx,
                'dy': -lineHeight + dy,
                zIndex: 99
            });
            this.content.addTo(layer);
        }

        if (update) {
            const func = update(points);
        }

        this.origin = new maptalks.Marker(coordCenter, {
            id: Math.random(),
            draggable: false,
            symbol: categories
        });
        this.origin.addTo(layer);
    }
}

export default ClusterMarker;