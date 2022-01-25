import * as maptalks from "maptalks";
import * as d3 from 'd3';
import { ClusterLayer } from 'maptalks.markercluster';
import { merge } from './utils';
import Marker from './marker';
import Building from './building';
import ClusterMarker from './clusterMarker';
import SyncMap from './syncMap';

class SJGMap {
    clickable = true;
    clusterGroup = [];
    markerGroup = [];
    buildingGroup = [];

    defaultOption = {
        center: [121.2986, 29.1766],
        zoom: 16.2,
        maxZoom: 18.5,
        clusterZoom: 18.5,
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
            style: {
                width: 40,
                height: 40,
                opacity: 1,
                cursor: 'pointer'
            },
            tooltip: {
                show: true,
                width: 189,
                height: 124,
                content: undefined
            },
            line: {
                show: true,
                color: "rgb(34,195,252)",
                alarm: "rgb(252,68,70)",
                lineWidth: 2,
                lineHeight: 60,
                opacity: 1,
                pointSize: 8
            },
            text: {
                show: true,
                fontFamily: 'PingfangSC',
                fontSize: 12,
                offsetY: 8,
                offsetX: 0,
                color: "#34495e",
                opacity: 1,
                textHaloFill: "#fff",
                textHaloRadius: 2,
                decimals: 4
            },
            images: []
        },
        cluster: {
            clusterRadius: 40,
            content: undefined,
            update: undefined,
            dx: 0,
            dy: 0,
            line: {
                color: "rgb(34,195,252)",
                lineWidth: 2,
                lineHeight: 60,
                opacity: 1,
                pointSize: 8
            },
        },
        building: {
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
                if (this.clickable) {
                    func(e);
                }
            });
        }
    }

    showHideMarker(marker) {
        if (!this.option.dynamicHideMarker) return;
        const containerExtent = marker.origin.getContainerExtent();
        const isIn = d3.polygonContains([
            [1001, 244], [1812, 376], [935, 968], [96, 624]
        ], [containerExtent.xmin, containerExtent.ymax]);
        if (!isIn) {
            marker.origin.hide();
        } else {
            marker.origin.show();
        }
    }

    add(point) {
        const marker = new Marker(point, this.option, this.clusterLayer);
        marker.on('mousedown', () => {
            this.clickable = false;
        })
        this.markerGroup.push(marker);
        return marker;
    }

    addBuilding(data) {
        const build = new Building(data, this.option, this.buildingLayer);
        build.on('mousedown', () => {
            this.clickable = false;
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
            const clusters = this.clusterLayer.getClusters();
            clusters.forEach((ele) => {
                const marker = new ClusterMarker(ele, this.option, this.buildingLayer, this.map);
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
        // this.option.draggable = false;

        this.map = new maptalks.Map(dom, this.option);
        this.map.setCursor('move');

        this.map2 = new SyncMap(dom);

        this.map.on("mouseup", () => {
            if (this.timeout) clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.clickable = true;
            }, 10)
            this.moving = null;
        })

        this.map.on('zoomstart', (evt) => {
            this.startZoom = evt.from;
        })

        this.map.on('zoomend', (evt) => {
            const zoomIncrease = evt.to / this.startZoom;
            const map2Zoom = this.map2.getZoom();
            const zoom2 = map2Zoom * zoomIncrease;
            this.map2.setZoom(zoom2);

            // if (evt.to !== this.option.zoom) {
            //     this.map.config('draggable', true);
            // } else {
            //     this.map.panTo(this.option.center);
            //     this.map.config('draggable', false);
            // }
            this.drawClusterPoint();
        })

        this.map.on('movestart', (evt) => {
            this.startMove = evt.containerPoint;
        })

        this.map.on('moveend', (evt) => {
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

        // const maxExtent = { maxx: 121.316, minx: 121.284, maxy: 29.1867, miny: 29.1685 };

        // this.map.on('mousedown', (evt) => {
        //     this.moving = true;
        //     this.containerPoint = evt.containerPoint;
        // })

        // this.map.on('mousemove', (evt) => {
        //     const currentZoom = this.map.getZoom();
        //     if (!this.moving || currentZoom === this.option.zoom) return;
        //     const offsetX = evt.containerPoint.x - this.containerPoint.x;
        //     const offsetY = evt.containerPoint.y - this.containerPoint.y;
        //     const extent = this.map.getExtent();
        //     const { xmax, xmin, ymax, ymin } = extent;
        //     const { maxx, minx, maxy, miny } = maxExtent;

        //     if (xmin < minx && offsetX <= 0) {
        //         this.map.config('draggable', false);
        //         this.map.setMinZoom(currentZoom);
        //     } else if (xmax > maxx && offsetX >= 0) {
        //         this.map.config('draggable', false);
        //         this.map.setMinZoom(currentZoom);
        //     } else if (ymin < miny && offsetY >= 0) {
        //         this.map.config('draggable', false);
        //         this.map.setMinZoom(currentZoom);
        //     } else if (ymax > maxy && offsetY <= 0) {
        //         this.map.config('draggable', false);
        //         this.map.setMinZoom(currentZoom);
        //     } else {
        //         this.map.config('draggable', true);
        //         this.map.setMinZoom(this.option.zoom)
        //     }
        // })

        // const zoomExtent = { maxx: 121.31833942871094, minx: 121.28126057128907, maxy: 29.18670478993019, miny: 29.16849440213477 };
        // this.map.on('zooming', (evt) => {
        //     const extent = this.map.getExtent();
        //     const { xmax, xmin, ymax, ymin } = extent;
        //     const { maxx, minx, maxy, miny } = zoomExtent;
        //     if (xmax > maxx) {
        //         this.map.setMinZoom(evt.to);
        //     } else if (xmin < minx) {
        //         this.map.setMinZoom(evt.to);
        //     } else if (ymax > maxy) {
        //         this.map.setMinZoom(evt.to);
        //     } else if (ymin < miny) {
        //         this.map.setMinZoom(evt.to);
        //     } else {
        //         this.map.setMinZoom(this.option.zoom)
        //     }
        // })

        this.clusterLayer = new ClusterLayer('cluster', {
            zIndex: 1,
            'noClusterWithOneMarker': true,
            'maxClusterZoom': this.option.clusterZoom,
            maxClusterRadius: this.option.cluster.clusterRadius,
            'symbol': [{
                'markerType': 'ellipse',
                'markerFill': { property: 'count', type: 'interval', stops: [[0, 'rgb(135, 196, 240)'], [10, '#1bbc9b'], [20, 'rgb(216, 115, 149)']] },
                'markerFillOpacity': 0,
                'markerLineOpacity': 1,
                'markerLineWidth': 0,
                'markerLineColor': '#000000',
                'markerWidth': { property: 'count', type: 'interval', stops: [[0, 40], [10, 60], [20, 80]] },
                'markerHeight': { property: 'count', type: 'interval', stops: [[0, 40], [10, 60], [20, 80]] }
            }],
            'drawClusterText': false,
            'geometryEvents': true,
            'single': false
        }).addTo(this.map);
        this.drawClusterPoint();

        const mapExtent = [121.31638, 29.1666, 121.2802, 29.1866];
        const stepX = (mapExtent[2] - mapExtent[0]) / 3;
        const stepY = (mapExtent[3] - mapExtent[1]) / 3;

        const { tiles } = this.option;
        for (let i = 0; i < tiles.length; i++) {
            const url = tiles[i];
            const volumn = i % 3;
            const row = Math.floor(i / 3);
            const currentExtent = [
                mapExtent[0] + stepX * volumn,
                mapExtent[1] + stepY * row,
                mapExtent[0] + stepX * (volumn + 1),
                mapExtent[1] + stepY * (row + 1),
            ]
            const imageLayer = new maptalks.ImageLayer("images" + i, [{
                url,
                extent: currentExtent,
                opacity: 1,
            }], {
                forceRenderOnMoving: true,
                forceRenderOnZooming: true,
                forceRenderOnRotating: false,
                zIndex: 0
            })
            this.map.addLayer(imageLayer);
        }

        const canvasLayer = new maptalks.CanvasLayer('c', {
            'forceRenderOnMoving': true,
            'forceRenderOnZooming': true
        });

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

        this.buildingLayer = new maptalks.VectorLayer("buildings", {
            zIndex: 1
        }).addTo(this.map);
    }
}

export {
    SJGMap
}