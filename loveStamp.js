// loveStamp.js

//  Program to draw a love stamp
//  Adapted from Angel & Shreiner 2D Sierpinski Gasket program
//  and from Whitford Holey's object2 program
//  by Tyler Wilson on January 30, 2017


var gl;
var points = [];
var currentColorLoc;

function drawRedCircle(x, y, radius){
	points.push(vec2(x, y));
        var rad = (2*Math.PI) / 99.0;
	console.log(rad);
	for (i = 1; i <= 100; i++){
    		points.push( vec2( x + (radius*Math.cos(rad*i)) , y + (radius*Math.sin(rad*i) ) ) );
	}
  return
}

function drawGreenCircle(x, y, radius){
	points.push(vec2(x, y));
        var rad = (2*Math.PI) / 99.0;
	console.log(rad);
	for (i = 1; i <= 100; i++){
    		points.push( vec2( x + (radius*Math.cos(rad*i)*.4) , y + (radius*Math.sin(rad*i) ) ) );
	}
  return
}

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    var RedVertices = [
        vec2( -0.9, 0.0 ), //  0
        vec2(  -0.9, 1.0 ), //  1
        vec2(  -0.6, 1.0 ), //  2
        vec2( -0.6,  0.0 ), //  3
        vec2( -1.0, 1.0),//  4
        vec2( -0.9, 0.9),//  5
        vec2( -0.9, 0.1),//  6
        vec2( -1.0, 0.0),//  7
        vec2( -0.6, 0.9),//  8
        vec2( -0.5, 1.0),//  9
        vec2( -0.6, 0.03),// 10
        vec2( 0.0, 0.0),//   11
        vec2( -0.4, 0.02),//   12
        vec2( 0.0, 0.5),//   13
        vec2( 0.0, 0.0), // 14
        vec2( -1.0, 0.0 ), //15
        vec2( -0.5, -1.0 ), //16
        vec2( 0.5, 0.0 ), //17
        vec2( 0.5, -0.5), //18
        vec2( 0.0, -1.0 ), //19
        vec2( 0.5, -1.0), //20
        vec2( 0.2, -0.1), //21
        vec2( 0.2, -0.9 ), //22
        vec2( 0.5, -0.5), //23
        vec2( 0.5, -0.1), //24
        vec2( 1.0, 0.0), //25
        vec2( 1.0, -0.1), // 26
        vec2( 0.75, -0.1), //27
        vec2( 1.0, -0.4), //28
        vec2( 0.5, -1.0), //29
        vec2( 0.5, -0.9), //30
        vec2( 0.75, -0.9), //31
        vec2( 1.0, -1.0),//32
        vec2( 1.0, -0.6), //33
        vec2( 1.0, -1.0),//34
        vec2( 0.5, -0.45),//35
        vec2( 0.8, -0.45),//36
        vec2( 0.8, -0.55),//37
        vec2( 0.5, -0.55),//38
        vec2( 0.7, -0.45),//39
        vec2( 0.8, -0.4),//40
        vec2( 0.7, -0.55),//41
        vec2( 0.8, -0.6),//42

    ];

    // Set up the quad as two triangles
    points.push( RedVertices[ 0] );
    points.push( RedVertices[ 1] );
    points.push( RedVertices[ 2] );

    points.push( RedVertices[ 0] );
    points.push( RedVertices[ 2] );
    points.push( RedVertices[ 3] );

    points.push( RedVertices[ 4] );
    points.push( RedVertices[ 5] );
    points.push( RedVertices[ 1] );

    points.push( RedVertices[ 6] );
    points.push( RedVertices[ 7] );
    points.push( RedVertices[ 0] );

    points.push( RedVertices[ 8] );
    points.push( RedVertices[ 9] );
    points.push( RedVertices[ 2] );

    points.push( RedVertices[ 10] );
    points.push( RedVertices[ 11] );
    points.push( RedVertices[ 3] );

    points.push( RedVertices[ 12] );
    points.push( RedVertices[ 13] );
    points.push( RedVertices[ 11] );

    points.push( RedVertices[ 14] );
    points.push( RedVertices[ 15] );
    points.push( RedVertices[ 16] );

    points.push( RedVertices[ 11] );
    points.push( RedVertices[ 17] );
    points.push( RedVertices[ 18] );

    points.push( RedVertices[ 18] );
    points.push( RedVertices[ 19] );
    points.push( RedVertices[ 20] );

    points.push( RedVertices[ 21] );
    points.push( RedVertices[ 22] );
    points.push( RedVertices[ 23] );

    points.push( RedVertices[ 17] );
    points.push( RedVertices[ 24] );
    points.push( RedVertices[ 25] );

    points.push( RedVertices[ 26] );
    points.push( RedVertices[ 24] );
    points.push( RedVertices[ 25] );

    points.push( RedVertices[ 26] );
    points.push( RedVertices[ 27] );
    points.push( RedVertices[ 28] );

    points.push( RedVertices[ 29] );
    points.push( RedVertices[ 30] );
    points.push( RedVertices[ 34] );

    points.push( RedVertices[ 30] );
    points.push( RedVertices[ 31] );
    points.push( RedVertices[ 32] );

    points.push( RedVertices[ 33] );
    points.push( RedVertices[ 34] );
    points.push( RedVertices[ 31] );

    points.push( RedVertices[ 35] );
    points.push( RedVertices[ 36] );
    points.push( RedVertices[ 37] );

    points.push( RedVertices[ 35] );
    points.push( RedVertices[ 38] );
    points.push( RedVertices[ 37] );

    points.push( RedVertices[ 39] );
    points.push( RedVertices[ 40] );
    points.push( RedVertices[ 36] );

    points.push( RedVertices[ 41] );
    points.push( RedVertices[ 42] );
    points.push( RedVertices[ 37] );

    // points.push( RedVertices[ 43] );
    // points.push( RedVertices[ 44] );
    // points.push( RedVertices[ 45] );

    // Now, initialize the corners of the triangle


    var BlueVertices = [
        vec2( -0.6, -0.1 ), //  0
        vec2( -0.3, -0.1 ),//   1
        vec2( -0.45, -0.5),//   2
    ];

    // Set up the triangle
    points.push( BlueVertices[ 0] );
    points.push( BlueVertices[ 1] );
    points.push( BlueVertices[ 2] );

    var GreenVertices = [
        vec2( -1.0, 1.0 ), //  0
        vec2( -0.9, 0.9 ),//   1
        vec2( -1.0, 0.0),//   2
        vec2( -0.9, 0.1 ), //  3
        vec2( -1.0, -1.0),//   4
        vec2( -0.5, -1.0 ), //  5
        vec2( 0.0, 0.0),//   6
        vec2( 0.0, -1.0 ), //  7
        vec2( 0.2, -0.2), // 8
        vec2( 0.2, -0.8), // 9

    ];

    // Set up the triangle
    points.push( GreenVertices[ 0] );
    points.push( GreenVertices[ 1] );
    points.push( GreenVertices[ 2] );

    points.push( GreenVertices[ 1] );
    points.push( GreenVertices[ 2] );
    points.push( GreenVertices[ 3] );

    points.push( GreenVertices[ 2] );
    points.push( GreenVertices[ 4] );
    points.push( GreenVertices[ 5] );

    points.push( GreenVertices[ 5] );
    points.push( GreenVertices[ 6] );
    points.push( GreenVertices[ 7] );

    points.push( GreenVertices[ 8] );
    points.push( GreenVertices[ 6] );
    points.push( GreenVertices[ 7] );

    points.push( GreenVertices[ 7] );
    points.push( GreenVertices[ 8] );
    points.push( GreenVertices[ 9] );

    //
    //  Configure WebGL
    //

    drawRedCircle(0.5, 0.5, 0.5);
    drawGreenCircle(0.5, 0.5, 0.4);

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.235, 0.55, 0.9, 1.0 ); // blue background


    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate our shader variables with our data buffer

    var vPosition   = gl.getAttribLocation( program, "vPosition" );
    currentColorLoc = gl.getUniformLocation(program, "currentColor");
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function render() {
    var startRed     = 0;
    var numRedPoints =63;
    var startBlue = numRedPoints;
    var numBluePoints = 3;
    var startGreen = startBlue + numBluePoints
    var numGreenPoints= 18;
    var startRedOPoints = numGreenPoints + startGreen;
    var numRedOPoints = 101;
    var startGreenOPoints = startRedOPoints + numRedOPoints;
    var numGreenOPoints = 101;

    var red = vec4( 0.88, 0.11, 0.11, 1.0 );
    var blue  = vec4( 0.235, 0.55, 0.90, 1.0 );
    var green = vec4( 0.09, 0.63, 0.23, 1.0);

    // clear the canvas
    gl.clear( gl.COLOR_BUFFER_BIT );

    // draw the square
    gl.uniform4fv( currentColorLoc, red);
    gl.drawArrays( gl.TRIANGLES, startRed, numRedPoints );


    gl.uniform4fv( currentColorLoc, blue);
    gl.drawArrays( gl.TRIANGLES, startBlue, numBluePoints);

    gl.uniform4fv( currentColorLoc, green);
    gl.drawArrays( gl.TRIANGLES, startGreen, numGreenPoints);

    gl.uniform4fv( currentColorLoc, red);
    gl.drawArrays( gl.TRIANGLE_FAN, startRedOPoints, numRedOPoints);

    gl.uniform4fv( currentColorLoc, green);
    gl.drawArrays( gl.TRIANGLE_FAN, startGreenOPoints, numGreenOPoints);

    }
