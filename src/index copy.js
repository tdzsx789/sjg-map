import * as maptalks from "maptalks";
import { ClusterLayer } from 'maptalks.markercluster';
import { merge } from './utils';
import Marker from './marker';
import Building from './building';
import ClusterMarker from './clusterMarker';

class SJGMap {
    clusterGroup = [];

    defaultOption = {
        center: [121.29701380939446, 29.17802745471883],
        // zoom: 16.2,
        zoom: 17.4,
        maxZoom: 18.5,
        fpsOnInteracting: 120,
        attribution: {
            content: "",
        },
        data: [],
        // pitch: 70,
        // bearing: 150,
        pitch: 0,
        bearing: 180,
        tiles: '',
        backgroundImage: '',
        maskImage: '',
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
                color: '#ffffff',
                fontSize: '16px',
                padding: '16px 0px 16px 26px',
                lineHeight: '30px',
                fontFamily: 'Alibaba-PuHuiTi-Regular',
                alarm: "rgb(252,68,70)",
                normal: "rgb(45,254,252)"
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
            style: {
                width: 30,
                height: 30,
                opacity: 1,
                color: 'rgba(24,58,96,0.7)',
            },
            line: {
                color: "rgb(34,195,252)",
                lineWidth: 2,
                lineHeight: 60,
                opacity: 1,
                pointSize: 8
            },
            text: {
                fontFamily: 'PingfangSC',
                fontSize: 20,
                color: "#ffffff",
                opacity: 1,
            },
        },
        building: {
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
            tooltip: {
                show: true,
                width: 189,
                height: 92,
                color: '#ffffff',
                fontSize: '16px',
                padding: '16px 0px 16px 26px',
                lineHeight: '30px',
                fontFamily: 'Alibaba-PuHuiTi-Regular',
                alarm: "rgb(252,68,70)",
                normal: "rgb(45,254,252)"
            }
        }
    }

    groups = [];

    clickable = true;

    on(event, func) {
        if (event === "click") {
            this.map.on("click", (e) => {
                if (this.clickable) {
                    func(e);
                }
            });
        }
    }

    add(point) {
        const marker = new Marker(point, this.option, this.clusterLayer);
        marker.on('mousedown', () => {
            this.clickable = false;
        })
        return marker;
    }

    addBuilding(data) {
        const build = new Building(data, this.option, this.buildingLayer);
        build.on('mousedown', () => {
            this.clickable = false;
        })
        return build;
    }

    drawClusterPoint() {
        if (this.clusterTimeout) clearTimeout(this.clusterTimeout);
        this.clusterTimeout = setTimeout(() => {
            if (this.clusterGroup.length > 0) {
                this.clusterGroup.forEach((ele) => {
                    ele.remove();
                })
                this.clusterGroup = [];
            }
            const clusters = this.clusterLayer.getClusters();
            clusters.forEach((ele) => {
                const marker = new ClusterMarker(ele, this.option, this.buildingLayer, this.map);
                this.clusterGroup.push(marker.origin);
            })
        }, 300)
    }

    constructor(dom, opts = {}) {
        this.option = merge(opts, this.defaultOption);
        // this.option.minZoom = this.option.zoom;
        this.option.maxZoom = this.option.maxZoom;
        this.option.baseLayer = new maptalks.TileLayer("base", {
            urlTemplate: '',
            // "https://wprd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=2&style=8&ltype=10",
            // urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            urlTemplate:
                "http://wprd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}",
            // subdomains: ['a', 'b', 'c', 'd'],
            attribution: "",
            opacity: 1,
        });
        this.option.doubleClickZoom = false;
        this.option.zoomInCenter = true;
        // this.option.draggable = false;

        this.map = new maptalks.Map(dom, this.option);
        this.map.setCursor('move');

        this.map.on("mouseup", () => {
            if (this.timeout) clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.clickable = true;
            }, 10)
            this.moving = null;
        })

        this.map.on('zoomend', (evt) => {
            console.log('eee', evt)
            // if (evt.to !== this.option.zoom) {
            //     this.map.config('draggable', true);
            // } else {
            //     this.map.panTo(this.option.center);
            //     this.map.config('draggable', false);
            //     this.map.config('zoomOrigin', [960, 540]);
            // }
            // this.drawClusterPoint();
        })

        const maxExtent = { maxx: 121.316, minx: 121.284, maxy: 29.1867, miny: 29.1685 };

        this.map.on('mousedown', (evt) => {
            this.moving = true;
            this.containerPoint = evt.containerPoint;
        })

        // this.map.on('mousemove', (evt) => {
        //     const currentZoom = this.map.getZoom();
        //     if (!this.moving || currentZoom === this.option.zoom) return;
        //     const offsetX = evt.containerPoint.x - this.containerPoint.x;
        //     const offsetY = evt.containerPoint.y - this.containerPoint.y;
        //     const extent = this.map.getExtent();
        //     const { xmax, xmin, ymax, ymin } = extent;
        //     const { maxx, minx, maxy, miny } = maxExtent;
        //     if (xmin < minx && offsetX < 0) {
        //         this.map.config('draggable', false);
        //         this.map.setMinZoom(currentZoom);
        //     } else if (xmax > maxx && offsetX > 0) {
        //         this.map.config('draggable', false);
        //         this.map.setMinZoom(currentZoom);
        //     } else if (ymin < miny && offsetY > 0) {
        //         this.map.config('draggable', false);
        //         this.map.setMinZoom(currentZoom);
        //     } else if (ymax > maxy && offsetY < 0) {
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

        this.map.on('moveend', (evt) => {
            console.log('eee', this.map.getCenter())
        })

        this.markerLayer = new maptalks.VectorLayer("markers", {
            zIndex: 1
        }).addTo(this.map);

        this.clusterLayer = new ClusterLayer('cluster', {
            zIndex: 1,
            'noClusterWithOneMarker': true,
            'maxClusterZoom': 18,
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
            'geometryEvents': false,
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
                // forceRenderOnRotating: true,
                zIndex: 0
            })
            // this.map.addLayer(imageLayer);
        }

        const canvasLayer = new maptalks.CanvasLayer('c', {
            'forceRenderOnMoving': true,
            'forceRenderOnZooming': true
        });

        const img2 = document.createElement('img');
        img2.src = this.option.maskImage;
        const img = document.createElement('img');
        img.src = this.option.backgroundImage;
        // const minZoom = this.option.zoom;
        const centerX = '' + this.option.center[0];
        const centerY = '' + this.option.center[1];
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

        this.buildingLayer = new maptalks.VectorLayer("buildings", {
            zIndex: 1
        }).addTo(this.map);
    }
}

export {
    SJGMap
}