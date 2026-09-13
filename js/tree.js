class BinaryTree extends EventTarget {
    constructor() {
        super();
        this.selectedNodeId = -1;
        this.tree_svg = document.getElementById('tree_svg');
        this.width = 0;
        this.height = 0;
        this.leafsCounter = 1;
        this.isNodesPainted = true;
        this.colorMixer = new ColorMixer();

        this.treeStyle = 0;

        this.config = {
            width: 70,
            height: 30,
            nodesPadding: 10,
            borderRadius: 4,
            verticalSpacing: 40
        };
        this.root = new TreeNode('Leaf 1', true);

        this.generateSVG();

        viewer.addRect(this.root.rect);
    }

    clearTree() {
        this.root = new TreeNode('Leaf 1', true);
        this.selectedNodeId = -1;   
        this.generateSVG();
        viewer.deleteMovableLine();
        viewer.deleteRects();
        viewer.addRect(this.root.rect);
        this.updateNodeStats();
        this.updateNodeSettings();
    }

    generateSVG() {
        const [nodes, W, H] = this._getNodesWithCoords(this.root);
        this.width = W;
        this.height = H;

        this.tree_svg.setAttribute("width", this.width);
        this.tree_svg.setAttribute("height", this.height);
        
        var svg = ``;

        svg += this._generateEdgesSVG(nodes);
        
        svg += this._generateNodesSVG(nodes);

        this.tree_svg.innerHTML = svg;
        
        nodes.forEach(node => {
            var nodeRect = document.getElementById(`node-${node.id}`);
            var node_ = this.getNode(node.id);
            nodeRect.addEventListener('mouseenter', () => {
                if (!node_.isLeaf && this.selectedNodeId != node_.id) {
                    if (node_.variable == 'X') {
                        viewer.addLine(new Separator(node_.variable, node_.threshold, 0, 0, node_.getX1(), node_.getX2(), node_, false));
                    } else {
                        viewer.addLine(new Separator(node_.variable, node_.threshold, 0, 0, node_.getX1(), node_.getX2(), node_, false));
                    }
                }
            });
            nodeRect.addEventListener('mouseleave', () => {
                viewer.deleteLine();
                this.updateNodeSettings();
            });
        });

        this.dispatchEvent(new CustomEvent("svgGenerated"));
    }

    setTreeStyle(val) {
        this.treeStyle = val;
        if (this.treeStyle == 1) {
            this.config.width = 30;
            this.config.borderRadius = 15;
        } else {
            this.config.width = 70;
            this.config.borderRadius = 3;
        }
        this.generateSVG();
    }

    _getNodesWithCoords(node) {
        if (node === null) return [[], 0, 0];
        
        const halfWidth = this.config.width / 2;
        var result = [{
            ...node,
            x: 0,
            y: 0,
            halfWidth: halfWidth,
            id: node.id
        }];
        var W = 2 * this.config.nodesPadding + this.config.width;
        var H = this.config.height + 2 * this.config.nodesPadding;

        if (node.left == null) {
            result[0].x += halfWidth + this.config.nodesPadding;
            result[0].y += this.config.height / 2 + this.config.nodesPadding;
            return [result, W, H];
        }

        var [leftNodes, lW, lH] = this._getNodesWithCoords(node.left);
        var [rightNodes, rW, rH] = this._getNodesWithCoords(node.right);

        result[0].x += lW;
        result[0].y += this.config.height / 2 + this.config.nodesPadding;
        leftNodes.forEach(elem => {
            elem.y += this.config.verticalSpacing;
            result.push(elem);
            W = Math.max(W, elem.x + this.config.width / 2 + this.config.nodesPadding);
            H = Math.max(H, elem.y + this.config.height / 2 + this.config.nodesPadding);
        });
        rightNodes.forEach(elem => {
            elem.y += this.config.verticalSpacing;
            elem.x += lW;
            result.push(elem);
            W = Math.max(W, elem.x + this.config.width / 2 + this.config.nodesPadding);
            H = Math.max(H, elem.y + this.config.height / 2 + this.config.nodesPadding);
        });
        
        return [result, W, H];
    }

    _generateEdgesSVG(nodes) {
        const nodeMap = {};
        nodes.forEach(node => {
            nodeMap[node.id] = node;
        });

        var edges = '';
        nodes.forEach(node => {
            const childNodes = [];
            if (node.left && nodeMap[node.left.id]) childNodes.push(nodeMap[node.left.id]);
            if (node.right && nodeMap[node.right.id]) childNodes.push(nodeMap[node.right.id]);
            
            childNodes.forEach(child => {
                const startX = node.x;
                const startY = node.y + this.config.height/2;
                const endX = child.x;
                const endY = child.y - this.config.height/2;
                
                const midY = (startY + endY) / 2;
                edges += `
                    <path d="M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}"
                          fill="none" stroke="#b0b0b0" stroke-width="2"
                          class="edge-line"
                          data-from="${node.id}" data-to="${child.id}"/>
                `;
            });
        });
        return edges;
    }

    _generateNodesSVG(nodes) {
        var svg = '';

        nodes.forEach((node, index) => {
            const isSelected = this.selectedNodeId == node.id;
            
            const textX = node.x;
            const textY = node.y + 5;

            var text = this.treeStyle == 0 ? node.text : node.number;
            if (this.treeStyle == 0) {
                if (node.isLeaf) {
                    text = node.text;
                } else {
                    text = `${node.variable} ≥ ${node.threshold.toFixed(2)}`;
                }
            }

            var color = 'none';
            if (this.isNodesPainted) {
                if (node.counter[0] + node.counter[1] == 0) {
                    color = '#ffffff';
                } else {
                    var r1 = node.counter[0] / (node.counter[0] + node.counter[1]);   
                    var r2 = 1 - r1;
                    const root = document.documentElement;
                    var c1 = getComputedStyle(root).getPropertyValue('--class-0');
                    var c2 = getComputedStyle(root).getPropertyValue('--class-1');
                    color = this.colorMixer.mixViaWhite(c1, c2, r1, r2);
                }
            }
            
            svg += `
                <g class="node-group">
                    <rect x="${node.x - node.halfWidth}" y="${node.y - this.config.height/2}"
                          width="${this.config.width}" height="${this.config.height}"
                          rx="${this.config.borderRadius}" ry="${this.config.borderRadius}"
                          class="rect-node ${!this.isNodesPainted ? 'rect-node-unpainted' : ''} ${isSelected ? 'selected' : ''}"
                          id="node-${node.id}"
                          onclick="handleNodeClick('${node.id}')" fill="${color}">
                    </rect>
                    <text x="${textX}" y="${textY}" 
                          text-anchor="middle"
                          class="node-text" id="node-${node.id}-text">
                        ${text}
                    </text>
                </g>
            `;
        });
        
        return svg;
    }

    getNode(nodeId) {
        return this._getNode(this.root, nodeId);
    }

    _getNode(node, nodeId) {
        if (node == null) return null
        if (node.id == nodeId) return node;
        return this._getNode(node.left, nodeId) || this._getNode(node.right, nodeId);
    }

    getNodeParent(nodeId) {
        return this._getNodeParent(this.root, nodeId);
    }

    _getNodeParent(node, nodeId) {
        if (node.isLeaf) {
            return -1;
        }
        if (node.left.id == nodeId || node.right.id == nodeId) {
            return node.id;
        }
        return Math.max(this._getNodeParent(node.left, nodeId), this._getNodeParent(node.right, nodeId));
    }

    toggleSelected(nodeId) {
        var curNode = document.getElementById(`node-${nodeId}`);
        if (this.selectedNodeId != -1) {
            var selectedNode = document.getElementById(`node-${this.selectedNodeId}`);
            selectedNode.setAttribute('class', 'rect-node');
            if (this.selectedNodeId == nodeId) {
                this.selectedNodeId = -1;
                return;
            }
        }
        this.selectedNodeId = nodeId;
        curNode.setAttribute('class', 'rect-node selected');
    }

    updateNodeSettings() {
        controller.setNodesCounter(this.root.countSize());
        controller.setTreeAccuracy(this.root.getAccuracy());
        controller.setTreeDepth(this.root.countDepth());
        controller.setNodeId(this.selectedNodeId);
        viewer.deleteMovableLine();
        if (this.selectedNodeId == -1) {
            controller.hideSettings();
        } else {
            var selectedNode = this.getNode(this.selectedNodeId);
            controller.showSettings();
            controller.setNodeAccuracy(selectedNode.getAccuracy());
            controller.setNodeClass(selectedNode.class);
            controller.setNodeClassDistribution(selectedNode.counter);
            controller.setIsNodeLeaf(selectedNode.isLeaf);
            controller.setNodeThreshold(selectedNode.threshold);
            controller.setNodeVariable(selectedNode.variable);
            controller.setNodeGini(selectedNode.gini);

            if (!selectedNode.isLeaf) {
                if (selectedNode.variable == 'X') {
                    viewer.addLine(new Separator(selectedNode.variable, selectedNode.threshold, selectedNode.getL() + 0.03, selectedNode.getR() - 0.03, selectedNode.getX1(), selectedNode.getX2(), selectedNode, true));
                } else {
                    viewer.addLine(new Separator(selectedNode.variable, selectedNode.threshold, selectedNode.getL() + 0.03, selectedNode.getR() - 0.03, selectedNode.getX1(), selectedNode.getX2(), selectedNode, true));
                }
            }
        }
    }

    deleteRects_(node) {
        if (node.isLeaf) {
            viewer.deleteRect(node.rect.id);
        } else {
            if (node.left) this.deleteRects_(node.left)
            if (node.right) this.deleteRects_(node.right)
        }
    }

    makeNodeLeaf(nodeId) {
        var node = this.getNode(nodeId);
        if (node.left) this.deleteRects_(node.left);
        if (node.right) this.deleteRects_(node.right);
        node.rect = new Rect(node.rect.x, node.rect.y, node.rect.w, node.rect.h);
        node.left = null;
        node.right = null;
        node.isLeaf = true;
        viewer.addRect(node.rect);

        this.root.enumerateLeafs();
        this.root.enumerateNodes();
        this.selectedNodeId = nodeId;
        this.generateSVG();
        this.updateNodeSettings();
    }

    addChildrenToNode(nodeId, variable='X', threshold=null) {
        var node = this.getNode(nodeId);
        viewer.deleteRect(node.rect.id);
        node.variable = variable;
        if (variable == 'X') {
            var rectL = new Rect(node.rect.x, node.rect.y, node.rect.w / 2, node.rect.h);
            var rectR = new Rect(node.rect.x + node.rect.w / 2, node.rect.y, node.rect.w / 2, node.rect.h);
            node.threshold = (2 * node.rect.x + node.rect.w) / 2;
            if (threshold != null) {
                [rectL, rectR] = node.rect.split(variable, threshold);
                node.threshold = threshold;
            }
            node.text = node.getText();
            node.left = new TreeNode(`Leaf ${this.leafsCounter++}`, false, rectL);
            node.right = new TreeNode(`Leaf ${this.leafsCounter}`, false, rectR);
            node.isLeaf = false;
            node.quotient = node.left.rect.w / node.right.rect.w;
        } else {
            var rectL = new Rect(node.rect.x, node.rect.y, node.rect.w, node.rect.h / 2);
            var rectR = new Rect(node.rect.x, node.rect.y + node.rect.h / 2, node.rect.w, node.rect.h / 2);
            node.threshold = (2 * node.rect.y + node.rect.h) / 2;
            if (threshold != null) {
                [rectL, rectR] = node.rect.split(variable, threshold);
                node.threshold = threshold;
            }
            node.text = node.getText();
            node.left = new TreeNode(`Leaf ${this.leafsCounter++}`, false, rectL);
            node.right = new TreeNode(`Leaf ${this.leafsCounter}`, false, rectR);
            node.isLeaf = false;
            node.quotient = node.left.rect.h / node.right.rect.h;
        }
        viewer.addRect(node.left.rect);
        viewer.addRect(node.right.rect);

        this.root.enumerateLeafs();
        this.root.enumerateNodes();
        this.selectedNodeId = nodeId;
        this.generateSVG();
        this.updateNodeSettings();
    }

    updateThreshold() {
        this.updateNodeSettings();
        this.generateSVG();
    }

    setNodeVariable(nodeId, variable) {
        var node = this.getNode(nodeId);
        this.makeNodeLeaf(nodeId);
        this.addChildrenToNode(nodeId, variable);
    }

    updateNodeStats_(node) {
        node.updateStats();
        if (node.left) {
            this.updateNodeStats_(node.left);
        }
        if (node.right) {
            this.updateNodeStats_(node.right);
        }
    }

    updateNodeStats() {
        this.updateNodeStats_(this.root);
    }
}

