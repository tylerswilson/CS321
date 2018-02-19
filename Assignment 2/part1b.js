// part1b.js
//
// Program to draw a dimpled cube
// Adapted from Angel & Shreiner cube program
// by Tyler Wilson on February 19th, 2018
var canvas;
var gl;

var NumVertices  = 72;

var points = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var thetaLoc;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

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

    //event listeners for buttons

    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
    };

    render();
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

    }
}

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta[axis] += 2.0;
    if (theta >= 360.0) theta -= 360.0;
    gl.uniform3fv(thetaLoc, theta);

    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    requestAnimFrame( render );
}
