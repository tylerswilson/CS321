// File: matMovingGlobe.js

// Program to draw a rotating ovoid globe revolving around the line z = -x,
// with four pyramids below;
// objects are displayed with varying materials under a single light source.
// Adapted from Angel & Shreiner 2D Sierpinski Gasket, Color Cube programs
// and recursive sphere.
// by J. Andrew Whitford Holey, March 15, 2016


/****************************************************************************
 *
 * GLOBAL VARIABLE DECLARATIONS
 *
 ****************************************************************************/

var canvas;
var gl;


// parameters for creating the globe
const latDivs        = 18;
const longDivs       = 36;
var   numGlobePoints;

// parameters for the globe transformation matrices
const sx = 0.4, sy = 0.2, sz = 0.2; // scale factors
const dx = 0.5, dy = 0.0, dz = 0.0; // translation factors

const xRotateDivs  = 180; // number of positions around the revolution
var   xRotatePos   =   0; // current position around the revolution
                          // (0 ... xRotateDivs - 1)

const revolveDivs  = 540; // number of positions around the revolution
var   revolvePos   =   0; // current position around the revolution
                          // (0 ... revolveDivs - 1)

const obliqueAngle = -60.0;  // degrees

// constant globe matrices
const zRotateScaleAndTranslate =
               mult(mult(translate(dx, dy, dz), scalem(sx, sy, sz)),
                    rotate(90.0, 0.0, 0.0, 1.0));
const obliqueRotate = rotate(obliqueAngle, 0.0, 1.0, 0.0);


// parameters for the pyramids (quad based)
const pyrBaseVerts   = 4;
var   pyrStart;                          // actual value computed in init
var   numPyrPoints   = 6 * pyrBaseVerts; // actual value computed in init
const psx = 0.4, psy =  0.5, psz = 0.4;  // scale factors
const pdx = 0.7, pdy = -0.8, pdz = 0.7;  // translation factors
const pyrScale       = scalem(psx, psy, psz);
const sRepeat        = 6;                // texture horizontal repeat
const tRepeat        = 6;                // texture vertical repeat


// parameters for colors, lighting properties and material properties
const darkGray  = vec4(0.3, 0.3, 0.3, 1.0);
const gray      = vec4(0.6, 0.6, 0.6, 1.0);
const white     = vec4(1.0, 1.0, 1.0, 1.0);
const darkRed   = vec4(0.4, 0.0, 0.0, 1.0);
const red       = vec4(0.9, 0.0, 0.0, 1.0);
const green     = vec4(0.0, 0.8, 0.0, 1.0);
const blue      = vec4(0.1, 0.1, 1.0, 1.0);

const lightAmb  = darkGray;
const lightDiff = white;
const lightSpec = white;
const lightPos  = vec4(-4.0, 2.0, 3.0, 1.0);

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

// uniform material variables
var light_position;
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


// Texture parameters and variables
const texSize     = 256;
var   sandyTexture, brickTexture;
var   sandyTexImg = new Uint8Array(4*texSize*texSize);
var   brickTexImg = new Uint8Array(4*texSize*texSize);
var   isGlobeLoc;

var runAnimation = false;


// Variables for transformation matrix uniform locations
var modelViewLoc;  // uniform location of the modelView matrix
var projectionLoc; // uniform location of the projection matrix
var normalLoc;     // uniform location of the normal matrix

// Declare variables for points, normals, and texture coordinates
var points    = [];
var normals   = [];
var texCoords = [];



/****************************************************************************
 *
 * TEXTURE SET-UP
 *
 ****************************************************************************/

function initSandyTex() {
// Generate a texture of random texel colors in the orange range

  const orange = vec4(255, 95, 0, 255);
  const darkeningFactor = 0.8;
  const darkeningCount  = texSize * texSize * 2;

  // initialize texture to orange
  for (i = 0; i < texSize; i++) {
    for (j = 0; j < texSize; j++) {
      for (k = 0; k < 4; k++) {
        sandyTexImg[4*(i*texSize+j)+k] = orange[k];
      }
    }
  }

  // randomly darken texels
  for (k = 0; k < darkeningCount; k++) {
    var s = Math.floor(Math.random() * texSize);
    var t = Math.floor(Math.random() * texSize);
    sandyTexImg[4*(s*texSize+t)] =
        Math.floor(sandyTexImg[4*(s*texSize+t)] * darkeningFactor);
    sandyTexImg[4*(s*texSize+t)+1] =
        Math.floor(sandyTexImg[4*(s*texSize+t)+1] * darkeningFactor);
  }

}

