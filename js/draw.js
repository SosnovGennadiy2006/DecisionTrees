var button0 = document.getElementById("button_class0");
var button1 = document.getElementById("button_class1");
var clearButton = document.getElementById("clearButton");
var paintPanel = document.getElementById("paintPanel");
const gridSelect = new GridSelect("gridSelect");

gridSelect.addEventListener("valueChanged", (e) => {
    viewer.isDrawable = false;
    viewer.generateDataset(e.detail.value);
    tree.clearTree();
    viewer.updateRects();
    if (button0.classList.contains('active')) {
        button0.classList.remove('active');
    }
    if (button1.classList.contains('active')) {
        button1.classList.remove('active');
    }
    viewer.isDrawable = false;
    paintPanel.style.display = 'none';
});

gridSelect.addEventListener("buttonClicked", () => {
    paintPanel.style.display = 'flex';
    viewer.clearDataset();
    tree.clearTree();
    viewer.updateRects();
});

button0.addEventListener('click', () => {
    if (button1.classList.contains('active')) {
        button1.classList.remove('active');
    }
    if (button0.classList.contains('active')) {
        button0.classList.remove('active');
    } else {
        button0.classList.add('active');
        viewer.isDrawable = true;
        viewer.drawClass = 0;
    }
});

button1.addEventListener('click', () => {
    if (button0.classList.contains('active')) {
        button0.classList.remove('active');
    }
    if (button1.classList.contains('active')) {
        button1.classList.remove('active');
    } else {
        button1.classList.add('active');
        viewer.isDrawable = true;
        viewer.drawClass = 1;
    }
});

clearButton.addEventListener('click', () => {
    viewer.clearDataset();
    viewer.updateRects();
    tree.updateNodeStats();
    tree.updateNodeSettings();
    tree.generateSVG();
});

var checkbox1 = document.getElementById('color_nodes');
var checkbox2 = document.getElementById('node_info');

checkbox1.addEventListener('change', () => {
    if (checkbox1.checked) {
        tree.isNodesPainted = true;
    } else {
        tree.isNodesPainted = false;
    }
    tree.updateNodeStats();
    tree.updateNodeSettings();
    tree.generateSVG();
});

checkbox2.addEventListener('change', () => {
    if (checkbox2.checked) {
        tree.setTreeStyle(0);
    } else {
        tree.setTreeStyle(1);
    }
    tree.updateNodeStats();
    tree.updateNodeSettings();
    tree.generateSVG();
});

document.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        t.isContentEditable) {
        return;
    }
    
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (tree.selectedNodeId == -1) return;

    if (e.key === 'Enter') {
        e.preventDefault();

        var node = tree.getNode(tree.selectedNodeId);
        if (node.isLeaf) {
            controller.setIsNodeLeaf(false);
            tree.addChildrenToNode(node.id);
            tree.updateNodeSettings();
        }
    } else if (e.key == 'ArrowUp') {
        e.preventDefault();

        var nodeId = tree.getNodeParent(tree.selectedNodeId);
        if (nodeId != -1) {
            tree.toggleSelected(nodeId);
            tree.updateNodeSettings();
        }
    } else if (e.key == 'ArrowLeft') {
        e.preventDefault();

        var node = tree.getNode(tree.selectedNodeId);
        if (!node.isLeaf) {
            tree.toggleSelected(node.left.id);
            tree.updateNodeSettings();
        }
    } else if (e.key == 'ArrowRight') {
        e.preventDefault();

        var node = tree.getNode(tree.selectedNodeId);
        if (!node.isLeaf) {
            tree.toggleSelected(node.right.id);
            tree.updateNodeSettings();
        }
    } else if (e.key == 'l' || e.key == 'L' || e.key == 'д' || e.key == 'Д') {
        e.preventDefault();

        if (tree.selectedNodeId != -1) {
            var node = tree.getNode(tree.selectedNodeId);
            var splitInfo = viewer.findBestSplit(node.rect);
            var variable = splitInfo[0], threshold = splitInfo[1];
            if (threshold == -1) {
                return;
            }
            if (!node.isLeaf) {
                tree.makeNodeLeaf(node.id);
            }
            tree.addChildrenToNode(node.id, variable, threshold);
            tree.updateNodeSettings();
        }
    }
});

var learn_button = document.getElementById('learn_button');

learn_button.addEventListener('click', () => {
    if (tree.selectedNodeId == -1) {
        return;
    }
    var node = tree.getNode(tree.selectedNodeId);
    var splitInfo = viewer.findBestSplit(node.rect);
    var variable = splitInfo[0], threshold = splitInfo[1];
    if (threshold == -1) {
        return;
    }
    if (!node.isLeaf) {
        tree.makeNodeLeaf(node.id);
    }
    tree.addChildrenToNode(node.id, variable, threshold);
    tree.updateNodeSettings();
});