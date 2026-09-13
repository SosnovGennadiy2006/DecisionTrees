class Settings {
    constructor() {
        this.node_settings_card = document.getElementById('node_settings_card');
        this.settings_wrapper = document.getElementById('settings_wrapper');
        this.settings_placeholder = document.getElementById('settings_placeholder');
        this.nodes_counter_span = document.getElementById('node_counter');
        this.tree_depth_span = document.getElementById('tree_depth');
        this.tree_accuracy_span = document.getElementById('tree_accuracy');
        this.node_accuracy = document.getElementById('node_accuracy');
        this.node_class = document.getElementById('node_class');
        this.node_class_distribution = document.getElementById('node_class_distribution');
        this.non_leaf_container = document.getElementById('non-leaf-items');
        this.node_variable = document.getElementById('node_variable');
        this.node_threshold = document.getElementById('node_threshold');
        this.list_item_node_class = document.getElementById('list-item-node-class');
        this.is_node_leaf = document.getElementById('is_node_leaf');
        this.node_gini = document.getElementById('node_gini');
        this.node_id = -1;

        is_node_leaf.addEventListener('change', (ev) => {
            this.setIsNodeLeaf_(ev.currentTarget.checked);
            document.dispatchEvent(new CustomEvent("nodeLeafPropertyUpdated", {
                detail: {isLeaf: ev.currentTarget.checked, nodeId: this.node_id},
                bubbles: true,
                cancelable: true,
            }));
        });

        node_variable.addEventListener('change', (ev) => {
            document.dispatchEvent(new CustomEvent("nodeVariableChanged", {
                detail: {variable: ev.currentTarget.value, nodeId: this.node_id},
                bubbles: true,
                cancelable: true,
            }));
        });
    }

    setNodeId(node_id) {
        this.node_id = node_id;
    }

    setNodesCounter(cnt) {
        this.nodes_counter_span.innerHTML = cnt;
    }

    setTreeDepth(cnt) {
        this.tree_depth_span.innerHTML = cnt;
    }

    setTreeAccuracy(accuracy) {
        if (accuracy == -1) accuracy = 1;
        this.tree_accuracy_span.innerHTML = `${(accuracy * 100).toFixed(2)}%`;
    }

    setNodeAccuracy(accuracy) {
        if (accuracy == -1) accuracy = 1;
        this.node_accuracy.innerHTML = `${(accuracy * 100).toFixed(2)}%`;
    }

    setNodeClass(node_class) {
        this.node_class.innerHTML = node_class;
    }

    setNodeVariable(node_variable) {
        this.node_variable.value = node_variable;
    }

    setNodeThreshold(node_threshold) {
        this.node_threshold.innerHTML = node_threshold.toFixed(2);
    }

    setNodeClassDistribution(counter) {
        this.node_class_distribution.innerHTML = `${counter[0]}/${counter[1]}`;
    }

    hideSettings() {
        this.node_settings_card.setAttribute('class', 'card-body card-centered');
        this.settings_placeholder.style.display = 'block';
        this.settings_wrapper.style.display = 'none';
    }

    showSettings() {
        this.node_settings_card.setAttribute('class', 'card-body');
        this.settings_placeholder.style.display = 'none';
        this.settings_wrapper.style.display = 'block';
    }

    setIsNodeLeaf(val) {
        this.is_node_leaf.checked = val;
        this.setIsNodeLeaf_(val);
    }

    setIsNodeLeaf_(val) {
        if (!val) {
            this.list_item_node_class.style.display = 'none';
            this.non_leaf_container.style.display = 'block';
        } else {
            this.list_item_node_class.style.display = 'flex';
            this.non_leaf_container.style.display = 'none';
        }
    }

    setNodeGini(val) {
        this.node_gini.innerHTML = val.toFixed(2);
    }
}

var controller = new Settings();