// Generate a texture of random light gray texel colors in a brick pattern
function initBrickTex() {
  const minVal = 127;
  const maxVal = 256;

  // Generate the gray texels
  for (i = 0; i < texSize; i++) {
    for (j = 0; j < texSize; j++) {
      var randGray = Math.floor(Math.random() * (maxVal - minVal) + minVal);
      for (k = 0; k < 3; k++) {
        brickTexImg[4*(i*texSize+j)+k] = randGray;
      }
      brickTexImg[4*(i*texSize+j)+3] = 255;
    }
  }

  // Darken the rows
  const halfSize = texSize / 2;
  const halfRow  = halfSize / 16;
  for (i = 0; i < halfRow; i++) {
    for (j = 0; j < texSize; j++) {
      brickTexImg[4*(i*texSize+j)]   = brickTexImg[4*(i*texSize+j)] / 2;
      brickTexImg[4*(i*texSize+j)+1] = brickTexImg[4*(i*texSize+j)+1] / 2;
      brickTexImg[4*(i*texSize+j)+2] = brickTexImg[4*(i*texSize+j)+2] / 2;
      brickTexImg[4*((i+halfSize-halfRow)*texSize+j)] =
          brickTexImg[4*((i+halfSize-halfRow)*texSize+j)] / 2;
      brickTexImg[4*((i+halfSize-halfRow)*texSize+j)+1] =
          brickTexImg[4*((i+halfSize-halfRow)*texSize+j)+1] / 2;
      brickTexImg[4*((i+halfSize-halfRow)*texSize+j)+2] =
          brickTexImg[4*((i+halfSize-halfRow)*texSize+j)+2] / 2;
      brickTexImg[4*((i+halfSize)*texSize+j)] =
          brickTexImg[4*((i+halfSize)*texSize+j)] / 2;
      brickTexImg[4*((i+halfSize)*texSize+j)+1] =
          brickTexImg[4*((i+halfSize)*texSize+j)+1] / 2;
      brickTexImg[4*((i+halfSize)*texSize+j)+2] =
          brickTexImg[4*((i+halfSize)*texSize+j)+2] / 2;
      brickTexImg[4*((i+texSize-halfRow)*texSize+j)] =
          brickTexImg[4*((i+texSize-halfRow)*texSize+j)] / 2;
      brickTexImg[4*((i+texSize-halfRow)*texSize+j)+1] =
          brickTexImg[4*((i+texSize-halfRow)*texSize+j)+1] / 2;
      brickTexImg[4*((i+texSize-halfRow)*texSize+j)+2] =
          brickTexImg[4*((i+texSize-halfRow)*texSize+j)+2] / 2;
    }
  }
  // Darken the columns
  for (i = halfRow; i < halfSize - halfRow; i++) {
    for (j = 0; j < halfRow; j++) {
      brickTexImg[4*(i*texSize+j)] =
          brickTexImg[4*(i*texSize+j)] / 3 * 2;
      brickTexImg[4*(i*texSize+j)+1] =
          brickTexImg[4*(i*texSize+j)+1] / 3 * 2;
      brickTexImg[4*(i*texSize+j)+2] =
          brickTexImg[4*(i*texSize+j)+2] / 3 * 2;
      brickTexImg[4*(i*texSize+j+texSize-halfRow)] =
          brickTexImg[4*(i*texSize+j+texSize-halfRow)] / 3 * 2;
      brickTexImg[4*(i*texSize+j+texSize-halfRow)+1] =
          brickTexImg[4*(i*texSize+j+texSize-halfRow)+1] / 3 * 2;
      brickTexImg[4*(i*texSize+j+texSize-halfRow)+2] =
          brickTexImg[4*(i*texSize+j+texSize-halfRow)+2] / 3 * 2;
    }
  }
  for (i = halfSize + halfRow; i < texSize - halfRow; i++) {
    for (j = halfSize - halfRow; j < halfSize + halfRow; j++) {
      brickTexImg[4*(i*texSize+j)] =
          brickTexImg[4*(i*texSize+j)] / 3 * 2;
      brickTexImg[4*(i*texSize+j)+1] =
          brickTexImg[4*(i*texSize+j)+1] / 3 * 2;
      brickTexImg[4*(i*texSize+j)+2] =
          brickTexImg[4*(i*texSize+j)+2] / 3 * 2;
    }
  }

}

