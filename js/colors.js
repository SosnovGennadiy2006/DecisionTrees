class ColorMixer {
    constructor(gamma = 2.2) {
        this.gamma = gamma;
    }

    /**
     * Простое реалистичное смешивание двух цветов в линейном пространстве.
     */
    mix(colorA, colorB, weightA, weightB) {
        return this._blend(colorA, colorB, weightA, weightB);
    }

    /**
     * Смешивание через белый.
     * При weightA = weightB результат — белый.
     * При weightA > 0, weightB = 0 — результат стремится к A.
     * При weightB > 0, weightA = 0 — результат стремится к B.
     *
     * Логика: чем ближе веса друг к другу, тем больше вклад белого.
     * Вклад белого пропорционален min(weightA, weightB).
     */
    mixViaWhite(colorA, colorB, weightA, weightB) {
        const white = '#FFFFFF';

        // Вклад белого = минимум из весов (насколько "сбалансированы" цвета).
        // Вклад A и B = разница весов (насколько один преобладает).
        const wWhite = Math.min(weightA, weightB) * 2;
        const wA = weightA - Math.min(weightA, weightB);
        const wB = weightB - Math.min(weightA, weightB);

        // Итог: смесь A, B и белого с этими весами
        // Смешиваем A с белым по весу, затем с B
        if (wA + wB + wWhite === 0) return '#FFFFFF';

        // Смешиваем A и B с их остаточными весами
        const abColor = (wA + wB > 0)
            ? this._blend(colorA, colorB, wA, wB)
            : white;

        // Затем смешиваем результат с белым
        return this._blend(abColor, white, wA + wB, wWhite);
    }

    // ---------- внутренние методы ----------

    _blend(colorA, colorB, weightA, weightB) {
        if (weightA + weightB === 0) {
            return '#FFFFFF';
        }

        const rgbA = this._parse(colorA);
        const rgbB = this._parse(colorB);

        const linA = this._toLinear(rgbA);
        const linB = this._toLinear(rgbB);

        const total = weightA + weightB;
        const ratioA = weightA / total;
        const ratioB = weightB / total;

        const linR = linA.r * ratioA + linB.r * ratioB;
        const linG = linA.g * ratioA + linB.g * ratioB;
        const linB_ = linA.b * ratioA + linB.b * ratioB;

        return this._toHex(this._toSrgb({ r: linR, g: linG, b: linB_ }));
    }

    _parse(color) {
        if (typeof color === 'object' && color.r !== undefined) {
            return { r: color.r, g: color.g, b: color.b };
        }
        if (typeof color === 'string') {
            if (color.startsWith('#')) {
                let hex = color.slice(1);
                if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
                return {
                    r: parseInt(hex.slice(0, 2), 16),
                    g: parseInt(hex.slice(2, 4), 16),
                    b: parseInt(hex.slice(4, 6), 16)
                };
            }
            const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (match) {
                return { r: +match[1], g: +match[2], b: +match[3] };
            }
        }
        throw new Error('Неподдерживаемый формат цвета: ' + color);
    }

    _toLinear({ r, g, b }) {
        const f = (v) => {
            v /= 255;
            return v <= 0.04045
                ? v / 12.92
                : Math.pow((v + 0.055) / 1.055, this.gamma);
        };
        return { r: f(r), g: f(g), b: f(b) };
    }

    _toSrgb({ r, g, b }) {
        const f = (v) => {
            const c = v <= 0.0031308
                ? 12.92 * v
                : 1.055 * Math.pow(v, 1 / this.gamma) - 0.055;
            return Math.round(Math.max(0, Math.min(1, c)) * 255);
        };
        return { r: f(r), g: f(g), b: f(b) };
    }

    _toHex({ r, g, b }) {
        return '#' + [r, g, b]
            .map(x => x.toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase();
    }
}