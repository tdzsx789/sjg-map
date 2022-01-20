export const getMarkerStyle = (point, opts) => {
    const {
        marker: {
            style: {
                width,
                height,
                opacity,
            },
            text: {
                show: textShow,
                fontFamily,
                fontSize,
                offsetY,
                offsetX,
                color: textColor,
                opacity: textOpacity,
                textHaloFill,
                textHaloRadius,
                decimals
            },
            line: {
                show: lineShow,
                color: lineColor,
                alarm: alarmColor,
                lineWidth,
                lineHeight,
                opacity: lineOpacity,
                pointSize
            },
            images
        }
    } = opts;

    const x = point.gaodeCoordinate.x.toFixed(decimals);
    const y = point.gaodeCoordinate.y.toFixed(decimals);

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

    const symbol = [
        {
            markerType: "ellipse",
            markerFill: "rgb(82,155,222)",
            markerWidth: width,
            markerHeight: height,
            markerDx: 0,
            markerDy: -lineHeight,
            markerOpacity: opacity,
            markerFile,
            markerHorizontalAlignment: 'middle',
            markerVerticalAlignment: 'top'
        },
    ]

    if (textShow) {
        symbol.push(
            {
                textFaceName: fontFamily,
                textName: `${x}, ${y}`,
                textSize: fontSize,
                textDx: offsetX,
                textDy: offsetY,
                textFill: textColor,
                textOpacity: textOpacity,
                textHaloFill,
                textHaloRadius
            })
    }

    if (lineShow) {
        symbol.push(
            {
                markerType: "rectangle",
                markerFill: point.stats === 'alarm' ? alarmColor : lineColor,
                markerWidth: lineWidth,
                markerHeight: lineHeight,
                markerLineColor: point.stats === 'alarm' ? alarmColor : lineColor,
                markerLineWidth: 0,
                markerDx: 0,
                markerDy: 0,
                markerOpacity: lineOpacity,
                markerHorizontalAlignment: 'middle',
                markerVerticalAlignment: 'top'
            })
        symbol.push(
            {
                markerType: "ellipse",
                markerFill: point.stats === 'alarm' ? alarmColor : lineColor,
                markerWidth: pointSize,
                markerHeight: pointSize,
                markerLineColor: 'rgb(34,195,252)',
                markerLineWidth: 0,
                markerDx: 0,
                markerDy: 0,
                markerOpacity: lineOpacity,
                markerHorizontalAlignment: 'middle',
                markerVerticalAlignment: 'top'
            })
    }

    return symbol;
}