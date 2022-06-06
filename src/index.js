import * as maptalks from "maptalks";
import * as d3 from 'd3';
import WZoom from 'vanilla-js-wheel-zoom';
import { ClusterLayer } from 'maptalks.markercluster';
import { HeatLayer } from 'maptalks.heatmap';
import { merge } from './utils';
import Marker from './marker';
import Building from './building';
import ClusterMarker from './clusterMarker';
// import SyncMap from './syncMap';
import OldMap from './oldMap';
import Heatmap from './heatmap';
import DrawTiles from './tiles';

class SJGMap {
    clusterGroup = [];
    markerGroup = [];
    buildingGroup = [];

    defaultOption = {
        pitch: 72,
        bearing: 150,
        maxZoom: 18.5,
        clusterZoom: 18.5,
        draggable: false,
        zoomable: false,
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
        tiles: '',
        backgroundImage: '',
        maskImage: '',
        backgroundOffset: [0, 0],
        dynamicHideMarker: false,
        marker: {
            draggable: false,
            height: undefined,
            tooltip: {
                show: true,
                width: 189,
                height: 124,
                content: undefined,
                dx: 0,
                dy: -10
            },
            content: function (params) {
                const color = params.stats === 'alarm' ? 'rgb(252,68,70)' : 'rgb(34,195,252)';
                return `<div style="width: 30px;height: 100px;cursor:pointer;">
                <div style="width: 30px;height: 30px;background: url(${params.url});background-size: 100% 100%;"></div>
                <div style="width: 1px;height: 60px;margin:auto;background: ${color};"></div>
                <div style="width: 6px;height: 6px;margin:auto;background: ${color};border-radius: 50%;"></div>
                </div>`
            },
            update: undefined,
            images: []
        },
        cluster: {
            clusterRadius: 100,
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

    defaultHeatmapOption = {
        'data': [],
        'radius': 80,
        'blur': 30,
        'gradient': {
            0.4: 'blue',
            0.6: 'cyan',
            0.7: 'lime',
            0.8: 'yellow',
            1.0: 'red'
        },
        'max': 1,
        'radius': 25,
        'blur': 15,
        'minOpacity': 0.05
    }

    on(event, func) {
        if (event === "click") {
            this.map.on("click", (e) => {
                // this.clickContainerPoint = e.containerPoint;
                // const coordinate = this.map2.containerPointToCoordinate(this.clickContainerPoint);
                e.gaodeCoordinate = e.coordinate;
                if (!window.unclickable) {
                    func(e);
                }
            });
        }
    }

    getGaodeLatlng(point) {
        const latlng = new OldMap(this.dom, point);
        return latlng;
    }

    showHideMarker(marker) {
        if (!this.option.dynamicHideMarker) return;
        const pos = marker.origin.getPosition();
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
        const marker = new Marker(point, this.map, this.option, this.clusterLayer,
            (marker) => {
                marker.calcuMarker.remove();
                marker.origin.remove();
                this.drawClusterPoint();
            },
            (event, func, marker) => {
                if (event === "drag") {
                    marker.origin.on('dragstart', (d) => {
                        this._pointPosition = d.viewPoint;
                    })
                    marker.origin.on('dragend', (d) => {
                        if (JSON.stringify(this._pointPosition) !== JSON.stringify(d.viewPoint)) {
                            const coord = marker.origin.getCoordinates();
                            marker.calcuMarker.setCoordinates(coord);
                            d.coordinate = coord;
                            func(d);
                            this.drawClusterPoint();
                        }
                    })
                } else if (event === 'click') {
                    marker.origin.on('click', (d) => {
                        if (JSON.stringify(this._pointPosition) === JSON.stringify(d.viewPoint)) {
                            window.unclickable = true;
                            func(d);
                        }
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
            const { content, dx, dy } = this.option.marker;
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

    removeAll() {
        for (let i = this.markerGroup.length - 1; i >= 0; i--) {
            const marker = this.markerGroup[i];
            marker.calcuMarker.remove();
            marker.origin.remove();
        }

        for (let i = this.clusterGroup.length - 1; i >= 0; i--) {
            const cluster = this.clusterGroup[i];
            cluster.content.remove();
            cluster.origin.remove();
        }
        this.markerGroup = [];
        this.clusterGroup = [];
    }

    destroy() {
        this.map.remove();
        // this.map2.remove();
    }

    heatmap(heatmapOption) {
        const heatmapConfig = merge(heatmapOption, this.defaultHeatmapOption);
        const heatmapData = heatmapConfig.data.map((ele) => [ele.x, ele.y, ele.value]);
        const heatmap = new Heatmap(this.heatmapLayer, heatmapData, heatmapConfig);
        return heatmap;
    }

    constructor(dom, opts = {}) {
        this.option = merge(opts, this.defaultOption);
        this.dom = dom;
        // this.option.minZoom = this.option.zoom;
        this.option.baseLayer = new maptalks.TileLayer("base", {
            // urlTemplate: '',
            // "https://wprd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=2&style=8&ltype=10",
            // urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            // urlTemplate:
            //   "http://wprd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}",
            // urlTemplate: 'https://wprd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=2&style=8<ype=11',
            // subdomains: ['a', 'b', 'c', 'd'],
            attribution: "",
            opacity: 0,
        });
        this.option.draggable = false;
        this.option.scrollWheelZoom = false;
        this.option.doubleClickZoom = false;
        this.option.zoomInCenter = false;
        this.option.hitDetect = false;
        this.option.zoom = 17.44;
        this.option.center = [121.29705559775402, 29.178167355972136];

        const content = d3.select(dom)
            .append('div')
            .style('width', '100%')
            .style('height', '100%')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('justify-content', 'center');

        const container = content
            .append('div')
            .style('position', 'relative')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('box-sizing', 'border-box');

        const backgroundOut = d3.select('body')
            .append('div')
            .style('position', 'absolute')
            .style('width', '100%')
            .style('height', '100%')
            .style('left', 0)
            .style('top', 0)
            .style('z-index', 0)
            .style('pointer-events', 'none')
            .style('background', `url(${this.option.backgroundImage})`)
            .style('background-repeat', 'no-repeat')
            .style('background-size', '100% 100%')
            .style('display', 'none');

        const backgroundIn = container
            .append('div')
            .style('position', 'absolute')
            .style('width', '2010px')
            .style('height', '1131px')
            .style('left', '-44px')
            .style('top', '-9px')
            .style('z-index', 0)
            .style('pointer-events', 'none')
            .style('background', `url(${this.option.backgroundImage})`)
            .style('background-repeat', 'no-repeat')
            .style('background-size', '100% 100%');

        const maskImage = container
            .append('div')
            .style('position', 'absolute')
            .style('width', '1850px')
            .style('height', '950px')
            .style('left', '70px')
            .style('top', '44px')
            .style('z-index', 0)
            .style('pointer-events', 'none')
            .style('background', `url(${this.option.maskImage})`)
            .style('background-repeat', 'no-repeat')
            .style('background-size', '100% 100%');

        const w = 1920;
        const h = 1080;

        const box = container.node();
        const clientWidth = document.documentElement.clientWidth;
        const clientHeight = document.documentElement.clientHeight;
        const wheelzoom = WZoom.create(box, {
            type: 'html',
            width: clientWidth,
            height: clientHeight,
            dragScrollable: true,
            minScale: 1,
            maxScale: 2,
            speed: 20,
            zoomOnClick: false,
            watchImageChange: false,
            smoothExtinction: 0,
            dragScrollableOptions: {
                smoothExtinction: 0
            }
        });

        const element = d3.select(wheelzoom.content.$element);

        let isShowMask = true;
        element.on('wheel', (evt) => {
            const computedTransform = getComputedStyle(element.node()).transform;
            const matrix = computedTransform.match(/matrix\(([^\)]*)\)/)[1].split(/, *| +/);
            if (matrix[0] === '1' && !isShowMask) {
                maskImage.style('display', 'block');
                backgroundIn.style('display', 'block');
                backgroundOut.style('display', 'none');
                isShowMask = true;
            }
            if (matrix[0] !== '1' && isShowMask) {
                maskImage.style('display', 'none');
                backgroundIn.style('display', 'none');
                backgroundOut.style('display', 'block');
                isShowMask = false;
            }
        })

        const canvas = container.append('canvas')
            .style('width', `${w}px`)
            .style('height', `${h}px`)
            .attr('width', w * 2)
            .attr('height', h * 2)
            .style('pointer-events', 'none')
            .style('opacity', 1)

        const offsetX = this.option.backgroundOffset[0];
        const offsetY = this.option.backgroundOffset[1];
        new DrawTiles(canvas.node(), this.option.tiles, { scale: 2, offsetX, offsetY });

        const mapContainer = container.append('div')
            .style('position', 'absolute')
            .style('width', `${w}px`)
            .style('height', `${h}px`)
            .style('left', `${offsetX}px`)
            .style('top', `${offsetY}px`);

        this.map = new maptalks.Map(mapContainer.node(), this.option);
        this.map.setCursor('move');

        // this.map.on('moveend', () => {
        //     console.log('mmm', this.map.getCenter())
        // })

        // this.map.on('mousedown', (evt) => {
        //     // this.map.setMinZoom(this.option.zoom);
        //     this.startMove = evt.containerPoint;
        // })

        // this.map.on("mouseup", (evt) => {
        //     this.clusterGroup.forEach((marker) => {
        //         this.showHideMarker(marker);
        //     })
        //     this.markerGroup.forEach((marker) => {
        //         this.showHideMarker(marker);
        //     })
        //     this.buildingGroup.forEach((marker) => {
        //         this.showHideMarker(marker);
        //     })
        // })

        // this.map.on('zoomstart', (evt) => {
        //     this.startZoom = evt.from;
        // })

        // this.map.on('zoomend', (evt) => {
        //     this.drawClusterPoint();
        // })

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

        // const maxExtent = new maptalks.Extent([121.31628, 29.1671, 121.2812, 29.1861]);

        // this.preCenter = this.map.getCenter();
        // this.currentExtent = this.map.getExtent();

        // this.map.on('moving', (e) => {
        //     const nowExtent = this.map.getExtent();
        //     const isIn = nowExtent.within(maxExtent);
        //     if (!isIn) {
        //         this.map.setCenter(this.preCenter);
        //         return;
        //     }
        //     this.preCenter = this.map.getCenter();
        // });

        // this.preZoom = this.map.getZoom();
        // this.map.on('zooming', (e) => {
        //     if (!this.map.getExtent().within(maxExtent)) {
        //         this.map.setMinZoom(this.preZoom);
        //         return;
        //     }
        //     this.preZoom = this.map.getZoom();
        // })

        // if (this.option.maskImage || this.option.backgroundImage) {
        //     const canvasLayer = new maptalks.CanvasLayer('c', {
        //         forceRenderOnMoving: true,
        //         forceRenderOnZooming: true,
        //         forceRenderOnRotating: false,
        //     });

        //     const img2 = document.createElement('img');
        //     img2.src = this.option.maskImage;
        //     const img = document.createElement('img');
        //     img.src = this.option.backgroundImage;
        //     const minZoom = this.option.zoom;
        //     const centerX = '' + this.option.center[0];
        //     const centerY = '' + this.option.center[1];
        //     img2.onload = () => {
        //         img.onload = () => {
        //             canvasLayer.draw = function (context) {
        //                 const size = this.map.getSize();
        //                 const { width, height } = size;
        //                 context.drawImage(img, 0, 0, width, height);
        //                 const currentZoom = this.map.getZoom();
        //                 if (currentZoom === minZoom) {
        //                     const currentCenter = this.map.getCenter();
        //                     const currentX = currentCenter.x.toFixed(4);
        //                     const currentY = currentCenter.y.toFixed(4);
        //                     if (centerX === currentX && centerY === currentY) {
        //                         context.drawImage(img2, 108, 44, 1767, 916);
        //                     }
        //                 }
        //                 this.completeRender();
        //             };

        //             canvasLayer.drawOnInteracting = function (context) {
        //                 this.draw(context);
        //             };
        //             this.map.addLayer(canvasLayer);
        //         }
        //     }
        // }

        this.buildingLayer = new maptalks.VectorLayer("buildings", {
            zIndex: 1
        }).addTo(this.map);

        this.markerLayer = new maptalks.VectorLayer("markers", {
            zIndex: 1
        }).addTo(this.map);

        this.heatmapLayer = new HeatLayer('heatmap').addTo(this.map);
    }
}

export {
    SJGMap
}