import * as maptalks from "maptalks";

class ClusterMarker {
    constructor(point, layer, map) {
        console.log('tttt', point, layer)
        const { center } = point;
        // console.log('ccc', center)
        const kk = map.pointToCoordinate(center);
        // console.log('kkk', kk)

        // const symbol = getMarkerStyle(point, opts);
        // this.origin = new maptalks.Marker(point.coordinate, {
        //     id: point.id || Math.random(),
        //     draggable: opts.marker.draggable,
        //     symbol,
        //     cursor: opts.marker.style.cursor
        // });

        // this.origin.__option = point;
        // this.__option = opts.marker;

        // layer.addMarker(this.origin);
        console.log('ccccttteeqqqeeee')
        this.origin = new maptalks.Marker(center, {
            id: Math.random(),
            draggable: false,
            symbol: [
                {
                    'markerType': 'square',
                    'markerFill': '#ffffff',
                    'markerFillOpacity': 1,
                    'markerLineColor': '#ffffff',
                    'markerLineWidth': 0,
                    'markerLineOpacity': 0,
                    'markerLineDasharray': [],
                    'markerWidth': 80,
                    'markerHeight': 60,
                    'markerDx': 0,
                    'markerDy': 30,
                    'markerOpacity': 1
                }
            ]
        });
        this.origin.addTo(layer);
    }
}

export default ClusterMarker;