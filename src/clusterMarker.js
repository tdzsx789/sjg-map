import * as maptalks from "maptalks";

class ClusterMarker {
    constructor(point, opts, layer, map) {
        const {
            marker: {
                images
            },
            cluster: {
                style: {
                    width,
                    height,
                    color,
                    opacity,
                },
                text: {
                    fontFamily,
                    fontSize,
                    color: textColor,
                    opacity: textOpacity,
                },
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
            const type = ele.__option.type;
            if (!typeObj[type]) {
                typeObj[type] = 1;
            } else {
                typeObj[type] = typeObj[type] + 1;
            }
        })

        const types = Object.keys(typeObj);

        const totalWidth = width * types.length + 40 + fontSize * 2 * types.length;
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
                markerOpacity: opacity,
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
                markerOpacity: opacity,
                markerHorizontalAlignment: 'middle',
                markerVerticalAlignment: 'top'
            },
            {
                markerType: "rectangle",
                markerFill: color,
                markerWidth: totalWidth,
                markerHeight: width + 10,
                markerLineColor: lineColor,
                markerLineWidth: 1,
                markerDx: 0,
                markerDy: -lineHeight,
                markerOpacity: opacity,
                markerHorizontalAlignment: 'middle',
                markerVerticalAlignment: 'top'
            }
        ]

        let markerFile = null;
        if (images.length > 0) {
            if (point.type) {
                const currentEle = images.find((ele) => ele.type === point.type);
                const alarmUrl = currentEle.alarm || currentEle.url;
                markerFile = point.stats === 'alarm' ? alarmUrl : currentEle.url;
            } else {
                markerFile = images[0].url;
            }
        }

        const firstPos = - totalWidth / 2 + 20 + width / 2;
        types.forEach((ele, i) => {
            const fontNum = typeObj[ele] > 9 ? 2 : 1;
            const fontWidth = fontSize * (1 + fontNum);
            categories.push({
                'markerType': 'ellipse',
                'markerLineColor': '#000000',
                'markerLineWidth': 0,
                'markerLineOpacity': 0,
                'markerLineDasharray': [],
                'markerWidth': width,
                'markerHeight': height,
                'markerDx': firstPos + (width + fontWidth) * i,
                'markerDy': -lineHeight - 5,
                'markerOpacity': 1,
                markerHorizontalAlignment: 'middle',
                markerVerticalAlignment: 'top',
                markerFile,
                'textFaceName': fontFamily,
                'textName': `x${typeObj[ele]}`,
                'textSize': fontSize,
                'textFill': textColor,
                'textOpacity': textOpacity,
                'textDx': firstPos + width + (width + fontWidth) * i,
                'textDy': -lineHeight - 5 - (height - fontSize) / 2,
                'textHorizontalAlignment': 'middle',
                'textVerticalAlignment': 'top',
                'textAlign': 'center',
                markerOpacity: opacity,
            });
        })

        this.origin = new maptalks.Marker(coordCenter, {
            id: Math.random(),
            draggable: false,
            symbol: categories
        });
        this.origin.addTo(layer);
    }
}

export default ClusterMarker;