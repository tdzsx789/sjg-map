import * as maptalks from "maptalks";
import * as d3 from 'd3';
import { ClusterLayer } from 'maptalks.markercluster';
import { merge } from './utils';
import Marker from './marker';
import Building from './building';
import ClusterMarker from './clusterMarker';
import SyncMap from './syncMap';

class SJGMap {
    clusterGroup = [];
    markerGroup = [];
    buildingGroup = [];

    defaultOption = {
        center: [121.2986, 29.1766],
        zoom: 16.2,
        maxZoom: 18.5,
        clusterZoom: 18.5,
        zoomAnimation: false,
        zoomAnimationDuration: 0,
        panAnimation: false,
        panAnimationDuration: 0,
        viewHistory: false,
        dragRotate: false,
        dragPitch: false,
        fog: false,
        // fpsOnInteracting: 60,
        attribution: {
            content: "",
        },
        data: [],
        pitch: 0,
        bearing: 180,
        tiles: '',
        backgroundImage: '',
        maskImage: '',
        dynamicHideMarker: false,
        marker: {
            draggable: false,
            tooltip: {
                show: true,
                width: 189,
                height: 124,
                content: undefined,
                dx: 0,
                dy: -10
            },
            height: 100,
            content: function (params) {
                const color = params.stats === 'alarm' ? 'rgb(252,68,70)' : 'rgb(34,195,252)';
                return `<div style="width: 30px;height: 100px;cursor:pointer;">
                <div style="width: 30px;height: 30px;background: url(${params.url});background-size: 100% 100%;"></div>
                <div style="width: 1px;height: 60px;margin:auto;background: ${color};"></div>
                <div style="width: 6px;height: 6px;margin:auto;background: ${color};border-radius: 50%;"></div>
                </div>`
            },
            images: []
        },
        cluster: {
            clusterRadius: 40,
            content: undefined,
            update: undefined,
            dx: 0,
            dy: 0,
            footer: {
                height: 70,
                content: function () {
                    return `<div style="width: 10px;height: 70px;">
                    <div style="width: 2px;height: 60px;margin:auto;background: rgb(34,195,252);"></div>
                    <div style="width: 10px;height: 10px;background: rgb(34,195,252);border-radius: 50%;"></div>
                    </div>`
                }
            }
        },
        building: {
            mask: {
                className: undefined,
                nodeId: undefined,
            },
            content: undefined,
            update: undefined,
            style: {
                fontFamily: 'Alibaba-PuHuiTi-Regular',
                fontSize: 14,
                color: '#ffffff'
            },
            point: {
                width: 40,
                height: 40,
                draggable: false
            },
            dx: 0,
            dy: 0
        }
    }

    on(event, func) {
        if (event === "click") {
            this.map.on("click", (e) => {
                this.clickContainerPoint = e.containerPoint;
                const coordinate = this.map2.containerPointToCoordinate(this.clickContainerPoint);
                e.gaodeCoordinate = coordinate;
                if (!window.unclickable) {
                    func(e);
                }
            });
        }
    }

    showHideMarker(marker) {
        if (!this.option.dynamicHideMarker) return;
        const pos = marker.origin.getPosition();
        // const containerExtent = marker.origin.getContainerExtent();
        const isIn = d3.polygonContains([
            [1001, 244], [1812, 376], [935, 968], [96, 624]
        ], [pos.x, pos.y]);
        if (!isIn) {
            if (marker.content) marker.content.hide();
            marker.origin.hide();
        } else {
            if (marker.content) marker.content.show();
            marker.origin.show();
        }
    }

    add(point) {
        const marker = new Marker(point, this.option, this.clusterLayer,
            (marker) => {
                marker.calcuMarker.remove();
                marker.origin.remove();
                this.drawClusterPoint();
            },
            (event, func, marker) => {
                if (event === "drag") {
                    marker.origin.on('dragend', (d) => {
                        const coord = marker.origin.getCoordinates();
                        marker.calcuMarker.setCoordinates(coord);
                        d.coordinate = coord;
                        func(d);
                        this.drawClusterPoint();
                    })
                } else {
                    marker.origin.on(event, (d) => {
                        window.unclickable = true;
                        func(d);
                    })
                }
            });
        this.markerGroup.push(marker);
        this.drawClusterPoint();
        return marker;
    }

