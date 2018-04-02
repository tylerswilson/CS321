// Program to draw two tetrahedrons with two light sources
// Adapted from Angel & Shreiner 2D Sierpinski Gasket, Color Cube programs
// and recursive sphere and J. Whitford Holey's MatmovingGlobe program.
// by Tyler Wilson 2018

var canvas;
var gl;

// parameters for creating the globe
const divs          =  8; // number of recursive divisions
var   numBallPoints = 24; // actual value computed in init

// parameters for the globe transformation matrices
const sx = 0.4, sy = 0.2, sz = 0.2; // scale factors
const dx = 0.5, dy = 0.0, dz = 0.0; // translation factors

const xRotateDivs  = 180; // number of positions around the rotation
var   xRotatePos   =   0; // current position around the rotation
                          // (0 ... xRotateDivs - 1)

const revolveDivs  = 540; // number of positions around the revolution
var   revolvePos   =   0; // current position around the revolution
                          // (0 ... revolveDivs - 1)

const obliqueAngle = -45.0;  // degrees

// constant globe matrices
const zRotateScaleAndTranslate =
               mult(mult(translate(dx, dy, dz), scalem(sx, sy, sz)),
                    rotate(90.0, 0.0, 0.0, 1.0));
const obliqueRotate = rotate(obliqueAngle, 0.0, 1.0, 0.0);

// parameters for the pyramids (quad based)
const pyrBaseVerts   = 4;
var   pyrStart       = numBallPoints;    // actual value computed in init
var   numPyrPoints   = 6 * pyrBaseVerts; // actual value computed in init
const psx = 0.4, psy =  0.5, psz = 0.4;  // scale factors
const pdx = 0.7, pdy = -0.8, pdz = 0.7;  // translation factors
const pyrScale       = scalem(psx, psy, psz);

// parameters for colors, lighting properties and material properties
const darkGray  = vec4(0.3, 0.3, 0.3, 1.0);
const gray      = vec4(0.6, 0.6, 0.6, 1.0);
const white     = vec4(1.0, 1.0, 1.0, 1.0);
const darkRed   = vec4(0.4, 0.0, 0.1, 1.0);
const red       = vec4(0.9, 0.1, 0.0, 1.0);
const green     = vec4(0.0, 0.8, 0.0, 1.0);
const blue      = vec4(0.1, 0.1, 1.0, 1.0);

const lightAmb  = darkGray;
const lightDiff = white;
const lightSpec = white;
const lightPos  = vec4(4.0, 2.0, 3.0, 1.0);
const lightPos2 = vec4(-2.0,2.0, 3.0, 1.0);

const globeAmb  = gray;
const globeDiff = gray;
const globeSpec = white;
const globeShin = 300.0;

const pyr1Amb   = red;
const pyr1Diff  = red;
const pyr1Spec  = white;
const pyr1Shin  = 150.0;

const pyr2Amb   = green;
const pyr2Diff  = green;
const pyr2Spec  = white;
const pyr2Shin  =  50.0;

const pyr3Amb   = blue;
const pyr3Diff  = blue;
const pyr3Spec  = white;
const pyr3Shin  = 150.0;

const pyr4Amb   = darkRed;
const pyr4Diff  = darkRed;
const pyr4Spec  = red;
const pyr4Shin  =  50.0;

// uniform variables
var light_position;
//var light_position2;
var ambient_product;
var diffuse_product;
var specular_product;
var shininess;

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
var   fieldOfViewY = 40.0,
      aspectRatio  =  1.0, // actual value set in init
      zNear        =  1.0,
      zFar         = 20.0;

var runAnimation = false;

var modelViewLoc;  // uniform location of the modelView matrix
var projectionLoc; // uniform location of the projection matrix
var normalLoc;     // uniform location of the normal matrix


