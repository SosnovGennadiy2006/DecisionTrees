class DataElem {
    constructor(x, y, cl) {
        this.x = x;
        this.y = y;
        this.class = cl;
    }
}

class DatasetGenerator {
    constructor() {}

    static w = 1;
    static h = 1;

    static _getSizes(n, m) {
        var sizes = [];
        for (var i = 0; i < m - 1; i++) {
            sizes.push(Math.floor(n / m));
        }
        sizes.push(n - Math.floor(n / m) * (m - 1));
        return sizes;
    }

    static generateLines(n) {
        var sizes = DatasetGenerator._getSizes(n, 2);
        var t = 0.2;
        var b = 0.8;
        var dataset = [];
        for (var i = 0; i < 2; i++) {
            for (var j = 0; j < sizes[i]; j++) {
                var x1, x2;
                if (i == 0) {
                    x1 = Math.random() * (b - t) + t - 0.1;
                    x2 = x1 + 0.2;
                } else {
                    x1 = Math.random() * (b - t) + t + 0.1;
                    x2 = x1 - 0.2;
                }
                dataset.push(new DataElem(x1, x2, i));
            }
        }
        return dataset;
    }

    static generateCircles(n) {
        var sizes = DatasetGenerator._getSizes(n, 2);
        var r = 0.2;
        var dataset = [];
        for (var i = 0; i < 2; i++) {
            for (var j = 0; j < sizes[i]; j++) {
                var angle = Math.random() * 2 * Math.PI;
                var x1 = (Math.cos(angle) * r * (i + 1) + DatasetGenerator.w / 2) / DatasetGenerator.w;
                var x2 = (Math.sin(angle) * r * (i + 1) + DatasetGenerator.h / 2) / DatasetGenerator.h;
                dataset.push(new DataElem(x1, x2, i));
            }
        }
        return dataset;
    }

    static generateSpirals(n) {
        var a = 10, b = 0.7, R = 0.4;
        var sizes = DatasetGenerator._getSizes(n, 2);
        var dataset = [];
        for (var i = 0; i < 2; i++) {
            for (var j = 0; j < sizes[i]; j++) {
                var r = Math.random() * R;
                var theta = Math.log(r / a) / b;
                var x1 = DatasetGenerator.w / 2 + r * Math.cos(theta + 2 * Math.PI / 2 * i);
                var x2 = DatasetGenerator.h / 2 + r * Math.sin(theta + 2 * Math.PI / 2 * i);
                dataset.push(new DataElem(x1, x2, i));
            }
        }
        return dataset;
    }

    static generateXOR(n) {
        var m = 4;
        var sizes = DatasetGenerator._getSizes(n, m);
        var dataset = [];
        for (var i = 0; i < 2; i++) {
            for (var j = 0; j < 2; j++) {
                for (var k = 0; k < sizes[i * 2 + j]; k++) {
                    var a = DatasetGenerator.w * 0.05 + DatasetGenerator.w * 0.9 / 2 * i;
                    var b = DatasetGenerator.h * 0.05 + DatasetGenerator.h * 0.9 / 2 * j;
                    var x1 = a + DatasetGenerator.w * 0.9 / 2 * Math.random();
                    var x2 = b + DatasetGenerator.h * 0.9 / 2 * Math.random();
                    dataset.push(new DataElem(x1 / DatasetGenerator.w, x2 / DatasetGenerator.h, (i + j) % 2));
                }
            }
        }
        return dataset;
    }
}