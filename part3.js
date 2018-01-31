// part3.js

//  Program to draw a blue chevron on a pink background
//  in the center of the canvas
//  Adapted from Angel & Shreiner 2D Sierpinski Gasket program
//  and from Whitford Holey's Swiss Flag program
//  by Tyler Wilson on January 30, 2017


var gl;
var points = [];

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the square
    //

    // First, initialize the corners of the square

    var vertices = [
        vec2( 0.0, 0.0),   //  0
        vec2( -0.5, 0.0),  //  1
        vec2( -0.5, -0.25),//  2
        vec2( 0.5, 0.0),   //  3
        vec2( 0.5, -0.25), //  4
        vec2( 0.0, 0.25),  //  5
    ];

    var vertices2 = [
        vec2( 0.0, -0.5),   //  0
        vec2( -0.5, -0.5),  //  1
        vec2( -0.5, -0.75),//  2
        vec2( 0.5, -0.5),   //  3
        vec2( 0.5, -0.75), //  4
        vec2( 0.0, -0.25),  //  5
    ];

    var vertices3 = [
        vec2( 0.0, 0.5),   //  0
        vec2( -0.5, 0.5),  //  1
        vec2( -0.5, 0.25),//  2
        vec2( 0.5, 0.5),   //  3
        vec2( 0.5, 0.25), //  4
        vec2( 0.0, 0.75),  //  5
    ];



    // Set up the quad as two triangles
    points.push( vertices[ 0] );
    points.push( vertices[ 1] );
    points.push( vertices[ 2] );

    points.push( vertices[ 0] );
    points.push( vertices[ 3] );
    points.push( vertices[ 4] );

    points.push( vertices[ 1] );
    points.push( vertices[ 3] );
    points.push( vertices[ 5] );

    points.push( vertices2[ 0] );
    points.push( vertices2[ 1] );
    points.push( vertices2[ 2] );

    points.push( vertices2[ 0] );
    points.push( vertices2[ 3] );
    points.push( vertices2[ 4] );

    points.push( vertices2[ 1] );
    points.push( vertices2[ 3] );
    points.push( vertices2[ 5] );

    points.push( vertices3[ 0] );
    points.push( vertices3[ 1] );
    points.push( vertices3[ 2] );

    points.push( vertices3[ 0] );
    points.push( vertices3[ 3] );
    points.push( vertices3[ 4] );

    points.push( vertices3[ 1] );
    points.push( vertices3[ 3] );
    points.push( vertices3[ 5] );

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1, 0.1, 1, 1.0 ); // Magenta background


    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate our shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
