#version 300 es
// Copyright (c) Meta Platforms, Inc. and affiliates.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

precision mediump float;

in vec2 vTexCoord;

uniform sampler2D uSampler;
uniform vec2 uSize;
uniform int uNumMasks;
uniform float uCurrentFrame;
uniform bool uLineColor;
uniform bool uArrow;
uniform sampler2D uMaskTexture0;
uniform sampler2D uMaskTexture1;
uniform sampler2D uMaskTexture2;
uniform sampler2D uMaskTexture3;
uniform sampler2D uMaskTexture4;
uniform sampler2D uMaskTexture5;
uniform sampler2D uMaskTexture6;
uniform sampler2D uMaskTexture7;
uniform sampler2D uMaskTexture8;

uniform vec4 bbox0;
uniform vec4 bbox1;
uniform vec4 bbox2;
uniform vec4 bbox3;
uniform vec4 bbox4;
uniform vec4 bbox5;
uniform vec4 bbox6;
uniform vec4 bbox7;
uniform vec4 bbox8;

out vec4 fragColor;

float addv(vec2 a) {
  return a.x + a.y;
}

#define dd(a) dot(a,a)

vec2 solveCubic2(vec3 a) {
  float p = a.y - a.x * a.x / 3.0f;
  float p3 = p * p * p;
  float q = a.x * (2.0f * a.x * a.x - 9.0f * a.y) / 27.0f + a.z;
  float d = q * q + 4.0f * p3 / 27.0f;
  if(d > 0.0f) {
    vec2 x = (vec2(1.0f, -1.0f) * sqrt(d) - q) * 0.5f;
    return vec2(addv(sign(x) * pow(abs(x), vec2(1.0f / 3.0f))) - a.x / 3.0f);
  }
  float v = acos(-sqrt(-27.0f / p3) * q * 0.5f) / 3.0f;
  float m = cos(v);
  float n = sin(v) * 1.732050808f;
  return vec2(m + m, -n - m) * sqrt(-p / 3.0f) - a.x / 3.0f;
}

float calculateDistanceToQuadraticBezier(vec2 p, vec2 a, vec2 b, vec2 c) {
  b += mix(vec2(1e-4f), vec2(0.0f), abs(sign(b * 2.0f - a - c)));
  vec2 A = b - a;
  vec2 B = c - b - A;
  vec2 C = p - a;
  vec2 D = A * 2.0f;
  vec2 T = clamp((solveCubic2(vec3(-3.0f * dot(A, B), dot(C, B) - 2.0f * dd(A), dot(C, A)) / -dd(B))), 0.0f, 1.0f);
  return sqrt(min(dd(C - (D + B * T.x) * T.x), dd(C - (D + B * T.y) * T.y)));
}

float crossProduct(vec2 a, vec2 b) {
  return a.x * b.y - a.y * b.x;
}

bool pointInTriangle(vec2 pt, vec2 v0, vec2 v1, vec2 v2) {
  vec2 v0v1 = v1 - v0;
  vec2 v1v2 = v2 - v1;
  vec2 v2v0 = v0 - v2;
  float d0 = sign(crossProduct(v0v1, pt - v0));
  float d1 = sign(crossProduct(v1v2, pt - v1));
  float d2 = sign(crossProduct(v2v0, pt - v2));
  bool has_neg = (d0 < 0.0f) || (d1 < 0.0f) || (d2 < 0.0f);
  bool has_pos = (d0 > 0.0f) || (d1 > 0.0f) || (d2 > 0.0f);
  return !(has_neg && has_pos);
}

