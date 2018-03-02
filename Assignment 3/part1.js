// File: polygon.js

// Program to draw a ball bouncing between two walls;
// each triangle in the ball is a different randomly-generated color;
// the user can change the position of the viewer using buttons.
// Adapted from Angel & Shreiner 2D Sierpinski Gasket, Color Cube programs
// and recursive sphere.
// by J. Andrew Whitford Holey, February 15, 2016

var canvas;
var gl;

// parameters for the walls (stretched cubes)
var   numWallPoints = 36;      // 6 faces * 2 triangles/face * 3 vertices/triangle
const wallWidth     =  0.125;
const wallSX        =  0.0625; // 1/16 scale factor to get 1/8 width
const wallDX        =  0.9375; // move wall +|-15/16

// parameters for creating the ball
const divs          =  3; // number of recursive divisions
var   numBallPoints = 24; // actual value computed in init

// parameters for the ball transformation matrices
const radius = 0.15;
const sx = radius, sy = radius, sz = radius; // ball scale factors
var   theta = 0.0;                           // rotation
var   deltaTheta = 1.5;                      // rotation change
var   deltaDX = 1.0 / 128.0;                 // change in dx
var   dx = 0.0, dy = 0.0, dz = 0.0;          // translation factors
const compressLimit = radius / 16.0;         // compression limit
var   compressFactor = 1.0;                  // compression factor
var   phase = 0;                             // phase of compression cycle

// constant matrices
const scaleBall = scalem(sx, sy, sz);
const scaleWall = scalem(wallSX, 1.0, 1.0);
const leftWall  = mult(translate(-wallDX, 0.0, 0.0 ), scaleWall);
const rightWall = mult(translate(wallDX, 0.0, 0.0 ), scaleWall);

//var runAnimation = false;

var modelViewLoc;  // uniform location of the modelView matrix

// parameters for viewer position
const initViewerDist  =  4.0;
const minViewerDist   =  2.0;
const maxViewerDist   = 10.0;
const maxOffsetRatio  =  1.0;
const deltaViewerDist =  0.25;
const deltaOffset     =  0.1;
var   eye             = vec3(0.0, 0.0, initViewerDist);
const at              = vec3(0.0, 0.0, 0.0);
const up              = vec3(0.0, 1.0, 0.0);

// Projection transformation parameters
const viewFactor = 1.5;
var   xLeft   = -viewFactor, xRight =  viewFactor,
      yBottom = -viewFactor, yTop   =  viewFactor,
      zNear   =  initViewerDist - viewFactor,
      zFar    =  initViewerDist + viewFactor;

var projectionLoc;  // uniform location of the projection matrix


window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL( canvas );
    if (!gl) { alert("WebGL isn't available"); }


    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 0.9, 0.75, 1.0); // light yellow background

    gl.enable(gl.DEPTH_TEST);

    //  Declare variables for points and colors
    var points = [];
    var colors = [];
    colorCube();

    function colorCube()
    {
        quad( 1, 0, 4, 2 );
        quad( 4, 0, 3, 2 );
        quad( 2, 3, 7, 6 );
        quad( 7, 3, 5, 6 );
        quad( 8, 1, 9, 6 );
        quad( 9, 1, 2, 6 );
        quad(10, 5,13, 0 );
        quad(13, 5, 3, 0 );
        quad( 1, 8,11, 0 );
        quad(11, 8,10, 0 );
        quad( 8, 6,12, 10);
        quad(12, 6, 5, 10);
    }

    function quad(a, b, c, d)
    {
        var vertices = [
            vec4( -1.0, -1.0,  1.0, 1.0 ),//0
            vec4( -1.0,  1.0,  1.0, 1.0 ),//1
            vec4(  1.0,  1.0,  1.0, 1.0 ),//2
            vec4(  1.0, -1.0,  1.0, 1.0 ),//3
            vec4(  0.0,  0.0,  1.8, 1.0 ),//4
            vec4(  1.0, -1.0, -1.0, 1.0 ),//5
            vec4(  1.0,  1.0, -1.0, 1.0 ),//6
            vec4(  1.8,  0.0,  0.0, 1.0 ),//7
            vec4( -1.0,  1.0, -1.0, 1.0 ),//8
            vec4(  0.0,  1.8,  0.0, 1.0 ),//9
            vec4( -1.0, -1.0, -1.0, 1.0 ),//10
            vec4( -1.8,  0.0,  0.0, 1.0 ),//11
            vec4(  0.0,  0.0, -1.8, 1.0 ),//12
            vec4(  0.0, -1.8,  0.0, 1.0 ),//13

        ];

        var vertexColors = [
            [ 0.0, 0.0, 0.0, 1.0 ],  // black
            [ 1.0, 0.0, 0.0, 1.0 ],  // red
            [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
            [ 0.0, 1.0, 0.0, 1.0 ],  // green
            [ 0.0, 0.0, 1.0, 1.0 ],  // blue
            [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
            [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
            [ 1.0, 1.0, 1.0, 1.0 ]   // white
        ];
        var indices = [ a, b, c, a, c, d ];

        for (var i = 0; i < indices.length; ++i) {
            points.push( vertices[indices[i]] );
            //colors.push( vertexColors[indices[i]] );

            // for solid colored faces use
            colors.push(vertexColors[i]);

        }
    }
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

    document.onkeydown = checkKey;
        function checkKey(e) {
    	    e = e || window.event;
          if (e.keyCode == '38') {
               offsetRatio = eye[1] / eye[2];
               if (offsetRatio < maxOffsetRatio) {
      	           offsetRatio += deltaOffset;
      	           eye[1] = eye[2] * offsetRatio;
               }
               requestAnimFrame(render);
          }else if (e.keyCode == '40') {
    		       offsetRatio = eye[1] / eye[2];
    	         if (offsetRatio > -maxOffsetRatio) {
    		          offsetRatio -= deltaOffset;
    		          eye[1] = eye[2] * offsetRatio;
    	         }
    	         requestAnimFrame(render);
    	    }else if (e.keyCode == '37') {
    	         offsetRatio = eye[0] / eye[2];
    	         if (offsetRatio > -maxOffsetRatio) {
    		          offsetRatio -= deltaOffset;
    		          eye[0] = eye[2] * offsetRatio;
    	         }
    	         requestAnimFrame(render);
    	    }else if (e.keyCode == '39') {
    	         offsetRatio = eye[0] / eye[2];
    	         if (offsetRatio < maxOffsetRatio) {
    		           offsetRatio += deltaOffset;
    		           eye[0] = eye[2] * offsetRatio;
    	         }
    	         requestAnimFrame(render);
    	    }
    	  }
        render();
    }

function render()
{
  // clear the window
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // set up projection matrix
  var projection = ortho(xLeft, xRight, yBottom, yTop, zNear, zFar);
  gl.uniformMatrix4fv(projectionLoc, false, flatten(projection));

  // set up view position
  var viewer = lookAt(eye, at, up);

  mv = mult(viewer,
            mult(mult(mult(translate(dx, dy, dz),
                           rotate(theta, 0.0, 1.0, 0.0)),
                      scalem(compressFactor, 1/compressFactor, compressFactor)),
                 scaleBall));
  gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv));
  gl.drawArrays(gl.TRIANGLES, 0, 72);

    requestAnimFrame(render);
  }
