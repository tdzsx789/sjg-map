import * as maptalks from "maptalks";
import * as d3 from 'd3';

class OldMap {
    constructor(dom, oldTiles) {
        const mapDom = d3.select(dom);
        const map2Dom = mapDom.clone();
        map2Dom.attr('id', 'syncMap');
        map2Dom.style('opacity', 1);
        map2Dom.style('pointer-events', 'none');
        const map = new maptalks.Map(map2Dom.node(), {
            center: [121.2986, 29.1766],
            zoom: 16.2,
            pitch: 0,
            bearing: 180,
            draggable: false,        // disable draggble
            scrollWheelZoom: false,  // disable scroll wheel zoom
            dblClickZoom: false,     // disable doubleclick
            baseLayer: new maptalks.TileLayer('base1', {
                urlTemplate:
                    "https://wprd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=2&style=8&ltype=11",
                attribution: "",
                opacity: 1,
            }),
            zoomAnimation: false,
            hitDetect: false,
            layerCanvasLimitOnInteracting: true,
        })

        const tiles = JSON.parse(JSON.stringify(oldTiles)).reverse();
        const mapExtent = [121.31638, 29.1666, 121.2802, 29.1866];
        const stepX = (mapExtent[2] - mapExtent[0]) / 2;
        const stepY = (mapExtent[3] - mapExtent[1]) / 2;

        const imageGroup = tiles.map((url, i) => {
            const volumn = i % 2;
            const row = Math.floor(i / 2);
            const currentExtent = [
                mapExtent[0] + stepX * volumn,
                mapExtent[1] + stepY * row,
                mapExtent[0] + stepX * (volumn + 1),
                mapExtent[1] + stepY * (row + 1),
            ]
            return {
                url,
                extent: currentExtent,
                // opacity: 1,
                // opacity: 0.3,
            }
        })

        const imageLayer = new maptalks.ImageLayer("images", imageGroup, {
            forceRenderOnMoving: true,
            forceRenderOnZooming: true,
            forceRenderOnRotating: false,
            zIndex: 0,
        })
        map.addLayer(imageLayer);

        return map;
    }
}

export default OldMap;