window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");
    aspectRatio  =  canvas.width / canvas.height;

    gl = WebGLUtils.setupWebGL( canvas );
    if (!gl) { alert("WebGL isn't available"); }


    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.85, 0.95, 1.0, 1.0); // light cyan background

    gl.enable(gl.DEPTH_TEST);

    // Declare variables for points and normals
    var points  = [];
    var normals = [];

    // Set up the globe
    numBallPoints    = spherichedron(divs, points);
    pyrStart         = numBallPoints;
    // Compute the globe normals for smooth shading
    for (i = 0; i < numBallPoints; i++) {
      var nextNormal = vec3();
      for (j = 0; j < 3; j++) {
        nextNormal[j] = points[i][j];
      }
      normals.push(nextNormal);
    }
    //colorCube();
    // Set up the pyramid
    numPyrPoints = normalPyramid(points, normals);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    /****** Note the change to 3 for the second parameter ******/
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    var pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewLoc     = gl.getUniformLocation(program, "model_view");
    projectionLoc    = gl.getUniformLocation(program, "projection");
    normalLoc        = gl.getUniformLocation(program, "normal_mat");
    ambient_product  = gl.getUniformLocation(program, "ambient_product");
    diffuse_product  = gl.getUniformLocation(program, "diffuse_product");
    specular_product = gl.getUniformLocation(program, "specular_product");
    shininess        = gl.getUniformLocation(program, "shininess");
    light_position   = gl.getUniformLocation(program, "light_position");
    light_position2   = gl.getUniformLocation(program, "light_position2");


    var offsetRatio;
    document.getElementById("leftButton").onclick = function () {
      offsetRatio = eye[0] / eye[2];
      if (offsetRatio > -maxOffsetRatio) {
        offsetRatio -= deltaOffset;
        eye[0] = eye[2] * offsetRatio;
      }
      if (!runAnimation) requestAnimFrame(render);
    };
    document.getElementById("rightButton").onclick = function () {
      offsetRatio = eye[0] / eye[2];
      if (offsetRatio < maxOffsetRatio) {
        offsetRatio += deltaOffset;
        eye[0] = eye[2] * offsetRatio;
      }
      if (!runAnimation) requestAnimFrame(render);
    };
    document.getElementById("downButton").onclick = function () {
      offsetRatio = eye[1] / eye[2];
      if (offsetRatio > -maxOffsetRatio) {
        offsetRatio -= deltaOffset;
        eye[1] = eye[2] * offsetRatio;
      }
      if (!runAnimation) requestAnimFrame(render);
    };
    document.getElementById("upButton").onclick = function () {
      offsetRatio = eye[1] / eye[2];
      if (offsetRatio < maxOffsetRatio) {
        offsetRatio += deltaOffset;
        eye[1] = eye[2] * offsetRatio;
      }
      if (!runAnimation) requestAnimFrame(render);
    };
    document.getElementById("inButton").onclick = function () {
      if (eye[2] > minViewerDist) {
        eye[2] -= deltaViewerDist;
        offsetRatio = eye[2] / (eye[2] + deltaViewerDist);
        eye[0] *= offsetRatio;
        eye[1] *= offsetRatio;
      }
      if (!runAnimation) requestAnimFrame(render);
    };
    document.getElementById("outButton").onclick = function () {
      if (eye[2] < maxViewerDist) {
        eye[2] += deltaViewerDist;
        offsetRatio = eye[2] / (eye[2] - deltaViewerDist);
        eye[0] *= offsetRatio;
        eye[1] *= offsetRatio;
      }
      if (!runAnimation) requestAnimFrame(render);
    };

    render();
}

function normalPyramid(points, normals) {
  var verts = [
    vec4( -1.0, -0.5, -0.5, 1.0),//0
    vec4( -1.0, -0.5,  0.5, 1.0),//1
    vec4( -1.0,  0.5,  0.0, 1.0),//2
    vec4(  1.0,  0.5,  0.0, 1.0),//3
    vec4(  1.0, -0.5,  0.5, 1.0),//4
    vec4(  1.0, -0.5, -0.5, 1.0) //5
  ];

  var faces = [
    [1, 0, 2],//left
    [1, 3, 2],//front
    [3, 1, 4],//front
    [2, 3, 5],//back
    [5, 0, 2],//back
    [3, 4, 5],//right
    [1, 5, 4],//bottom
    [1, 0, 5] //bottom
  ];

  var quasiNorms = [
    vec3(-1.0, 0.0, 0.0),  // 0 - left
    vec3(-1.0, 1.0, 1.0), // 1 - front left
    vec3( 1.0, 1.0, 1.0),  // 2 - front right
    vec3(-1.0, 1.0,-1.0),   // 3 - back left
    vec3(1.0,  1.0, -1.0),  // 4 - back right
    vec3(1.0,   0.0, 0.0),  // 5 - right
    vec3(-1.0, -1.0, 0.0),  // 5 - bottom left
    vec3( 1.0, -1.0, 0.0) //  7 -  bottom right
  ];

  for (i = 0; i < 8; i++) {
    var faceNorm = normalize(quasiNorms[i]);
    for (j = 0; j < 3; j++) {
      points.push(verts[faces[i][j]]);
      normals.push(faceNorm);
    }
  }
  return 24;
}

