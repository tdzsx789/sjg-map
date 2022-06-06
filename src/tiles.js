class Tiles {
    constructor(canvas, images, { scale, offsetX, offsetY }) {
        const ctx = canvas.getContext('2d');
        const w = 1590 * scale;
        const h = 1000 * scale;

        const loadImage = url => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error(`load ${url} fail`));
                img.src = url;
            });
        };

        const ss = 1.41;
        const extent = [0, 0, w * ss, h * ss];
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
            ctx.drawImage(img, options.x + offsetX * scale - 360, options.y + offsetY * scale - 480, options.w, options.h);
        };

        imageGroup.forEach(depict);
    }
}

export default Tiles;