/**
 * Configure the two textures used in this program from the
 * texture images sandyTexImg and brickTexImg created elsewhere.
 */
function configureTexture() {
    sandyTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, sandyTexture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize,
                  0, gl.RGBA, gl.UNSIGNED_BYTE, sandyTexImg);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                     gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    brickTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, brickTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize,
                  0, gl.RGBA, gl.UNSIGNED_BYTE, brickTexImg);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                     gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}


/****************************************************************************
 *
 * GLOBE AND PYRAMID SET-UP
 *
 ****************************************************************************/

/**
 * Generates triangles representing a globe divided into latitude
 * and longitude segments;
 * the globe is centered at the origin and its vertices are unit distance
 * from the origin;
 * also computes the normal vectors and assigns texture coordinates.
 *
 * @return -1 if longDivs < 3 or latDivs < 2,
 *         start + 6 * longDivs * (latDivs - 1) otherwise
 */
function initGlobe() {
  if (longDivs < 3 || latDivs < 2) return -1;
  const numVertices  = longDivs * (latDivs + 1);
  const longAngleDiv = 2 * Math.PI / longDivs;
  const latAngleDiv  = Math.PI / latDivs;

  const northPole = vec4(0.0,  1.0, 0.0, 1.0);
  const npNormal  = vec3(0.0,  1.0, 0.0);
  const southPole = vec4(0.0, -1.0, 0.0, 1.0);
  const spNormal  = vec3(0.0, -1.0, 0.0);

  var vertices = new Array(numVertices);
  var normVecs = new Array(numVertices);
  var texVecs  = new Array(numVertices);

  // put pole values in first and last rows
  const lastRow = numVertices - longDivs;
  for (i = 0; i < longDivs; i++) {
    vertices[i]           = northPole;
    normVecs[i]           = npNormal;
    texVecs[i]            = vec2((0.5 + i) / longDivs, 0.0);
    vertices[lastRow + i] = southPole;
    normVecs[lastRow + i] = spNormal;
    texVecs[lastRow + i]  = vec2((0.5 + i) / longDivs, 1.0);
  }

  // generate vertices, normals and texture coordinates in remaining rows
  for (row = 1; row < latDivs; row++) {
    var latAngle = row * latAngleDiv;
    var latCos   = Math.cos(latAngle);
    var latSin   = Math.sin(latAngle);
    for (i = 0; i < longDivs; i++) {
      var longAngle = i * longAngleDiv;
      var longCos   = Math.cos(longAngle);
      var longSin   = Math.sin(longAngle);
      var x = latSin * longCos;
      var y = latCos;
      var z = latSin * longSin;
      vertices[row * longDivs + i] = vec4(x, y, z, 1.0);
      normVecs[row * longDivs + i] = vec3(x, y, z);
      texVecs[row * longDivs + i]  = vec2(i / longDivs, row / latDivs);
    }
  }

  // generate triangles in points
  for (row = 1; row < latDivs; row++) {
    for (i = 0; i < longDivs-1; i++) {
      normals.push(normVecs[row * longDivs + i]);
      texCoords.push(texVecs [row * longDivs + i]);
      points.push(vertices[row * longDivs + i]);
      normals.push(normVecs[(row-1) * longDivs + i]);
      texCoords.push(texVecs [(row-1) * longDivs + i]);
      points.push(vertices[(row-1) * longDivs + i]);
      normals.push(normVecs[row * longDivs + i+1]);
      texCoords.push(texVecs [row * longDivs + i+1]);
      points.push(vertices[row * longDivs + i+1]);
      normals.push(normVecs[row * longDivs + i]);
      texCoords.push(texVecs [row * longDivs + i]);
      points.push(vertices[row * longDivs + i]);
      normals.push(normVecs[row * longDivs + i+1]);
      texCoords.push(texVecs [row * longDivs + i+1]);
      points.push(vertices[row * longDivs + i+1]);
      normals.push(normVecs[(row+1) * longDivs + i+1]);
      texCoords.push(texVecs [(row+1) * longDivs + i+1]);
      points.push(vertices[(row+1) * longDivs + i+1]);
    }
    normals.push(normVecs[(row+1) * longDivs - 1]);
    texCoords.push(texVecs [(row+1) * longDivs - 1]);
    points.push(vertices[(row+1) * longDivs - 1]);
    normals.push(normVecs[row * longDivs - 1]);
    texCoords.push(texVecs [row * longDivs - 1]);
    points.push(vertices[row * longDivs - 1]);
    normals.push(normVecs[row * longDivs]);
    texCoords.push(vec2(1.0, row / latDivs));
    points.push(vertices[row * longDivs]);
    normals.push(normVecs[(row+1) * longDivs - 1]);
    texCoords.push(texVecs [(row+1) * longDivs - 1]);
    points.push(vertices[(row+1) * longDivs - 1]);
    normals.push(normVecs[row * longDivs]);
    texCoords.push(vec2(1.0, row / latDivs));
    points.push(vertices[row * longDivs]);
    normals.push(normVecs[(row+1) * longDivs]);
    texCoords.push(vec2(1.0, (row+1) / latDivs));
    points.push(vertices[(row+1) * longDivs]);
  }

  return 6 * longDivs * (latDivs - 1);
}

