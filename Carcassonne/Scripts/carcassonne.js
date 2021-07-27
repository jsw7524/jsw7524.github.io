var stack = [];

function countTotal() {
    var total = 0;
    $('table td').each(function () {

        var el = $(this).find('span');
        var n = parseInt($(el).html());
        if (n === 0) {
            $(this).css('opacity', '0.25');
        }
        else {
            $(this).css('opacity', '1');
        }
        total += n;
    });
    $('#total').html(total);
}

function ResetBackgroundColor() {
    $('table td').each(function () {
        this.style.backgroundColor = "white"
    });
}


$(document).ready(function () {
    countTotal();
    $('td').on('click', function (e) {

        var el = $(this).find('span');
        var old = el.html();
        var newv = old - 1;
        if (newv > -1) {
            ResetBackgroundColor()
            el.html(newv);
            stack.push(this)
            this.style.backgroundColor = "yellow";
        }
        countTotal();
    });

    $('#button_undo').on('click', function (e) {
        ResetBackgroundColor()
        if (stack.length === 0) {
            return;
        }
        var elmtd = stack.pop();
        var el = $(elmtd).find('span');
        var old = el.html();
        var newv = parseInt(old) + 1;
        el.html(newv);
        elmtd.style.backgroundColor = "yellow";
        countTotal();
    });
});