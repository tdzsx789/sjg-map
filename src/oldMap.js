import * as maptalks from "maptalks";
import * as d3 from 'd3';
import { Coordinate } from "maptalks";

import DrawTiles from './tiles';

class OldMap {
    constructor(dom, oldLatlng) {
        const mapDom = d3.select(dom);
        const map2Dom = mapDom.clone();
        map2Dom.attr('id', 'syncMap');
        map2Dom.style('opacity', 1);
        map2Dom.style('width', '1920px');
        map2Dom.style('height', '1080px')
        map2Dom.style('pointer-events', 'none');

        if (!window.map1) {
            window.map1 = new maptalks.Map(map2Dom.node(), {
                center: [121.298, 29.1776],
                zoom: 16.5,
                pitch: 0,
                bearing: 180,
                draggable: false,        // disable draggble
                scrollWheelZoom: false,  // disable scroll wheel zoom
                dblClickZoom: false,     // disable doubleclick
                baseLayer: new maptalks.TileLayer('base', {
                    // urlTemplate:
                    // "https://wprd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=2&style=8&ltype=11",
                    attribution: "",
                    opacity: 0,
                }),
                zoomAnimation: false,
                hitDetect: false,
                layerCanvasLimitOnInteracting: true,
            });
        }

        // const tiles = oldTiles;
        // const mapExtent = [121.31638, 29.1666, 121.2802, 29.1866];
        // 0.03618 / 0.02 = 1.809
        // const stepX = (mapExtent[2] - mapExtent[0]) / 2;
        // const stepY = (mapExtent[3] - mapExtent[1]) / 2;

        // const imageGroup = tiles.map((url, i) => {
        //     const volumn = i % 2;
        //     const row = Math.floor(i / 2);
        //     const currentExtent = [
        //         mapExtent[0] + stepX * volumn,
        //         mapExtent[1] + stepY * row,
        //         mapExtent[0] + stepX * (volumn + 1),
        //         mapExtent[1] + stepY * (row + 1),
        //     ]
        //     return {
        //         url,
        //         extent: currentExtent,
        //         // opacity: 1,
        //         opacity: 0
        //     }
        // })

        // const imageLayer = new maptalks.ImageLayer("images", imageGroup, {
        //     forceRenderOnMoving: true,
        //     forceRenderOnZooming: true,
        //     forceRenderOnRotating: false,
        //     zIndex: 0,
        // })
        // map.addLayer(imageLayer);

        // const oldLatlng = [121.3051, 29.1772];
        // const point = new maptalks.Marker(
        //     // [121.29871518724644, 29.176600115693788],
        //     oldLatlng,
        //     // [121.29715460179705, 29.1804824295443],
        //     // [121.30122237491724, 29.17898390532357],
        //     {
        //         visible: true,
        //         editable: true,
        //         cursor: 'pointer',
        //         shadowBlur: 0,
        //         shadowColor: 'black',
        //         draggable: false,
        //         dragShadow: false, // display a shadow during dragging
        //         drawOnAxis: null,  // force dragging stick on a axis, can be: x, y
        //         symbol: {
        //             'markerType': 'ellipse',
        //             'markerFill': 'rgb(135,196,240)',
        //             'markerFillOpacity': 1,
        //             'markerLineColor': '#34495e',
        //             'markerLineWidth': 3,
        //             'markerLineOpacity': 1,
        //             'markerLineDasharray': [],
        //             'markerWidth': 40,
        //             'markerHeight': 40,
        //             'markerDx': 0,
        //             'markerDy': 0,
        //             'markerOpacity': 1
        //         }
        //     }
        // );
        // new maptalks.VectorLayer('vector', point).addTo(map);

        const map3Dom = mapDom.clone();
        map3Dom.attr('id', 'syncMap2');
        map3Dom.style('opacity', 1);
        map3Dom.style('width', '1920px');
        map3Dom.style('height', '1080px');
        map3Dom.style('pointer-events', 'none');

        if (!window.map3) {
            window.map3 = new maptalks.Map(map3Dom.node(), {
                center: [121.29705559775402, 29.178167355972136],
                zoom: 17.44,
                pitch: 72,
                bearing: 150,
                draggable: false,        // disable draggble
                scrollWheelZoom: false,  // disable scroll wheel zoom
                dblClickZoom: false,     // disable doubleclick
                baseLayer: new maptalks.TileLayer('base', {
                    // urlTemplate:
                    // "https://wprd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=2&style=8&ltype=11",
                    attribution: "",
                    opacity: 0,
                }),
                zoomAnimation: false,
                hitDetect: false,
                layerCanvasLimitOnInteracting: true,
            })
        }

        const oldPoint = window.map1.coordinateToViewPoint(new Coordinate(oldLatlng));
        const newPoint = window.map3.viewPointToCoordinate(oldPoint);

        // const point2 = new maptalks.Marker(
        //     newPoint,
        //     {
        //         visible: true,
        //         editable: true,
        //         cursor: 'pointer',
        //         shadowBlur: 0,
        //         shadowColor: 'black',
        //         draggable: false,
        //         dragShadow: false, // display a shadow during dragging
        //         drawOnAxis: null,  // force dragging stick on a axis, can be: x, y
        //         symbol: {
        //             'markerType': 'ellipse',
        //             'markerFill': 'red',
        //             'markerFillOpacity': 1,
        //             'markerLineColor': '#34495e',
        //             'markerLineWidth': 3,
        //             'markerLineOpacity': 1,
        //             'markerLineDasharray': [],
        //             'markerWidth': 40,
        //             'markerHeight': 40,
        //             'markerDx': 0,
        //             'markerDy': 0,
        //             'markerOpacity': 1
        //         }
        //     }
        // );
        // new maptalks.VectorLayer('vector', point2).addTo(map3);
        return newPoint;
    }
}

export default OldMap;