import * as maptalks from "maptalks";

class Heatmap {
    constructor(layer, data, config) {
        layer.setData(data);
        layer.config(config);
        this.__layer = layer;
    }

    setData(data) {
        this.__layer.setData(data);
    }

    setConfig(config) {
        this.__layer.config(config);
    }
}

export default Heatmap;