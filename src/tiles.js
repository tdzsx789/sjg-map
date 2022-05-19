class Tiles {
    constructor(canvas, images, { width, height }) {
        const ctx = canvas.getContext('2d');

        const loadImage = url => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error(`load ${url} fail`));
                img.src = url;
            });
        };

        const extent = [0, 0, width, height];
        const stepX = (extent[2] - extent[0]) / 2;
        const stepY = (extent[3] - extent[1]) / 2;
        const imageGroup = images.map((url, i) => {
            const volumn = i % 2;
            const row = Math.floor(i / 2);
            return {
                url,
                x: extent[0] + stepX * volumn,
                y: extent[1] + stepY * row,
                w: stepX,
                h: stepY
            }
        })

        const depict = async (options) => {
            const img = await loadImage(options.url);
            ctx.drawImage(img, options.x, options.y, options.w, options.h);
        };

        imageGroup.forEach(depict);
    }
}

export default Tiles;