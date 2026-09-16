/* Класс для отображения датасета и разбиения */
class DatasetViewer {
    constructor() {
        this.axes = document.getElementById("dataset_axes");
        this.rects_container = document.getElementById("rects_container");
        this.lines_container = document.getElementById("lines_container");
        this.glowing_container = document.getElementById("glowing");
        this.points_svg = document.getElementById("dataset_points");
        this.margin = {top: 10, right: 10, bottom: 40, left: 40};
        this.pointRadius = 3.5;
        this.colors = ["#2ca02c", "#d62728"];
        this.rectOpacity = 0.7;
        this.stripeWidth = 50;
        this.dragState = null;
        this.movableId = -1;
        this.lineId = -1;
        this.fillStyle = 0;
        this.isDrawable = false;
        this.drawClass = 0;
        this.colorMixer = new ColorMixer();

        this.rects = [];
        this.dataset = [];

        this.resize(280, 280);
        
        document.addEventListener('mousemove', this.onDrag.bind(this));
        document.addEventListener('mouseup', this.endDrag.bind(this));

        this.points_svg.addEventListener('click', (e) => {
            this.onClick(e);
        });
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.graphWidth = this.width - this.margin.left - this.margin.right;
        this.graphHeight = this.height - this.margin.top - this.margin.bottom;

        this.rects_container.style.left = this.margin.left + "px";
        this.rects_container.style.top = this.margin.top + "px";
        this.rects_container.style.width = this.graphWidth + "px";
        this.rects_container.style.height = this.graphHeight + "px";
        
        this.lines_container.style.left = this.margin.left + "px";
        this.lines_container.style.top = this.margin.top + "px";
        this.lines_container.style.width = this.graphWidth + "px";
        this.lines_container.style.height = this.graphHeight + "px";
        
        this.glowing_container.style.left = this.margin.left + "px";
        this.glowing_container.style.top = this.margin.top + "px";
        this.glowing_container.style.width = this.graphWidth + "px";
        this.glowing_container.style.height = this.graphHeight + "px";
        
        this.points_svg.style.left = this.margin.left + "px";
        this.points_svg.style.top = this.margin.top + "px";
        this.points_svg.style.width = this.graphWidth + "px";
        this.points_svg.style.height = this.graphHeight + "px";
        this.points_svg.setAttribute("width", this.graphWidth);
        this.points_svg.setAttribute("height", this.graphHeight);

        this.axes.setAttribute("width", this.width);
        this.axes.setAttribute("height", this.height);
        this.axes.innerHTML = this.generateGraphAxes_();
    }

    generateGraphAxes_() {
        const xScale = (x) => this.margin.left + x * this.graphWidth;
        const yScale = (y) => this.margin.top + this.graphHeight - y * this.graphHeight;

        const xTicks = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
        const xTickMarks = xTicks.map(val => {
            const x = xScale(val);
            const y = this.height - this.margin.bottom;
            return `
                <line x1="${x}" y1="${y}" x2="${x}" y2="${y + 6}" stroke="#333" stroke-width="1.5"/>
                <text x="${x}" y="${y + 20}" text-anchor="middle" font-family="Arial" font-size="11" fill="#333">${val.toFixed(1)}</text>
            `;
        }).join('');

        const yTicks = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
        const yTickMarks = yTicks.map(val => {
            const y = yScale(val);
            const x = this.margin.left;
            return `
                <line x1="${x - 6}" y1="${y}" x2="${x}" y2="${y}" stroke="#333" stroke-width="1.5"/>
                <text x="${x - 10}" y="${y + 4}" text-anchor="end" font-family="Arial" font-size="11" fill="#333">${val.toFixed(1)}</text>
            `;
        }).join('');

        const gridLines = () => {
            const lines = [];
            yTicks.forEach(val => {
                if (val === 0 || val === 1.0) return;
                const y = yScale(val);
                lines.push(`<line x1="${this.margin.left}" y1="${y}" x2="${this.width - this.margin.right}" y2="${y}" stroke="#ddd" stroke-width="1"/>`);
            });
            xTicks.forEach(val => {
                if (val === 0 || val === 1.0) return;
                const x = xScale(val);
                lines.push(`<line x1="${x}" y1="${this.margin.top}" x2="${x}" y2="${this.height - this.margin.bottom}" stroke="#ddd" stroke-width="1"/>`);
            });
            return lines.join('');
        };
        
        return `
            ${gridLines()}

            <line x1="${this.margin.left}" y1="${this.margin.top}" x2="${this.width - this.margin.right}" y2="${this.margin.top}" stroke="#333" stroke-width="2"/>
            <line x1="${this.width - this.margin.right}" y1="${this.margin.top}" x2="${this.width - this.margin.right}" y2="${this.height - this.margin.bottom}" stroke="#333" stroke-width="2"/>

            <line x1="${this.margin.left}" y1="${this.height - this.margin.bottom}" x2="${this.width - this.margin.right}" y2="${this.height - this.margin.bottom}" stroke="#333" stroke-width="2"/>
            <text x="${this.width - this.margin.right - this.graphWidth / 2}" y="${this.height - this.margin.bottom / 3}" font-family="Arial" font-size="13" font-weight="bold" fill="#333" text-anchor="middle">X</text>

            <line x1="${this.margin.left}" y1="${this.height - this.margin.bottom}" x2="${this.margin.left}" y2="${this.margin.top}" stroke="#333" stroke-width="2"/>
            <text x="${this.margin.left / 3}" y="${this.margin.top + this.graphHeight / 2}" font-family="Arial" font-size="13" font-weight="bold" fill="#333"  text-anchor="middle">Y</text>

            ${xTickMarks}

            ${yTickMarks}
        `;
    }

