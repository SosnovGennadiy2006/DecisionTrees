class Separator {
    static counter = 0;

    constructor(variable, pos, l, r, x1, x2, treeNode, movable) {
        this.variable = variable;
        this.x1 = x1;
        this.x2 = x2; // x1 >= x2
        this.l = l;
        this.r = r;
        this.pos = pos;
        this.treeNode = treeNode;
        this.isMovable = movable;
        this.id = Separator.counter++;
    }
}