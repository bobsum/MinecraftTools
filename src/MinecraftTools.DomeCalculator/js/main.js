var DomeCalculator = (function () {
    function DomeCalculator(pixelSize) {
        if (typeof pixelSize === "undefined") { pixelSize = 10; }
        this.pixelSize = pixelSize;
    }
    DomeCalculator.prototype.exec = function (height, chord) {
        var imageSize = chord * this.pixelSize + 1;

        var radius = (Math.pow(height, 2) + Math.pow(chord / 2, 2)) / (2 * height);

        var powRadiusOuter = Math.pow(radius, 2);
        var powRadiusInner = Math.pow(radius - 1.0000001, 2);

        var profil = document.createElement("canvas");
        profil.width = imageSize;
        profil.height = height * this.pixelSize + 1;
        var ctx = profil.getContext("2d");
        var totalBlocks = 0;
        var layers = [];

        var profileY = Math.floor(chord / 2);
        var offset = -(chord - 1) / 2;
        for (var z = 0; z < height; z++) {
            var powZ = Math.pow(z + radius - height, 2);

            //calc level
            var canvas = document.createElement("canvas");
            canvas.width = imageSize;
            canvas.height = imageSize;
            var gfx = canvas.getContext('2d');
            var blocks = 0;

            for (var y = 0; y < chord; y++) {
                var powY = Math.pow(y + offset, 2);
                for (var x = 0; x < chord; x++) {
                    var powX = Math.pow(x + offset, 2);
                    var distance = powX + powY + powZ;

                    if (powRadiusOuter >= distance && distance >= powRadiusInner) {
                        blocks++;
                        this.setBlock(gfx, 'red', x, y);
                        if (y == profileY)
                            this.setBlock(ctx, 'red', x, height - z - 1);
                    } else {
                        this.setBlock(gfx, 'white', x, y);
                        if (y == profileY)
                            this.setBlock(ctx, 'white', x, height - z - 1);
                    }
                }
            }
            layers.push({
                canvas: canvas,
                blocks: blocks
            });
            totalBlocks += blocks;
            //calc level end
        }
        return {
            blocks: totalBlocks,
            profil: profil,
            layers: layers
        };
    };

    DomeCalculator.prototype.setBlock = function (ctx, color, x, y) {
        ctx.strokeStyle = 'black';
        ctx.fillStyle = color;
        ctx.fillRect(x * this.pixelSize + 0.5, y * this.pixelSize + 0.5, this.pixelSize, this.pixelSize);
        ctx.strokeRect(x * this.pixelSize + 0.5, y * this.pixelSize + 0.5, this.pixelSize, this.pixelSize);
    };
    return DomeCalculator;
})();

function setValidState($input, valid) {
    $input.parent().toggleClass('has-success', valid).toggleClass('has-error', !valid);

    $input.siblings('.glyphicon.form-control-feedback').toggleClass('glyphicon-ok', valid).toggleClass('glyphicon-remove', !valid);
}

function createStats(total) {
    var chests = Math.floor(total / 1728);
    var stacks = Math.floor(total % 1728 / 64);
    var blocks = total % 1728 % 64;
    var $el = $('<div/>');
    if (chests > 0)
        $el.append(chests + ' <span class="icon icon-chest"></span> + ');
    if (chests > 0 || stacks > 0)
        $el.append(stacks + ' <span class="icon icon-stack"></span> + ' + blocks + ' <span class="icon icon-block"></span> = ');
    $el.append('<strong>' + total + '</strong> <span class="icon icon-block"></span>');
    return $el;
}

function createPanel(content, blocks, title) {
    if (typeof title === "undefined") { title = ''; }
    return $('<div class="panel panel-primary level-panel"/>').append('<div class="panel-heading"><h2 class="panel-title">' + title + '</h2></div>').append($('<div class="panel-body text-center"/>').append(content)).append($('<div class="panel-footer"></div>').append(createStats(blocks)));
}

$(function () {
    if (!Modernizr.canvas) {
        $('.container-fluid .row').html('<div class="alert alert-danger"><span class="glyphicon glyphicon-warning-sign"></span> Your browser is not supported. Please use a browser with canvas support.</div>');
        return;
    }

    var calculator = new DomeCalculator();
    var $height = $('#domeInputHeight');
    var $chord = $('#domeInputChord');
    var $calculate = $('#domeButtonCalculate');
    var $result = $('#result');
    var $levels = $('#levels');

    var height;
    var chord;

    $('#domeInputHeight, #domeInputChord').on('input', function () {
        height = parseInt($height.val(), 10);
        chord = parseInt($chord.val(), 10);

        var heightValid = (height >= 1);
        var chordValid = (chord >= 2 && (Math.ceil(chord / 2) >= height || !heightValid));

        $calculate.prop("disabled", !(heightValid && chordValid));

        setValidState($height, heightValid);
        setValidState($chord, chordValid);
    });

    $calculate.click(function (e) {
        $levels.empty();
        $result.empty();

        var result = calculator.exec(height, chord);
        $result.append(createPanel($(result.profil), result.blocks, 'Overall Result'));
        for (var i = 0; i < result.layers.length; i++) {
            var layer = result.layers[i];
            $levels.append(createPanel($(layer.canvas), layer.blocks, 'Level ' + (i + 1)));
        }
        e.preventDefault();
    });
});
//# sourceMappingURL=main.js.map