    countPointsInRect(rect) {
        var counter = [0, 0]
        this.dataset.forEach((elem) => {
            if (rect.isPointIn(elem))
                counter[elem.class]++;
        });
        return counter;
    }

    getRectSVG_(rect) {
        var svgCode = ``;
        var counter = this.countPointsInRect(rect);
        if (counter[0] == 0 || counter[1] == 0) {
            var color = this.colors[+(counter[0] == 0)];
            if (counter[0] == 0 && counter[1] == 0)
                color = '#555';
            svgCode += `
            <rect rx="0" ry="0" width="100%" height="100%" opacity="${this.rectOpacity}" fill="${color}" />
            `;
        } else if (this.fillStyle == 0) {
            var width0 = this.stripeWidth * counter[0] / (counter[0] + counter[1]);
            var width1 = this.stripeWidth - width0;

            svgCode += `
            <defs>
                <pattern id="stripes-${rect.id}" 
                        width="${this.stripeWidth}" height="${this.stripeWidth}" 
                        patternUnits="userSpaceOnUse"
                        patternTransform="rotate(45)">
                
                <rect width="${width0}" height="${this.stripeWidth}" fill="${this.colors[0]}" />
                <rect x="${width0}" width="${width1}" height="${this.stripeWidth}" fill="${this.colors[1]}" />
                
                </pattern>
            </defs>
            <rect rx="0" ry="0" width="100%" height="100%" opacity="${this.rectOpacity}" fill="url(#stripes-${rect.id})" />
            `;
        } else if (this.fillStyle == 1) {
            var r1 = counter[0] / (counter[0] + counter[1]);
            var r2 = 1 - r1;
            var color = this.colorMixer.mix(this.colors[0], this.colors[1], r1, r2);
            svgCode += `
            <rect rx="0" ry="0" width="100%" height="100%" opacity="${this.rectOpacity}" fill="${color}" />
            `;
        } else {
            var r1 = counter[0] / (counter[0] + counter[1]);
            var r2 = 1 - r1;
            var color = this.colorMixer.mixViaWhite(this.colors[0], this.colors[1], r1, r2);
            svgCode += `
            <rect rx="0" ry="0" width="100%" height="100%" opacity="${this.rectOpacity}" fill="${color}" />
            `;
        }
        return svgCode;
    }

    addRect(rect) {
        var svgCode = `<svg id="rect-${rect.id}" width="${rect.w * this.graphWidth}" height="${rect.h * this.graphHeight}" style="left: ${this.getX_(rect.x)}; top: ${this.getY_(rect.y) - rect.h * this.graphHeight};" xmlns="http://www.w3.org/2000/svg">`;
        svgCode += this.getRectSVG_(rect);
        svgCode += `</svg>`;
        this.rects.push(rect);
        this.rects_container.innerHTML += svgCode;
    }

    setRects(rects) {
        this.rects = [];
        this.rects_container.innerHTML = "";
        rects.forEach((rect) => {
            this.addRect(rect);
        });
    }

    updateRects() {
        this.setRects(this.rects);
    }

    clearDataset() {
        this.points_svg.innerHTML = "";
        this.dataset = [];
    }

    setDataset(dataset) {
        this.clearDataset();
        this.dataset = dataset;
        this.renderDataset();
    }

    getX_(x) {
        return this.graphWidth * x;
    }

    getY_(y) {
        return this.graphHeight * (1 - y);
    }

    getDataElemCode_(elem) {
        var x = elem["x"], y = elem["y"];
        var color = elem["class"] == 0 ? 'var(--class-0)' : 'var(--class-1)';
        var svgCode = `<circle class="dataset_point" cx="${this.getX_(x)}" cy="${this.getY_(y)}" r="${this.pointRadius}" fill="${color}" stroke="#000" stroke-width="1">
            <title>(${x.toFixed(2)}, ${y.toFixed(2)})</title>
        </circle>`;
        return svgCode;
    }

