import * as maptalks from "maptalks";
import * as d3 from 'd3';

class SyncMap {
    constructor(dom) {
        const mapDom = d3.select(dom);
        const map2Dom = mapDom.clone();
        map2Dom.attr('id', 'syncMap');
        map2Dom.style('opacity', 1);
        map2Dom.style('pointer-events', 'none');
        const map = new maptalks.Map(map2Dom.node(), {
            center: [121.29701380939446, 29.17802745471883],
            zoom: 17.4,
            pitch: 73,
            bearing: 150,
            draggable: false,        // disable draggble
            scrollWheelZoom: false,  // disable scroll wheel zoom
            dblClickZoom: false,     // disable doubleclick
            baseLayer: new maptalks.TileLayer('base1', {
                urlTemplate:
                    "https://wprd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=2&style=8&ltype=11",
                attribution: "",
                opacity: 1,
            }),
            zoomAnimation:false,
            hitDetect: false,
            layerCanvasLimitOnInteracting: true,
        })
        return map;
    }
}

export default SyncMap;