function render()
{
  // clear the window
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // set up projection matrix
  var projection = perspective(fieldOfViewY, aspectRatio, zNear, zFar);
  gl.uniformMatrix4fv(projectionLoc, false, flatten(projection));

  // set up view position
  var viewer = lookAt(eye, at, up);

  // set up light position
  var newLightPos = vec4();
  for (i = 0; i < 4; i++) {
    newLightPos[i] = dot(viewer[i], lightPos);
  }
  gl.uniform4fv(light_position, newLightPos);

  newLightPos = vec4();
  for (i = 0; i < 4; i++) {
    newLightPos[i] = dot(viewer[i], lightPos2);
  }
  gl.uniform4fv(light_position2, newLightPos);
  // Set up globe
  // set up the rotation matrix
  var xRotationAngle = xRotatePos * 360.0 / xRotateDivs;
  var xRotation      = rotate(xRotationAngle, 1.0, 0.0, 0.0);

  // set up the revolution matrix
  var revolveAngle     = revolvePos * 360.0 / revolveDivs;
  var revolutionRotate = rotate(revolveAngle, 0.0, 0.0, 1.0);

  // // set up the globe model_view matrix
  // var mv = mult(mult(mult(viewer, obliqueRotate), revolutionRotate),
  //               mult(xRotation, zRotateScaleAndTranslate));
  // gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv));
  // var normalMat = normalMatrix(mv, true); // true makes it return 3 X 3
  // gl.uniformMatrix3fv(normalLoc, false, flatten(normalMat));
  //
  // // set up globe lighting properties
  // gl.uniform4fv(ambient_product,  mult(lightAmb,  globeAmb));
  // gl.uniform4fv(diffuse_product,  mult(lightDiff, globeDiff));
  // gl.uniform4fv(specular_product, mult(lightSpec, globeSpec));
  // gl.uniform1f(shininess, globeShin);
  //
  // gl.drawArrays(gl.TRIANGLES, 0, numBallPoints);

  // Set up pyramids
  // right front pyramid
  var pyrTranslate = translate(pdx, pdy, pdz);
  mv = mult(mult(viewer, pyrTranslate),
            mult(pyrScale, rotate(225.0, 0.0, 1.0, 0.0)));
  gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv));
  normalMat = normalMatrix(mv, true);
  gl.uniformMatrix3fv(normalLoc, false, flatten(normalMat));

  // set up pyramid 1 lighting properties
  gl.uniform4fv(ambient_product,  mult(lightAmb,  pyr1Amb));
  gl.uniform4fv(diffuse_product,  mult(lightDiff, pyr1Diff));
  gl.uniform4fv(specular_product, mult(lightSpec, pyr1Spec));
  gl.uniform1f(shininess, pyr1Shin);

  gl.drawArrays(gl.TRIANGLES, pyrStart, numPyrPoints);
  //
  // right rear pyramid
  pyrTranslate = translate(pdx, pdy, -pdz);
  mv = mult(mult(viewer, pyrTranslate),
            mult(pyrScale, rotate(225.0, 0.0, 1.0, 0.0)));
  gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv));
  normalMat = normalMatrix(mv, true); // true makes it return 3 X 3
  gl.uniformMatrix3fv(normalLoc, false, flatten(normalMat));

  // set up pyramid 2 lighting properties
  gl.uniform4fv(ambient_product,  mult(lightAmb,  pyr2Amb));
  gl.uniform4fv(diffuse_product,  mult(lightDiff, pyr2Diff));
  gl.uniform4fv(specular_product, mult(lightSpec, pyr2Spec));
  gl.uniform1f(shininess, pyr4Shin);

  gl.drawArrays(gl.TRIANGLES, pyrStart, numPyrPoints);

  // // left front pyramid
  // pyrTranslate = translate(-pdx, pdy, pdz);
  // mv = mult(mult(viewer, pyrTranslate),
  //           mult(pyrScale, rotate(225.0, 0.0, 1.0, 0.0)));
  // gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv));
  // normalMat = normalMatrix(mv, true);
  // gl.uniformMatrix3fv(normalLoc, false, flatten(normalMat));
  //
  // // set up pyramid 3 lighting properties
  // gl.uniform4fv(ambient_product,  mult(lightAmb,  pyr3Amb));
  // gl.uniform4fv(diffuse_product,  mult(lightDiff, pyr3Diff));
  // gl.uniform4fv(specular_product, mult(lightSpec, pyr3Spec));
  // gl.uniform1f(shininess, pyr3Shin);
  //
  // gl.drawArrays(gl.TRIANGLES, pyrStart, numPyrPoints);
  //
  // // left rear pyramid
  // pyrTranslate = translate(-pdx, pdy, -pdz);
  // mv = mult(mult(viewer, pyrTranslate),
  //           mult(pyrScale, rotate(225.0, 0.0, 1.0, 0.0)));
  // gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv));
  // normalMat = normalMatrix(mv, true);
  // gl.uniformMatrix3fv(normalLoc, false, flatten(normalMat));
  //
  // // set up pyramid 4 lighting properties
  // gl.uniform4fv(ambient_product,  mult(lightAmb,  pyr4Amb));
  // gl.uniform4fv(diffuse_product,  mult(lightDiff, pyr4Diff));
  // gl.uniform4fv(specular_product, mult(lightSpec, pyr4Spec));
  // gl.uniform1f(shininess, pyr4Shin);
  //
  // gl.drawArrays(gl.TRIANGLES, pyrStart, numPyrPoints);

    requestAnimFrame(render);

}
