let flag = false;
let prevX = 0;
let currX = 0;
let prevY = 0;
let currY = 0;
let canvas = document.getElementById("signature");
if (canvas) {
    var context = canvas.getContext("2d");
    context.strokeStyle = "#FFFFFF";

    canvas.addEventListener("click", function () {
        let myImage = canvas.toDataURL("image/png");
        console.log(myImage);
    });

    canvas.addEventListener(
        "mousemove",
        function (e) {
            if (flag) {
                prevX = currX;
                prevY = currY;
                currX = e.clientX - canvas.offsetLeft;
                currY = e.clientY - canvas.offsetTop;
                draw();
            }
        },
        false
    );
    canvas.addEventListener(
        "mousedown",
        function (e) {
            flag = true;
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;
        },
        false
    );
    canvas.addEventListener(
        "mouseup",
        function () {
            flag = false;
            document.getElementById("hidden").value = canvas.toDataURL(
                "image/png"
            );
        },
        false
    );
    canvas.addEventListener(
        "mouseout",
        function () {
            flag = false;
        },
        false
    );

    function draw() {
        context.beginPath();
        context.moveTo(prevX, prevY);
        context.lineTo(currX, currY);
        context.stroke();
        context.closePath();
    }
}
