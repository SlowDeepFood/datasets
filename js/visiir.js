(function($) {
    "use strict";

    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: ($($anchor.attr('href')).offset().top - 50)
        }, 1250, 'easeInOutExpo');
        event.preventDefault();
    });

    // Highlight the top nav as scrolling occurs
    $('body').scrollspy({
        target: '.navbar-fixed-top',
        offset: 51
    })

    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function() {
        $('.navbar-toggle:visible').click();
    });

    // Fit Text Plugin for Main Header
    $("h1").fitText(
        1.2, {
            minFontSize: '35px',
            maxFontSize: '65px'
        }
    );

    // Offset for Main Navigation
    $('#mainNav').affix({
        offset: {
            top: 100
        }
    })

    // function to get image orientation
    function getOrientation(file, callback) {
        var reader = new FileReader();
        reader.onload = function(e) {

            var view = new DataView(e.target.result);
            if (view.getUint16(0, false) != 0xFFD8) return callback(file, -2);
            var length = view.byteLength;
            var offset = 2;
            while (offset < length) {
                var marker = view.getUint16(offset, false);
                offset += 2;
                if (marker == 0xFFE1) {
                    var little = view.getUint16(offset += 8, false) == 0x4949;
                    offset += view.getUint32(offset + 4, little);
                    var tags = view.getUint16(offset, little);
                    offset += 2;
                    for (var i = 0; i < tags; i++)
                        if (view.getUint16(offset + (i * 12), little) == 0x0112)
                            return callback(file, view.getUint16(offset + (i * 12) + 8, little));
                }
                else if ((marker & 0xFF00) != 0xFF00) break;
                else offset += view.getUint16(offset, false);
            }
            return callback(file, -1);
        };
        reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
    }


    $(document).on('change', '.btn-file :file', function(e) {

        var input = $(this);
        var imagePreview = $(this).parent().children(".file-feedback");
        var file = e.target.files[0];
        imagePreview.html("<span>No image loaded</span>");

        if (!file) {
            return;
        }
        if (/^image\//i.test(file.type)) {

            getOrientation(file, function (file, orientation) {

                var reader = new FileReader();

                reader.onloadend = function () {

                    var image = new Image();
                    image.src = reader.result;

                    image.onload = function () {

                        var imgSize = 221;

                        // create canvas
                        var canvas = document.createElement('canvas');
                        var context = canvas.getContext('2d');
                        imagePreview.html(canvas);
                        canvas.width = imgSize;
                        canvas.height = imgSize;

                        // configure image rotation context
                        if (orientation == 1) context.transform( 1,  0,  0,  1,       0,       0);
                        if (orientation == 2) context.transform(-1,  0,  0,  1, imgSize,       0);
                        if (orientation == 3) context.transform(-1,  0,  0, -1, imgSize, imgSize);
                        if (orientation == 4) context.transform( 1,  0,  0, -1,       0, imgSize);
                        if (orientation == 5) context.transform( 0,  1,  1,  0,       0,       0);
                        if (orientation == 6) context.transform( 0,  1, -1,  0, imgSize,       0);
                        if (orientation == 7) context.transform( 0, -1, -1,  0, imgSize, imgSize);
                        if (orientation == 8) context.transform( 0, -1,  1,  0,       0, imgSize);

                        // resize image
                        var srcW = image.width;
                        var srcH = image.height;
                        var srcMinSize = Math.min(srcH, srcW);
                        var srcOffset = Math.ceil(Math.abs(srcW - srcH) / 2);
                        var srcX = srcW > srcH ? srcOffset : 0;
                        var srcY = srcW < srcH ? srcOffset : 0;
                        context.drawImage(this, srcX, srcY, srcMinSize, srcMinSize, 0, 0, imgSize, imgSize);

                        // get base64 image data
                        var imageData = canvas.toDataURL('image/jpeg', 0.95);
                        if (imageData.length < 22)
                            imageData = canvas.toDataURL();
                        if (imageData.length < 22)
                            return;

                        // if no length problem on base64 data, save to hidden field and reset file input
                       $("#image-data").val(imageData);
                        input.wrap('<form>').closest('form').get(0).reset();
                        input.unwrap();

                    };
                }
                reader.readAsDataURL(file);
            });
        }

        /*
        var input = $(this);
        var numFiles = input.get(0).files ? input.get(0).files.length : 1;
        var label = input.val().replace(/\\/g, '/').replace(/.*\//, '');

        if(label.length > 25)
            label = label.substring(0,24)+"...";

        if (numFiles > 0)
            input.parent().children(".file-feedback").html(' ('+label+')');
        else
            input.parent().children(".file-feedback").html('');
        */
    });

    $('[data-toggle="tooltip"]').tooltip();

    $(".image-box").on("click", function () {
        $(".image-box").removeClass("hover");
        $(this).addClass("hover");
    });

})(jQuery);