    addDatasetElem_(elem) {
        this.points_svg.insertAdjacentHTML('beforeend', this.getDataElemCode_(elem));
    }

    renderDataset() {
        var svgCode = '';
        this.dataset.forEach((elem) => {
            svgCode += this.getDataElemCode_(elem);
        });
        this.points_svg.innerHTML = svgCode;
    }
    
    generateDataset(dataset_type) {
        if (dataset_type == "Линии") {
            this.setDataset(DatasetGenerator.generateLines(100));
        } else if (dataset_type == "Окружности") {
            this.setDataset(DatasetGenerator.generateCircles(100));
        } else if (dataset_type == "XOR") {
            this.setDataset(DatasetGenerator.generateXOR(100));
        } else {
            this.setDataset(DatasetGenerator.generateSpirals(100));
        }
    }

    deleteRects() {
        this.rects_container.innerHTML = "";
        this.rects = [];
    }

    deleteRect(rectId) {
        var i = -1;
        this.rects.forEach((rect, index) => {
            if (rect.id == rectId) {
                i = index;
            }
        });
        if (i != -1) {
            this.rects.splice(i, 1);
            document.getElementById(`rect-${rectId}`).remove();
        }
    }

    addLine(sep) {
        if (sep.isMovable) {
            this.movableId = sep.id;
        } else {
            this.lineId = sep.id;
        }
        if (sep.variable == 'X') {
            var h = (sep.x1 - sep.x2) * this.graphHeight;
            var className = "dataset_line";
            if (sep.isMovable) {
                className = "dataset_line_movable movable_X";
            }
            var left = this.getX_(sep.pos) - 2;
            var top = this.getY_(sep.x1);
            var svgCode = `<svg id="line-${sep.id}" class="${className}" width="${4}" height="${h}" style="left: ${left}px; top: ${top}px;" xmlns="http://www.w3.org/2000/svg">`;
            svgCode += `<path d="M2 0 V ${h}" stroke="" stroke-dasharray="5,5"/>`
            svgCode += `</svg>`;
            if (sep.isMovable)
                this.lines_container.innerHTML += svgCode;
            else
                this.glowing_container.innerHTML += svgCode;

            if (sep.isMovable) {
                var line_elem = document.getElementById(`line-${sep.id}`);
                line_elem.addEventListener('mousedown', (e) => {
                    e.preventDefault();

                    this.dragState = {
                        element: line_elem,
                        offsetX: e.clientX,
                        offsetY: e.clientY,
                        leftPos: parseInt(line_elem.style.left, 10),
                        topPos: parseInt(line_elem.style.top, 10),
                        moveDirection: 'X',
                        sepElem: sep,
                        treeNode: sep.treeNode
                    };
                });
            }
        } else {
            var w = (sep.x1 - sep.x2) * this.graphWidth;
            var className = "dataset_line";
            if (sep.isMovable) {
                className = "dataset_line_movable movable_Y";
            }
            var left = this.getX_(sep.x2);
            var top = this.getY_(sep.pos) - 2;
            var svgCode = `<svg id="line-${sep.id}" class="${className}" height="${4}" width="${w}" style="left: ${left}px; top: ${top}px;" xmlns="http://www.w3.org/2000/svg">`;
            svgCode += `<path d="M0 2 H ${w}" stroke="" stroke-dasharray="5,5"/>`
            svgCode += `</svg>`;
            if (sep.isMovable)
                this.lines_container.innerHTML += svgCode;
            else
                this.glowing_container.innerHTML += svgCode;

            if (sep.isMovable) {
                var line_elem = document.getElementById(`line-${sep.id}`);
                line_elem.addEventListener('mousedown', (e) => {
                    e.preventDefault();

                    this.dragState = {
                        element: line_elem,
                        offsetX: e.clientX,
                        offsetY: e.clientY,
                        leftPos: parseInt(line_elem.style.left, 10),
                        topPos: parseInt(line_elem.style.top, 10),
                        moveDirection: 'Y',
                        sepElem: sep,
                        treeNode: sep.treeNode
                    };
                });
            }
        }
    }

    resizeRect_(rect) {
        var rectContainer = document.getElementById(`rect-${rect.id}`);
        rectContainer.setAttribute("width", rect.w * this.graphWidth);
        rectContainer.setAttribute("height", rect.h * this.graphHeight);
        rectContainer.style.left = `${this.getX_(rect.x)}px`;
        rectContainer.style.top = `${this.getY_(rect.y) - rect.h * this.graphHeight}px`;
        rectContainer.innerHTML = this.getRectSVG_(rect);
    }

