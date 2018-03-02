
<!-- // Program to draw a 3d pyramid, and a Dimpled Cube with a light effect
// Adapted from Angel & Shreiner cube program and J. Andrew Whitford Holey's PingPong1
// By Tyler Wilson on March 2, 2018 --> -->




var canvas;
var gl;

// Projection transformation parameters
var   fieldOfViewY = 40.0,
      aspectRatio  =  1.0, // actual value set in init
      zNear        =  1.0,
      zFar         = 20.0;

var modelViewLoc;  // uniform location of the modelView matrix

// parameters for viewer position
const initViewerDist  =  4.0;
const minViewerDist   =  .5;
const maxViewerDist   = 10.0;
const maxOffsetRatio  =  1.0;
const deltaViewerDist =  0.25;
const deltaOffset     =  0.1;
var   eye             = vec3(0.0, 0.0, initViewerDist);
const at              = vec3(0.0, 0.0, 0.0);
const up              = vec3(0.0, 1.0, 0.0);

// Fly-over parameters
var   fly         = false;
const flyDelta        = 0.01;
var   fdx, fdy, fdz;
const startEye        = vec3(0.0, 0.0, initViewerDist);;
const startAt         = vec3(0.0, 0.0, 0.0);

var projectionLoc;  // uniform location of the projection matrix

var points = [];
var colors = [];

var numPyramidVertices = 0;
var numCubeVertices = 0;
//var numOctagonVertices = 0;
const scaleObject = scalem(0.2, 0.2, 0.2);

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    aspectRatio  =  canvas.width / canvas.height;



    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.3, 0.9, 0.9, 1.0 );

    gl.enable(gl.DEPTH_TEST);


    pyramid();
    colorCube();
    //octogon();
    //
        //  Load shaders and initialize attribute buffers
        //
        var program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);

        var cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

        var vColor = gl.getAttribLocation(program, "vColor");
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);

        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        modelViewLoc  = gl.getUniformLocation(program, "model_view");
        projectionLoc = gl.getUniformLocation(program, "projection");
 //event listeners for buttons


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

    var projection = perspective(fieldOfViewY, aspectRatio, zNear, zFar);
    gl.uniformMatrix4fv(projectionLoc, false, flatten(projection));

    var viewer = lookAt(eye, at, up);

    pyrm = mult(viewer, mult( mult(translate(-0.5, 0.3, -0.5),rotate(160, 20, 15, 0.0)),scaleObject));
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(pyrm));
    gl.drawArrays(gl.TRIANGLES,0,numPyramidVertices);

    cube = mult(viewer, mult( mult(translate(0.2, -0.3, 0.5),rotate(20, 0.0, 1.0, 0.0)),scaleObject));
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(cube));
    gl.drawArrays(gl.TRIANGLES,numPyramidVertices,numCubeVertices);

}
