class Board {
    constructor(config) {
        this._config = config || {
            
             // all hexes on this board
             // each Hex is expected a valid .coord
            hexes: [],

             // a bag of hex types to pick from to replace HexFromBag hexes with
             // items may be 
             // 1. A Hex instance
             // 2. Array in form [int amount, () => CreateHex()]
             // e.g. [new Forest(), [3, () => new Mountain()]]
            hexBag: [],
        };
        this._hexes = new Map(); // <Coord.hash, Hex>
    }
    placeHexes() {
        for (var hex of this._config.hexes) {
            if (Array.isArray(hex)) {
                var array = hex;
                var amount = hex[0];
                var createHexFunction = array[1];
                for (var i=0; i< amount; i++){
                    var createdHex = createHexFunction();
                    createdHex.coord = coord;
                    this._hexes.set(createdHex.coord.hash, createdHex);
                }
            } else {
                this._hexes.set(hex.coord.hash, hex);
            }
        }
    }
    generateBoard(random) {

    }
    get hexes() { return this._hexes; }
    setHex(coord, hex) {
        this._hexes[coord.hash] = hex;
    }
}
class Standard4pDesign extends Board {
    constructor() {
        super();
        this._config = {
            hexes: this.generateHexes(),
            hexBag: [
                new Desert(),
                [4, () => new Forest()],
                [4, () => new WheatField()],
                [4, () => new Pasture()],
                [3, () => new Mountain()],
                [3, () => new River()],
            ]
        };
        this.placeHexes();
    }

    generateHexes() {
        var coords = new Map(); // <coord.hash, Coord>
        var center = new Coord3D(0,0,0);
        var fromBagCoords = [
            ...this.getCoordsByRadius(0).values(),
            ...this.getCoordsByRadius(1).values(),
            ...this.getCoordsByRadius(2).values(), 
        ];
        var seaCoords = this.getCoordsByRadius(3).values();
        
        var hexes = [];
        for (var coord of fromBagCoords) {
            hexes.push(new HexFromBag(coord));
        }
        for (var coord of seaCoords) {
            hexes.push(new Sea(coord));
        }
        return hexes;
    }
    getCoordsByRadius(radius) {
        if (radius === 0) {
            var map = new Map();
            var center = new Coord3D(0, 0, 0);
            map.set(center.hash, center);
            return map;
        }
        var aCoord = new Coord3D(0, radius, -radius);
        var coords = new Map();
        this.addNeighborsRecursively(coords, aCoord, c => c.radius === radius);
        return coords;
    }
    addNeighborsRecursively(coords, coord, shouldAdd) {
        if (shouldAdd(coord)) {
            coords.set(coord.hash, coord);
        }
        for (var neighbor of coord.neighbors) {
            if (!coords.has(neighbor.hash) && shouldAdd(neighbor)) {
                this.addNeighborsRecursively(coords, neighbor, shouldAdd);
            }
        }
    }
}