function handleNodeClick(nodeId) {
    tree.toggleSelected(nodeId);
    tree.updateNodeSettings();
}

var tree = new BinaryTree();
tree.updateNodeSettings();

document.addEventListener("nodeLeafPropertyUpdated", (ev) => {
    var nodeId = ev.detail.nodeId, isLeaf = ev.detail.isLeaf;
    if (isLeaf) {
        tree.makeNodeLeaf(nodeId);
    } else {
        tree.addChildrenToNode(nodeId);
    }
});

document.addEventListener("nodeThresholdChanged", (ev) => {
    tree.updateThreshold();
});

document.addEventListener("nodeVariableChanged", (ev) => {
    tree.setNodeVariable(ev.detail.nodeId, ev.detail.variable);
});

const colorPairs = [
    { id: 3, primary: '#2ca02c', secondary: '#d62728' },
    { id: 0, primary: '#1f77b4', secondary: '#d62728' },
    { id: 1, primary: '#2ca02c', secondary: '#ff7f0e' },
    { id: 2, primary: '#1f77b4', secondary: '#ff7f0e' }
];

const colorSelect = new ColorSelect("colorSelect", colorPairs);

colorSelect.addEventListener("colorsChanged", (e) => {
    const root = document.documentElement;
    root.style.setProperty('--class-0', e.detail.colors.primary);
    root.style.setProperty('--class-1', e.detail.colors.secondary);
    viewer.colors = [e.detail.colors.primary, e.detail.colors.secondary];
    viewer.updateRects();
    tree.generateSVG();
});

const iconSelect = new IconSelect("iconSelect");

iconSelect.addEventListener("valueChanged", (e) => {
    if (e.detail.value == "Полосы") {
        viewer.updateFillStyle(0);
    } else if (e.detail.value == "Градиент1") {
        viewer.updateFillStyle(1);
    } else {
        viewer.updateFillStyle(2);
    }
    viewer.updateRects();
});

function updateScroll() {
    const wrapper = document.querySelector('.tree_wrapper');
    const tree_svg = wrapper.querySelector('svg');

    const svgW = tree_svg.getAttribute("width");
    const svgH = tree_svg.getAttribute("height");
    const wrapRect = wrapper.getBoundingClientRect();

    if (svgW >= wrapRect.width || svgH >= wrapRect.height) {
        wrapper.style.display = "block";
    } else {
        wrapper.style.display = "flex";
    }
}

addEventListener("resize", updateScroll);

tree.addEventListener("svgGenerated", updateScroll);