    addBuilding(data) {
        const build = new Building(data, this.option, this.buildingLayer);
        build.on('mousedown', () => {
            window.unclickable = true;
        })
        this.buildingGroup.push(build);
        return build;
    }

    drawClusterPoint() {
        if (this.clusterTimeout) clearTimeout(this.clusterTimeout);
        if (this.clusterGroup.length > 0) {
            this.clusterGroup.forEach((ele) => {
                if (ele.content) ele.content.remove();
                ele.origin.remove();
            })
            this.clusterGroup = [];
        }
        this.clusterTimeout = setTimeout(() => {
            const { content } = this.option.marker;
            const clusters = this.clusterLayer.getClusters();
            const geoList = this.clusterLayer._geoList;
            const markersId = [];
            clusters.forEach((ele) => {
                ele.children.forEach((child) => {
                    markersId.push(child._id);
                })
            });
            geoList.forEach((marker) => {
                const isCluster = markersId.find((ele) => ele === marker._id);
                if (!isCluster) {
                    const inner = content(marker.__option);
                    marker.uimarker.setContent(inner);
                } else {
                    marker.uimarker.setContent('');
                }
            })
            clusters.forEach((ele) => {
                const marker = new ClusterMarker(ele, this.option, this.markerLayer, this.map);
                this.clusterGroup.push(marker);
                this.showHideMarker(marker);
            })
            this.markerGroup.forEach((marker) => {
                this.showHideMarker(marker);
            })
            this.buildingGroup.forEach((marker) => {
                this.showHideMarker(marker);
            })
        }, 300)
    }

