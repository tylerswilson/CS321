// part3.js
// //
// // Program to draw a 3d pyramid, an Octagon, and a Dimpled Cube with rotations
// // Adapted from Angel & Shreiner cube program
// // By Tyler Wilson on February 19th, 2018
var canvas;
var gl;

//var NumVertices  = 18;

var points = [];
var colors = [];

const radius = 0.2;
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var x = -0.8;
var y = -0.8;
var z =  0.0;
var deltaX = 1.0/128.0;
var deltaY = 1.0/128.0;

var axis1 = 0;
var axis2 = 1;
var theta = [ 0, 0, 0 ];
var theta2 = [ 1, 0, 0 ];
var scale = [ 1, 1, 1 ];
var trans = [ 0, 0, 0 ];
var run1  = true;
var run2 = false;

var thetaLoc;
var thetaLoc2;
var scaleLoc;
var transLoc;

var numPyramidVertices = 0;
var numCubeVertices = 0;
var numOctagonVertices = 0;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }


    pyramid();
    colorCube();
    //octogon();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );


    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    thetaLoc = gl.getUniformLocation(program, "theta");
    thetaLoc2 = gl.getUniformLocation(program, "theta2");
    scaleLoc = gl.getUniformLocation(program, "scale");
    transLoc = gl.getUniformLocation(program, "trans");

    //event listeners for buttons

    // added by JAWH, 2018/02/01
    document.getElementById( "sButton1" ).onclick = function () {
        run1 = !run1;
    };

    document.getElementById( "sButton2" ).onclick = function () {
        run2 = !run2;
    };

    render();
}

function pyramid()
{
    pyr(1, 3, 0);
    pyr(1, 3, 2);
    pyr(4, 1, 0);
    pyr(2, 1, 4);
    pyr(3, 2, 4);
    pyr(0, 3, 4);
}

function pyr(a, b, c, d)
{
    var vertices = [
        vec4( -1.0, -1.0,  1.0, 1.0 ),//0
        vec4( 1.0,  -1.0,  1.0, 1.0 ),//1
        vec4(  1.0,  1.0,  1.0, 1.0 ),//2
        vec4(  -1.0, 1.0,  1.0, 1.0 ),//3
        vec4(  0.0,  0.0, -1.0, 1.0 ),//4
    ];

    var vertexColors = [
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
    ];
    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c];

    for (var i = 0; i < indices.length; ++i) {
        points.push( vertices[indices[i]] );
        //colors.push( vertexColors[indices[]] );

        // for solid colored faces use
        colors.push(vertexColors[a]);
        numPyramidVertices++;

    }
}

function colorCube()
{
    quad( 1, 0, 4, 0);
    quad( 2, 1, 4, 1);
    quad( 0, 3, 4, 2);
    quad( 3, 2, 4, 3);
    quad( 3, 2, 7, 0);
    quad( 6, 2, 7, 1);
    quad( 7, 5, 6, 2);
    quad( 5, 7, 3, 3);
    quad( 8, 1, 9, 0);
    quad( 6, 8, 9, 1);
    quad( 2, 6, 9, 2);
    quad( 9, 1, 2, 3);
    quad(13,10, 5, 0);
    quad(10,13, 0, 1);
    quad( 3, 5,13, 2);
    quad( 3, 0,13, 3);
    quad( 1, 8,11, 0);
    quad( 0, 1,11, 1);
    quad(10, 11,8,2);
    quad(11,10, 0, 3);
    quad( 8, 6,12, 0);
    quad( 10,8,12, 1);
    quad(5, 12, 6, 2);
    quad(12, 5,10, 3);
}

function quad(a, b, c, d)
{
    var vertices = [
        vec4( -1.0, -1.0,  1.0, 1.0 ),//0
        vec4( -1.0,  1.0,  1.0, 1.0 ),//1
        vec4(  1.0,  1.0,  1.0, 1.0 ),//2
        vec4(  1.0, -1.0,  1.0, 1.0 ),//3
        vec4(  0.0,  0.0,  0.2, 1.0 ),//4
        vec4(  1.0, -1.0, -1.0, 1.0 ),//5
        vec4(  1.0,  1.0, -1.0, 1.0 ),//6
        vec4(  0.2,  0.0,  0.0, 1.0 ),//7
        vec4( -1.0,  1.0, -1.0, 1.0 ),//8
        vec4(  0.0,  0.2,  0.0, 1.0 ),//9
        vec4( -1.0, -1.0, -1.0, 1.0 ),//10
        vec4( -0.2,  0.0,  0.0, 1.0 ),//11
        vec4(  0.0,  0.0, -0.2, 1.0 ),//12
        vec4(  0.0, -0.2,  0.0, 1.0 ),//13

    ];

    var vertexColors = [
        [ 1.0, 0.0, 0.0, 1.0 ],  // red   //0
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta  //1
        [ 0.75, 0.75, 1.0, 1.0 ],  // light blue//2
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue //3
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c, d];

    for (var i = 0; i < 3; ++i) {
        points.push( vertices[indices[i]] );
        //colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        colors.push(vertexColors[d]);
        numCubeVertices++;

    }
}

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniform3fv(thetaLoc, theta);
        gl.uniform3fv(scaleLoc, [0.1, 0.1, 0.1]);
        gl.uniform3fv(transLoc, [-.5, 0.3, 0]);
        gl.drawArrays( gl.TRIANGLES, 0, numPyramidVertices );

        // gl.uniform3fv(thetaLoc2, theta2);
        // //theta[axis] -= 15.0;
        gl.uniform3fv(thetaLoc, theta2)
        gl.uniform3fv(scaleLoc, [0.1, 0.1, 0.1]);
        gl.uniform3fv(transLoc, [x, y, z]);
        gl.drawArrays( gl.TRIANGLES, numPyramidVertices, numCubeVertices);



        if (run1){
                theta[axis1] += 10.0;
              }

        if (run2){
            theta2[2] += 10.0;
            x += .01;
            y += .01;
            var dist2wall = 1.0 - (radius + Math.abs(x));
            if (dist2wall < 0.0) { // ball has reached wall
              x = -0.8;
              y = -0.8;
            }
        }


        requestAnimFrame( render );
}