/**
 * Returns the vec3 normal vector of the three specified points
 */
function triangleNormal(p1, p2, p3) {
  var v1 = vec3(p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]);
  var v2 = vec3(p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]);
  return normalize(cross(v1, v2));
}

/**
 * Generates triangles representing a pyramid with a 2 X 2 base and height 1,
 * with the base centered on the origin.
 *
 * @return number of points generated
 */
function initPyramid() {
  const numVertices  = 5;
  const numTriangles = 6;
  const numPoints    = numTriangles * 3;
  const numTexCoords = 7;

  const pointIndices = [
    [0, 1, 2],
    [0, 2, 3],
    [0, 3, 4],
    [0, 4, 1],
    [1, 4, 3],
    [1, 3, 2]
  ];

 const texIndices = [
    [0, 1, 2],
    [0, 2, 1],
    [0, 1, 2],
    [0, 2, 1],
    [6, 3, 4],
    [6, 4, 5]
  ];

  var vertices = new Array(numVertices);
  var normVecs = new Array(numTriangles);
  var texVecs  = new Array(numTexCoords);

  vertices[0] = vec4( -1.0, -0.5, -0.5, 1.0),//0
  vertices[1] = vec4( -1.0, -0.5,  0.5, 1.0),//1
  vertices[2] = vec4( -1.0,  0.5,  0.0, 1.0),//2
  vertices[3] = vec4(  1.0,  0.5,  0.0, 1.0),//3
  vertices[4] = vec4(  1.0, -0.5,  0.5, 1.0),//4
  vertices[5] = vec4(  1.0, -0.5, -0.5, 1.0) //5

  normVecs[0] = triangleNormal(vertices[pointIndices[0][0]],
                               vertices[pointIndices[0][1]],
                               vertices[pointIndices[0][2]]);
  normVecs[1] = triangleNormal(vertices[pointIndices[1][0]],
                               vertices[pointIndices[1][1]],
                               vertices[pointIndices[1][2]]);
  normVecs[2] = triangleNormal(vertices[pointIndices[2][0]],
                               vertices[pointIndices[2][1]],
                               vertices[pointIndices[2][2]]);
  normVecs[3] = triangleNormal(vertices[pointIndices[3][0]],
                               vertices[pointIndices[3][1]],
                               vertices[pointIndices[3][2]]);
  normVecs[4] = triangleNormal(vertices[pointIndices[4][0]],
                               vertices[pointIndices[4][1]],
                               vertices[pointIndices[4][2]]);
  normVecs[5] = normVecs[4];

  texVecs[0] = vec2(sRepeat / 2.0, tRepeat); // Apex
  texVecs[1] = vec2(0.0,           0.0);     // Bottom Left
  texVecs[2] = vec2(sRepeat,       0.0);     // Bottom Right
  texVecs[3] = vec2(0.0,           0.0);     // Base 0
  texVecs[4] = vec2(sRepeat,       0.0);     // Base 1
  texVecs[5] = vec2(sRepeat,       tRepeat); // Base 2
  texVecs[6] = vec2(sRepeat,           tRepeat); // Base 3

  // generate triangles in points
  for (i = 0; i < numTriangles; i++) {
    for (j = 0; j < 3; j++) {
      normals.push(normVecs[i]);
      texCoords.push(texVecs[texIndices[i][j]]);
      points.push(vertices[pointIndices[i][j]]);
    }
  }

  return numTriangles * 3;
}


/****************************************************************************
 *
 * INIT FUNCTION
 *
 ****************************************************************************/