    constructor(dom, opts = {}) {
        this.option = merge(opts, this.defaultOption);
        this.option.minZoom = this.option.zoom;
        this.option.baseLayer = new maptalks.TileLayer("base", {
            urlTemplate: '',
            // "https://wprd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=2&style=8&ltype=10",
            // urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            // urlTemplate:
            //   "http://wprd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}",
            // subdomains: ['a', 'b', 'c', 'd'],
            attribution: "",
            opacity: 1,
        });
        this.option.doubleClickZoom = false;
        this.option.zoomInCenter = true;
        this.option.hitDetect = false;
        // this.option.draggable = false;

        this.map = new maptalks.Map(dom, this.option);
        this.map.setCursor('move');

        this.map2 = new SyncMap(dom);

        this.map.on('mousedown', (evt) => {
            this.map.setMinZoom(this.option.zoom);
            this.startMove = evt.containerPoint;
        })

        this.map.on("mouseup", (evt) => {
            this.clusterGroup.forEach((marker) => {
                this.showHideMarker(marker);
            })
            this.markerGroup.forEach((marker) => {
                this.showHideMarker(marker);
            })
            this.buildingGroup.forEach((marker) => {
                this.showHideMarker(marker);
            })

            if (this.startMove) {
                const diffX = evt.containerPoint.x - this.startMove.x;
                const diffY = evt.containerPoint.y - this.startMove.y;
                const map2center = this.map2.getCenter();
                const map2centerCantainerPoint = this.map2.coordinateToContainerPoint(map2center);
                const map2NewContainerPoint = { x: map2centerCantainerPoint.x - diffX, y: map2centerCantainerPoint.y - diffY };
                const map2NewCenter = this.map2.containerPointToCoordinate(map2NewContainerPoint);
                this.map2.setCenter(map2NewCenter);
            }
        })

        this.map.on('zoomstart', (evt) => {
            this.startZoom = evt.from;
        })

        this.map.on('zoomend', (evt) => {
            const zoomIncrease = evt.to / this.startZoom;
            const map2Zoom = this.map2.getZoom();
            const zoom2 = map2Zoom * zoomIncrease;
            this.map2.setZoom(zoom2);
            this.drawClusterPoint();
        })

        this.clusterLayer = new ClusterLayer('cluster', {
            zIndex: 1,
            'noClusterWithOneMarker': true,
            'maxClusterZoom': this.option.clusterZoom,
            maxClusterRadius: this.option.cluster.clusterRadius,
            'symbol': [{
                'markerType': 'ellipse',
                'markerFill': '#000000',
                'markerFillOpacity': 0,
                'markerLineOpacity': 1,
                'markerLineWidth': 0,
                'markerLineColor': '#000000',
                'markerWidth': 0,
                'markerHeight': 0
            }],
            'textSymbol': {},
            'drawClusterText': false,
            'geometryEvents': true,
            'single': false,
            forceRenderOnZooming: false,
            animation: false,
            'animationDuration': 0,
        }).addTo(this.map);

        const mapExtent = [121.31638, 29.1666, 121.2802, 29.1866];
        const stepX = (mapExtent[2] - mapExtent[0]) / 2;
        const stepY = (mapExtent[3] - mapExtent[1]) / 2;

        const { tiles } = this.option;
        for (let i = 0; i < tiles.length; i++) {
        }
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
                opacity: 1,
            }
        })

        const imageLayer = new maptalks.ImageLayer("images", imageGroup, {
            forceRenderOnMoving: true,
            forceRenderOnZooming: true,
            forceRenderOnRotating: false,
            zIndex: 0
        })
        this.map.addLayer(imageLayer);

        // const mapExtent = [121.31638, 29.1666, 121.2802, 29.1866];
        const maxExtent = new maptalks.Extent([121.31628, 29.1671, 121.2812, 29.1861]);

        // this.map.getLayer('v')
        // const vlayer = new maptalks.VectorLayer('v').addTo(this.map);
        // vlayer.addGeometry(
        //     new maptalks.Polygon(maxExtent.toArray(), {
        //         symbol: { 'polygonOpacity': 0, 'lineWidth': 5, 'lineColor': 'red' }
        //     })
        // );

        this.preCenter = this.map.getCenter();
        this.currentExtent = this.map.getExtent();

        this.map.on('moving', (e) => {
            const nowExtent = this.map.getExtent();
            const isIn = nowExtent.within(maxExtent);
            if (!isIn) {
                this.map.setCenter(this.preCenter);
                return;
            }
            this.preCenter = this.map.getCenter();
        });

        this.preZoom = this.map.getZoom();
        this.map.on('zooming', (e) => {
            if (!this.map.getExtent().within(maxExtent)) {
                this.map.setMinZoom(this.preZoom);
                return;
            }
            this.preZoom = this.map.getZoom();
        })

        const canvasLayer = new maptalks.CanvasLayer('c', {
            forceRenderOnMoving: true,
            forceRenderOnZooming: true,
            forceRenderOnRotating: false,
        });

        if (this.option.maskImage || this.option.backgroundImage) {
            const img2 = document.createElement('img');
            img2.src = this.option.maskImage;
            const img = document.createElement('img');
            img.src = this.option.backgroundImage;
            const minZoom = this.option.zoom;
            const centerX = '' + this.option.center[0];
            const centerY = '' + this.option.center[1];
            img2.onload = () => {
                img.onload = () => {
                    canvasLayer.draw = function (context) {
                        const size = this.map.getSize();
                        const { width, height } = size;
                        context.drawImage(img, 0, 0, width, height);
                        const currentZoom = this.map.getZoom();
                        if (currentZoom === minZoom) {
                            const currentCenter = this.map.getCenter();
                            const currentX = currentCenter.x.toFixed(4);
                            const currentY = currentCenter.y.toFixed(4);
                            if (centerX === currentX && centerY === currentY) {
                                context.drawImage(img2, 108, 44, 1767, 916);
                            }
                        }
                        this.completeRender();
                    };

                    canvasLayer.drawOnInteracting = function (context) {
                        this.draw(context);
                    };
                    this.map.addLayer(canvasLayer);
                }
            }
        }

        this.buildingLayer = new maptalks.VectorLayer("buildings", {
            zIndex: 1
        }).addTo(this.map);

        this.markerLayer = new maptalks.VectorLayer("markers", {
            zIndex: 1
        }).addTo(this.map);
    }
}

export {
    SJGMap
}