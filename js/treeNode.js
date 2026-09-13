class TreeNode {
    static counter = 0;

    constructor(text, isRoot = false, rect = new Rect(0, 0, 1, 1)) {
        this.text = text;
        this.id = TreeNode.counter++;
        this.left = null;
        this.right = null;
        this.isRoot = isRoot;
        this.isLeaf = true;
        this.class = 0;
        this.counter = [0, 0];
        this.countGuessed = 0;
        this.threshold = 0;
        this.variable = 'X';
        this.quotient = 0;
        this.gini = 0;
        this.number = 1;

        this.setRect(rect);
    }

    getText() {
        return `${this.variable} ≥ ${this.threshold.toFixed(2)}`;
    }

    countDepth() {
        if (this.isLeaf) {
            return 0;
        }
        return Math.max(this.left.countDepth(), this.right.countDepth()) + 1;
    }

    countSize() {
        if (this.isLeaf) {
            return 1;
        }
        return 1 + this.left.countSize() + this.right.countSize();
    }

    setRect(rect) {
        this.rect = rect;
        this.updateStats();
    }

    updateStats() {
        this.counter = viewer.countPointsInRect(this.rect);
        this.class = (this.counter[0] >= this.counter[1] ? 0 : 1);
        this.countGuessed = this.counter[this.class];
        var n = this.counter[0] + this.counter[1];
        this.gini = n == 0 ? 0 : 1 - (this.counter[0] / n)**2 - (this.counter[1] / n)**2;
    }

    getGuessed() {
        if (this.isLeaf) {
            return this.countGuessed;
        }
        var cnt = 0;
        if (this.left) cnt += this.left.getGuessed();
        if (this.right) cnt += this.right.getGuessed();
        return cnt;
    }

    getAccuracy() {
        if (this.counter[0] + this.counter[1] == 0) {
            return -1;
        }
        return this.getGuessed() / (this.counter[0] + this.counter[1]);
    }

    enumerateLeafs(leafsCnt = 0) {
        if (this.isLeaf) {
            this.text = `Leaf ${++leafsCnt}`;
            return leafsCnt;
        }
        leafsCnt = this.left.enumerateLeafs(leafsCnt);
        leafsCnt = this.right.enumerateLeafs(leafsCnt);
        return leafsCnt;
    }

    enumerateNodes(nodesCnt = 0) {
        this.number = ++nodesCnt;
        if (this.left)
            nodesCnt = this.left.enumerateNodes(nodesCnt);
        if (this.right)
            nodesCnt = this.right.enumerateNodes(nodesCnt);
        return nodesCnt;
    }

    getRects() {
        if (this.isLeaf) {
            return [this.rect];
        }
        return this.getRects(this.left).getRects(this.right);
    }

    getL() {
        if (this.variable == 'X') {
            return this.rect.x;
        }
        return this.rect.y;
    }

    getR() {
        if (this.variable == 'X') {
            return this.rect.x + this.rect.w;
        }
        return this.rect.y + this.rect.h;
    }

    getX1() {
        if (this.variable == 'X') {
            return this.rect.y + this.rect.h;
        }
        return this.rect.x + this.rect.w;
    }

    getX2() {
        if (this.variable == 'X') {
            return this.rect.y;
        }
        return this.rect.x;
    }

    moveHorizontal(d) {
        this.rect.x += d;
        if (this.isLeaf) {
            return
        }
        this.left.moveHorizontal(d);
        this.right.moveHorizontal(d);
    }
    
    moveVertical(d) {
        this.rect.y += d;
        if (this.isLeaf) {
            return
        }
        this.left.moveVertical(d);
        this.right.moveVertical(d);
    }

    updateWidth(w) {
        this.rect.w = w;
        if (this.isLeaf) {
            return;
        }
        if (this.variable == 'Y') {
            this.left.updateWidth(w);
            this.right.updateWidth(w);
        } else {
            var q = this.quotient;
            var rw = w / (1 + q);
            var lw = w - rw;
            var d = lw - this.left.rect.w;
            this.threshold = this.left.rect.x + lw;
            this.left.updateWidth(lw);
            this.right.updateWidth(rw);
            this.right.moveHorizontal(d);
        }
    }

    updateHeight(h) {
        this.rect.h = h;
        if (this.isLeaf) {
            return;
        }
        if (this.variable == 'Y') {
            var q = this.quotient;
            var rh = h / (1 + q);
            var lh = h - rh;
            var d = lh - this.left.rect.h;
            this.threshold = this.left.rect.y + lh;
            this.left.updateHeight(lh);
            this.right.updateHeight(rh);
            this.right.moveVertical(d);
        } else {
            this.left.updateHeight(h);
            this.right.updateHeight(h);
        }
    }

    setThreshold(t) {
        this.threshold = t;
        if (this.variable == 'X') {
            this.quotient = (t - this.rect.x) / (this.rect.x + this.rect.w - t);
            var d = t - this.rect.x - this.left.rect.w;
            this.left.updateWidth(t - this.rect.x);
            this.right.updateWidth(this.rect.x + this.rect.w - t);
            this.right.moveHorizontal(d);
        } else {
            this.quotient = (t - this.rect.y) / (this.rect.x + this.rect.w - t);
            var d = t - this.rect.y - this.left.rect.h;
            this.left.updateHeight(t - this.rect.y);
            this.right.updateHeight(this.rect.y + this.rect.h - t);
            this.right.moveVertical(d);
        }
    }
}