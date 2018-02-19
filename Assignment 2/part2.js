// part2.js
//
// Program to draw a 3d pyramid without rotation
// This program includes translation and rotation buttons
// Adapted from Angel & Shreiner cube program
// By Tyler Wilson on February 19th, 2018
var canvas;
var gl;

var NumVertices  = 18;

var points = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];
var scale = [ 1, 1, 1 ];
var trans = [ 0, 0, 0 ];
var run  = true;

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
    scaleLoc = gl.getUniformLocation(program, "scale");
    transLoc = gl.getUniformLocation(program, "trans");

    //event listeners for buttons

    document.getElementById( "apply" ).onclick = function () {
        //axis = xAxis;
        theta[2] = parseInt(document.getElementById("zrot").value);
	var val = parseFloat(document.getElementById("scale").value);
	scale[0] = val;
	scale[1] = val;
	scale[2] = val;
	trans[0] = parseFloat(document.getElementById("x-trans").value);
        trans[1] = parseFloat(document.getElementById("y-trans").value);
    };

    render();
}

function colorCube()
{
    quad(1, 3, 0);
    quad(1, 3, 2);
    quad(4, 1, 0);
    quad(2, 1, 4);
    quad(3, 2, 4);
    quad(0, 3, 4);
}

function quad(a, b, c, d)
{
    var vertices = [
        vec4( -1.0, -1.0,  1.0, 1.0 ),//0
        vec4( 1.0,  -1.0,  1.0, 1.0 ),//1
        vec4(  1.0,  1.0,  1.0, 1.0 ),//2
        vec4(  -1.0, 1.0,  1.0, 1.0 ),//3
        vec4(  0.0,  0.0, -1.0, 1.0 ),//4
    ];

    var vertexColors = [
        //[ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        //[ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        //[ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c];

    for (var i = 0; i < indices.length; ++i) {
        points.push( vertices[indices[i]] );
        //colors.push( vertexColors[indices[]] );

        // for solid colored faces use
        colors.push(vertexColors[a]);

    }
}

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (run) theta[axis] += 2.0;  // if (run) added by JAWH, 2018/02/01
        gl.uniform3fv(thetaLoc, theta);
        gl.uniform3fv(scaleLoc, scale);
        gl.uniform3fv(transLoc, trans);

        gl.drawArrays( gl.TRIANGLES, 0, points.length );

        requestAnimFrame( render );
}