    resizeRects(node) {
        if (node.isLeaf) {
            node.updateStats();
            this.resizeRect_(node.rect);
        } else {
            this.resizeRects(node.left);
            this.resizeRects(node.right);
            document.dispatchEvent(new CustomEvent("nodeThresholdChanged", {
                detail: {nodeId: node.id},
                bubbles: true,
                cancelable: true,
            }));
        }
    }

    onDrag(e) {
        if (!this.dragState) return;
    
        const { element, offsetX, offsetY, leftPos, topPos, sepElem, treeNode } = this.dragState;
        
        const vecX = e.clientX - offsetX;
        const vecY = e.clientY - offsetY;

        if (sepElem.variable == 'X') {
            var newLeft = Math.min(Math.max(leftPos + vecX, sepElem.l * this.graphWidth), sepElem.r * this.graphWidth);
            element.style.left = `${newLeft}px`;
            treeNode.setThreshold(newLeft / this.graphWidth);
        } else {
            var newTop = Math.min(Math.max(topPos + vecY, this.getY_(sepElem.r)), this.getY_(sepElem.l));
            element.style.top = `${newTop}px`;
            treeNode.setThreshold(1 - newTop / this.graphWidth);
        }

        this.resizeRects(treeNode);
    }

    endDrag() {
        if (!this.dragState) return;
        
        this.dragState = null;
    }

    deleteMovableLine() {
        if (this.movableId != -1)
            document.getElementById(`line-${this.movableId}`).remove();
        this.movableId = -1;
    }

    updateFillStyle(val) {
        this.fillStyle = val;
    }

    onClick(event) {
        if (this.isDrawable) {
            const rect = this.points_svg.getBoundingClientRect();
            const x = (event.clientX - rect.left) / this.graphWidth;
            const y = 1 - (event.clientY - rect.top) / this.graphHeight;
            var elem = new DataElem(x, y, this.drawClass);
            this.dataset.push(elem);
            this.addDatasetElem_(elem);
            this.updateRects();
            tree.updateNodeStats();
            tree.updateNodeSettings();
            tree.generateSVG();
        }
    }

    _countImpurity(rect) {
        var counter = this.countPointsInRect(rect);
        if (counter[0] + counter[1] == 0) {
            return 0;
        }
        var p1 = counter[0] / (counter[0] + counter[1]);
        var p2 = counter[1] / (counter[0] + counter[1]);
        var gini = 1 - p1**2 - p2**2;
        return (counter[0] + counter[1]) * gini;
    }

    findBestSplit(rect) {
        var points = [];
        this.dataset.forEach((elem) => {
            if (rect.isPointIn(elem))
                points.push(elem);
        });
        if (points.length < 2) {
            return ('X', -1);
        }
        var sorted = [[], []];
        sorted[0] = points.toSorted((a, b) => a.x - b.x)
        sorted[1] = points.toSorted((a, b) => a.y - b.y)
        var best_var = 'X', best_threshold = rect.x, minimal_impurity = 1e9;
        for (var i = 0; i < 2; i++) {
            for (var j = 0; j < sorted[i].length - 1; j++) {
                var threshold = (sorted[i][j].x + sorted[i][j + 1].x) / 2;
                var variable = i ? 'Y' : 'X';
                if (i) {
                    threshold = (sorted[i][j].y + sorted[i][j + 1].y) / 2;
                }
                var rects = rect.split(variable, threshold);
                var rectL = rects[0], rectR = rects[1];
                var impurity = this._countImpurity(rectL) + this._countImpurity(rectR);
                if (impurity < minimal_impurity) {
                    minimal_impurity = impurity;
                    best_var = variable;
                    best_threshold = threshold;
                }
            }
        }
        return [best_var, best_threshold];
    }

    deleteGlowing() {
        this.glowing_container.innerHTML = "";
    }

    addGlowing(rect) {
        var svgCode = `<svg width="${rect.w * this.graphWidth}" height="${rect.h * this.graphHeight}" style="left: ${this.getX_(rect.x)}; top: ${this.getY_(rect.y) - rect.h * this.graphHeight};" xmlns="http://www.w3.org/2000/svg">`;
        svgCode += `<rect x="0" y="0" width="${rect.w * this.graphWidth}" height="${rect.h * this.graphHeight}" fill="none" stroke-width="10" stroke="black" opacity="0.6" stroke-dasharray="5,5">`;
        svgCode += `</svg>`;
        this.glowing_container.innerHTML = svgCode;
    }
};

var viewer = new DatasetViewer();
viewer.generateDataset("Линии");