void main() {
  vec4 color = texture(uSampler, vTexCoord);
  vec2 fragCoord = vTexCoord * uSize;
  float aspectRatio = uSize.y / uSize.x;
  float time = uCurrentFrame * 0.05f;
  vec3 multicolor = vec3(0.5f + 0.5f * sin(time), 0.5f + 0.5f * cos(time), 0.5f - 0.5f * sin(time));

  vec4 masks[9];
  for(int i = 0; i < 9; i++) {
    masks[i] = vec4(0.0f);
  }

  bool scoped = false;
  bool intersected = false;
  float threshold = 0.75f;
  float circleRadius = 0.015f;

  // 處理多達9個遮罩
  if(uNumMasks > 0) {
    masks[0] = texture(uMaskTexture0, vec2(vTexCoord.y, vTexCoord.x));
    bool visible = bbox0 != vec4(0.0f);

    vec2 p0 = vec2((bbox0.x + bbox0.z) * 0.5f, bbox0.y); // Top center
    vec2 p1 = vec2(bbox0.x + 0.5f * (bbox0.z - bbox0.x) * (0.5f + 0.5f * sin(time)), bbox0.y - 0.25f);
    //vec2 p1 = vec2(0.5f, 0.5f);
    vec2 p2 = vec2(bbox0.x + 0.5f * (bbox0.z - bbox0.x) * (0.5f + 0.5f * cos(time)), (bbox0.w + bbox0.y) * 0.5f);
    float d = calculateDistanceToQuadraticBezier(vTexCoord, p0, p1, p2);
    d *= length(uSize.xy) * 0.25f;

    vec2 v0 = p0 + vec2(-0.020f, -0.020f); // Left vertex
    vec2 v1 = p0 + vec2(0.020f, -0.020f);  // Right vertex
    vec2 v2 = p0 + vec2(0.0f, 0.020f);  // Bottom vertex
    // Check if the point is inside the triangle
    bool inside = pointInTriangle(vTexCoord, v0, v1, v2);

    // Circle drawing
    vec2 adjustedCoord = vTexCoord - p0;
    adjustedCoord.x /= aspectRatio;
    float circleDistance = length(adjustedCoord);

    if(d < threshold && visible) {
      scoped = true;
    }

    if(uArrow && inside && visible) {
      intersected = true;
    } else if(!uArrow && circleDistance < circleRadius && visible) {
      intersected = true;
    }
  }

  // 添加額外的遮罩處理
  if(uNumMasks > 1) {
    masks[1] = texture(uMaskTexture1, vec2(vTexCoord.y, vTexCoord.x));
    bool visible = bbox1 != vec4(0.0f);

    vec2 p0 = vec2((bbox1.x + bbox1.z) * 0.5f, bbox1.y);
    vec2 p1 = vec2(bbox1.x + 0.5f * (bbox1.z - bbox1.x) * (0.5f + 0.5f * sin(time)), bbox1.y - 0.25f);
    vec2 p2 = vec2(bbox1.x + 0.5f * (bbox1.z - bbox1.x) * (0.5f + 0.5f * cos(time)), (bbox1.w + bbox1.y) * 0.5f);
    float d = calculateDistanceToQuadraticBezier(vTexCoord, p0, p1, p2);
    d *= length(uSize.xy) * 0.25f;

    vec2 v0 = p0 + vec2(-0.020f, -0.020f);
    vec2 v1 = p0 + vec2(0.020f, -0.020f);
    vec2 v2 = p0 + vec2(0.0f, 0.020f);
    bool inside = pointInTriangle(vTexCoord, v0, v1, v2);

    // Circle drawing
    vec2 adjustedCoord = vTexCoord - p0;
    adjustedCoord.x /= aspectRatio;
    float circleDistance = length(adjustedCoord);

    if(d < threshold && visible) {
      scoped = true;
    }

    if(uArrow && inside && visible) {
      intersected = true;
    } else if(!uArrow && circleDistance < circleRadius && visible) {
      intersected = true;
    }
  }

  if(uNumMasks > 2) {
    masks[2] = texture(uMaskTexture2, vec2(vTexCoord.y, vTexCoord.x));
    bool visible = bbox2 != vec4(0.0f);

    vec2 p0 = vec2((bbox2.x + bbox2.z) * 0.5f, bbox2.y);
    vec2 p1 = vec2(bbox2.x + 0.5f * (bbox2.z - bbox2.x) * (0.5f + 0.5f * sin(time)), bbox2.y - 0.25f);
    vec2 p2 = vec2(bbox2.x + 0.5f * (bbox2.z - bbox2.x) * (0.5f + 0.5f * cos(time)), (bbox2.w + bbox2.y) * 0.5f);
    float d = calculateDistanceToQuadraticBezier(vTexCoord, p0, p1, p2);
    d *= length(uSize.xy) * 0.25f;

    vec2 v0 = p0 + vec2(-0.020f, -0.020f);
    vec2 v1 = p0 + vec2(0.020f, -0.020f);
    vec2 v2 = p0 + vec2(0.0f, 0.020f);
    bool inside = pointInTriangle(vTexCoord, v0, v1, v2);

    vec2 adjustedCoord = vTexCoord - p0;
    adjustedCoord.x /= aspectRatio;
    float circleDistance = length(adjustedCoord);

    if(d < threshold && visible) {
      scoped = true;
    }

    if(uArrow && inside && visible) {
      intersected = true;
    } else if(!uArrow && circleDistance < circleRadius && visible) {
      intersected = true;
    }
  }

  // 遮罩3
  if(uNumMasks > 3) {
    masks[3] = texture(uMaskTexture3, vec2(vTexCoord.y, vTexCoord.x));
    bool visible = bbox3 != vec4(0.0f);

    vec2 p0 = vec2((bbox3.x + bbox3.z) * 0.5f, bbox3.y);
    vec2 p1 = vec2(bbox3.x + 0.5f * (bbox3.z - bbox3.x) * (0.5f + 0.5f * sin(time)), bbox3.y - 0.25f);
    vec2 p2 = vec2(bbox3.x + 0.5f * (bbox3.z - bbox3.x) * (0.5f + 0.5f * cos(time)), (bbox3.w + bbox3.y) * 0.5f);
    float d = calculateDistanceToQuadraticBezier(vTexCoord, p0, p1, p2);
    d *= length(uSize.xy) * 0.25f;

    vec2 v0 = p0 + vec2(-0.020f, -0.020f);
    vec2 v1 = p0 + vec2(0.020f, -0.020f);
    vec2 v2 = p0 + vec2(0.0f, 0.020f);
    bool inside = pointInTriangle(vTexCoord, v0, v1, v2);

    vec2 adjustedCoord = vTexCoord - p0;
    adjustedCoord.x /= aspectRatio;
    float circleDistance = length(adjustedCoord);

    if(d < threshold && visible) {
      scoped = true;
    }

    if(uArrow && inside && visible) {
      intersected = true;
    } else if(!uArrow && circleDistance < circleRadius && visible) {
      intersected = true;
    }
  }

  // 遮罩4-8 處理方式相同，為簡潔起見略去重複代碼
  for(int i = 4; i < 9; i++) {
    if(uNumMasks > i) {
      if(i == 4) masks[i] = texture(uMaskTexture4, vec2(vTexCoord.y, vTexCoord.x));
      else if(i == 5) masks[i] = texture(uMaskTexture5, vec2(vTexCoord.y, vTexCoord.x));
      else if(i == 6) masks[i] = texture(uMaskTexture6, vec2(vTexCoord.y, vTexCoord.x));
      else if(i == 7) masks[i] = texture(uMaskTexture7, vec2(vTexCoord.y, vTexCoord.x));
      else if(i == 8) masks[i] = texture(uMaskTexture8, vec2(vTexCoord.y, vTexCoord.x));
      
      vec4 bboxI;
      if(i == 4) bboxI = bbox4;
      else if(i == 5) bboxI = bbox5;
      else if(i == 6) bboxI = bbox6;
      else if(i == 7) bboxI = bbox7;
      else if(i == 8) bboxI = bbox8;
      
      bool visible = bboxI != vec4(0.0f);
      
      if(visible) {
        vec2 p0 = vec2((bboxI.x + bboxI.z) * 0.5f, bboxI.y);
        vec2 p1 = vec2(bboxI.x + 0.5f * (bboxI.z - bboxI.x) * (0.5f + 0.5f * sin(time)), bboxI.y - 0.25f);
        vec2 p2 = vec2(bboxI.x + 0.5f * (bboxI.z - bboxI.x) * (0.5f + 0.5f * cos(time)), (bboxI.w + bboxI.y) * 0.5f);
        float d = calculateDistanceToQuadraticBezier(vTexCoord, p0, p1, p2);
        d *= length(uSize.xy) * 0.25f;

        vec2 v0 = p0 + vec2(-0.020f, -0.020f);
        vec2 v1 = p0 + vec2(0.020f, -0.020f);
        vec2 v2 = p0 + vec2(0.0f, 0.020f);
        bool inside = pointInTriangle(vTexCoord, v0, v1, v2);

        vec2 adjustedCoord = vTexCoord - p0;
        adjustedCoord.x /= aspectRatio;
        float circleDistance = length(adjustedCoord);

        if(d < threshold) {
          scoped = true;
        }

        if(uArrow && inside) {
          intersected = true;
        } else if(!uArrow && circleDistance < circleRadius) {
          intersected = true;
        }
      }
    }
  }

  if(overlap) {
    fragColor = color;
  }

  if(scoped || intersected) {
    fragColor = uLineColor ? vec4(multicolor, 1.0f) : vec4(1.0f);
    if(intersected) {
      fragColor = vec4(multicolor, 1.0f);
    }
  } else {
    fragColor = overlap ? color : vec4(0.0f, 0.0f, 0.0f, 0.0f);
  }
}