window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");
    aspectRatio  =  canvas.width / canvas.height;

    gl = WebGLUtils.setupWebGL( canvas );
    if (!gl) { alert("WebGL isn't available"); }


    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.85, 0.95, 1.0, 1.0); // light cyan background

    gl.enable(gl.DEPTH_TEST);

    // Set up the globe
    numGlobePoints = initGlobe();
    pyrStart       = numGlobePoints;

    initSandyTex();
    initBrickTex();


    // Set up the pyramid
    numPyrPoints   = initPyramid();

    // Initialize textures

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

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    /****** Note the change to 2 for the second parameter ******/
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    // Configure textures and send them to the GPU
    configureTexture();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sandyTexture);
    gl.uniform1i(gl.getUniformLocation(program, "sandyTexture"), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, brickTexture);
    gl.uniform1i(gl.getUniformLocation(program, "brickTexture"), 1);

    //
    modelViewLoc     = gl.getUniformLocation(program, "model_view");
    projectionLoc    = gl.getUniformLocation(program, "projection");
    normalLoc        = gl.getUniformLocation(program, "normal_mat");
    ambient_product  = gl.getUniformLocation(program, "ambient_product");
    diffuse_product  = gl.getUniformLocation(program, "diffuse_product");
    specular_product = gl.getUniformLocation(program, "specular_product");
    shininess        = gl.getUniformLocation(program, "shininess");
    light_position   = gl.getUniformLocation(program, "light_position");
    isGlobeLoc       = gl.getUniformLocation(program, "isGlobe");

    //event listeners for buttons
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


/****************************************************************************
 *
 * RENDER FUNCTION
 *
 ****************************************************************************/

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

  // // Set up globe
  // // set up the rotation matrix
  // var xRotationAngle = xRotatePos * 360.0 / xRotateDivs;
  // var xRotation      = rotate(xRotationAngle, 1.0, 0.0, 0.0);
  //
  // // set up the revolution matrix
  // var revolveAngle     = revolvePos * 360.0 / revolveDivs;
  // var revolutionRotate = rotate(revolveAngle, 0.0, 0.0, 1.0);
  //
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
  // // tell fragment shader it's rendering the globe (1==true)
  // gl.uniform1i(isGlobeLoc, 1);
  //
  // gl.drawArrays(gl.TRIANGLES, 0, numGlobePoints);
  //
  // // tell fragment shader it's rendering the pyramids (0==false)
  // gl.uniform1i(isGlobeLoc, 0);
  //
  // // Set up pyramids
  // // right front pyramid
  // var pyrTranslate = translate(pdx, pdy, pdz);
  // mv = mult(mult(viewer, pyrTranslate),
  //           mult(pyrScale, rotate(225.0, 0.0, 1.0, 0.0)));
  // gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv));
  // normalMat = normalMatrix(mv, true);
  // gl.uniformMatrix3fv(normalLoc, false, flatten(normalMat));
  //
  // // set up pyramid 1 lighting properties
  // gl.uniform4fv(ambient_product,  mult(lightAmb,  pyr1Amb));
  // gl.uniform4fv(diffuse_product,  mult(lightDiff, pyr1Diff));
  // gl.uniform4fv(specular_product, mult(lightSpec, pyr1Spec));
  // gl.uniform1f(shininess, pyr1Shin);
  //
  // gl.drawArrays(gl.TRIANGLES, pyrStart, numPyrPoints);

  // right rear pyramid
  pyrTranslate = translate(pdx, pdy, pdz);
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

  // left front pyramid
  pyrTranslate = translate(-pdx, pdy, pdz);
  mv = mult(mult(viewer, pyrTranslate),
            mult(pyrScale, rotate(225.0, 0.0, 1.0, 0.0)));
  gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv));
  normalMat = normalMatrix(mv, true);
  gl.uniformMatrix3fv(normalLoc, false, flatten(normalMat));

  // set up pyramid 3 lighting properties
  gl.uniform4fv(ambient_product,  mult(lightAmb,  pyr3Amb));
  gl.uniform4fv(diffuse_product,  mult(lightDiff, pyr3Diff));
  gl.uniform4fv(specular_product, mult(lightSpec, pyr3Spec));
  gl.uniform1f(shininess, pyr3Shin);

  gl.drawArrays(gl.TRIANGLES, pyrStart, numPyrPoints);


    requestAnimFrame(render);


}
