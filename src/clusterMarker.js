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
                footer: {
                    height: footHeight,
                    content: footContent
                }
            }
        } = opts;

        const { center, children } = point;
        const containerPoint = map._prjToContainerPoint(center);
        const coordCenter = map.containerPointToCoordinate(containerPoint);

        const typeObj = {};
        children.forEach((ele) => {
            const stats = ele.__option.stats === 'alarm' ? '___报_警___' : '';
            const type = stats + ele.__option.type;
            if (!typeObj[type]) {
                typeObj[type] = [ele.__option];
            } else {
                typeObj[type].push(ele.__option);
            }
        })

        const types = Object.keys(typeObj);

        const points = types.map((ele) => {
            const split = ele.split('___报_警___');
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
            const dom = content(points, this);
            this.content = new maptalks.ui.UIMarker(coordCenter, {
                'draggable': false,
                'single': false,
                'content': dom,
                dx,
                'dy': -footHeight + dy,
                zIndex: 99
            });
            this.content.addTo(layer);
        }

        if (update) {
            const func = update(points, this);
        }

        if (footContent) {
            const dom = footContent(points, this);
            this.origin = new maptalks.ui.UIMarker(coordCenter, {
                id: Math.random(),
                draggable: false,
                'single': false,
                'content': dom,
                dx: 0,
                dy: -footHeight / 2,
            });
            this.origin.addTo(layer);
        }
    }

    remove() {
        this.origin.remove();
        this.content.remove();
    }
}

export default ClusterMarker;