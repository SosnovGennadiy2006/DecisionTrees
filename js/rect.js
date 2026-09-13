class Rect {
    static counter = 0;

    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.id = Rect.counter++;
    }

    isPointIn(dataElem) {
        return (this.x < dataElem.x) && (dataElem.x <= this.x + this.w) && (this.y < dataElem.y) && (dataElem.y <= this.y + this.h);
    }

    split(variable, threshold) {
        if (variable == 'X') {
            return [new Rect(this.x, this.y, threshold - this.x, this.h),
                    new Rect(threshold, this.y, this.x + this.w - threshold, this.h)];
        }
        return [new Rect(this.x, this.y, this.w, threshold - this.y),
                new Rect(this.x, threshold, this.w, this.y + this.h - threshold)];
    }
}