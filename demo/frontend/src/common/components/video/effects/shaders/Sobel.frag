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
uniform bool uSwapColor;
uniform bool uMonocolor;
uniform int uNumMasks;
uniform sampler2D uMaskTexture0;
uniform sampler2D uMaskTexture1;
uniform sampler2D uMaskTexture2;
uniform sampler2D uMaskTexture3;
uniform sampler2D uMaskTexture4;
uniform sampler2D uMaskTexture5;
uniform sampler2D uMaskTexture6;
uniform sampler2D uMaskTexture7;
uniform sampler2D uMaskTexture8;

out vec4 fragColor;

void main() {
  // 檢查是否有遮罩需要套用
  vec4 masks[9];
  bool hasMasks = false;
  
  if (uNumMasks > 0) {
    hasMasks = true;
    if (uNumMasks > 0) masks[0] = texture(uMaskTexture0, vec2(vTexCoord.y, vTexCoord.x));
    if (uNumMasks > 1) masks[1] = texture(uMaskTexture1, vec2(vTexCoord.y, vTexCoord.x));
    if (uNumMasks > 2) masks[2] = texture(uMaskTexture2, vec2(vTexCoord.y, vTexCoord.x));
    if (uNumMasks > 3) masks[3] = texture(uMaskTexture3, vec2(vTexCoord.y, vTexCoord.x));
    if (uNumMasks > 4) masks[4] = texture(uMaskTexture4, vec2(vTexCoord.y, vTexCoord.x));
    if (uNumMasks > 5) masks[5] = texture(uMaskTexture5, vec2(vTexCoord.y, vTexCoord.x));
    if (uNumMasks > 6) masks[6] = texture(uMaskTexture6, vec2(vTexCoord.y, vTexCoord.x));
    if (uNumMasks > 7) masks[7] = texture(uMaskTexture7, vec2(vTexCoord.y, vTexCoord.x));
    if (uNumMasks > 8) masks[8] = texture(uMaskTexture8, vec2(vTexCoord.y, vTexCoord.x));
  }
  
  // calculate the offset for one pixel in texture coordinates
  vec2 texOffset = 1.0f / uSize;
  vec3 result = vec3(0.0f);
  // neighboring pixels
  vec3 tLeft = texture(uSampler, vTexCoord + texOffset * vec2(-1, 1)).rgb;
  vec3 tRight = texture(uSampler, vTexCoord + texOffset * vec2(1, -1)).rgb;
  vec3 bLeft = texture(uSampler, vTexCoord + texOffset * vec2(-1, -1)).rgb;
  vec3 bRight = texture(uSampler, vTexCoord + texOffset * vec2(1, 1)).rgb;
  
  // calculate the gradient edge of the current pixel using [3x3] sobel operator.
  vec3 xEdge = tLeft + 2.0f * texture(uSampler, vTexCoord + texOffset * vec2(-1, 0)).rgb + bLeft - tRight - 2.0f * texture(uSampler, vTexCoord + texOffset * vec2(1, 0)).rgb - bRight;
  vec3 yEdge = tLeft + 2.0f * texture(uSampler, vTexCoord + texOffset * vec2(0, 1)).rgb + tRight - bLeft - 2.0f * texture(uSampler, vTexCoord + texOffset * vec2(0, -1)).rgb - bRight;

  // magnitude of the gradient at the current pixel.
  result = sqrt(xEdge * xEdge + yEdge * yEdge);
  
  // 檢查是否有任何遮罩
  bool overlap = false;
  if (hasMasks) {
    for (int i = 0; i < 9 && i < uNumMasks; i++) {
      if (masks[i].r > 0.0f) {
        overlap = true;
        break;
      }
    }
  }
  
  // 套用Sobel效果
  if (uMonocolor) {
    // Convert result to a grayscale intensity
    float intensity = length(result) / sqrt(3.0);
    // Threshold to determine if the color should be white or black
    float threshold = 0.2;
    if (intensity > threshold) {
      fragColor = uSwapColor ? vec4(1.0) : vec4(0.0, 0.0, 0.0, 1.0);
    } else {
      fragColor = uSwapColor ? vec4(0.0, 0.0, 0.0, 1.0) : vec4(1.0);
    }
  } else {
    result = uSwapColor ? result : vec3(0.0, 1.0, 0.0) * result;
    fragColor = vec4(result, 1.0f);
  }
  
  // 如果沒有遮罩重疊，並且我們有遮罩，則透明
  if (hasMasks && !overlap) {
    fragColor = vec4(0.0);
  }
}