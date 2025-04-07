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

precision lowp float;

in vec2 vTexCoord;
uniform int uNumMasks;
uniform vec3 uBgColor;
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
  vec4 finalColor = vec4(0.0f, 0.0f, 0.0f, 0.0f);
  float totalMaskValue = 0.0f;

  if(uNumMasks > 0) {
    float maskValue0 = texture(uMaskTexture0, vec2(vTexCoord.y, vTexCoord.x)).r;
    totalMaskValue += maskValue0;
  }
  if(uNumMasks > 1) {
    float maskValue1 = texture(uMaskTexture1, vec2(vTexCoord.y, vTexCoord.x)).r;
    totalMaskValue += maskValue1;
  }
  if(uNumMasks > 2) {
    float maskValue2 = texture(uMaskTexture2, vec2(vTexCoord.y, vTexCoord.x)).r;
    totalMaskValue += maskValue2;
  }
  if(uNumMasks > 3) {
    float maskValue3 = texture(uMaskTexture3, vec2(vTexCoord.y, vTexCoord.x)).r;
    totalMaskValue += maskValue3;
  }
  if(uNumMasks > 4) {
    float maskValue4 = texture(uMaskTexture4, vec2(vTexCoord.y, vTexCoord.x)).r;
    totalMaskValue += maskValue4;
  }
  if(uNumMasks > 5) {
    float maskValue5 = texture(uMaskTexture5, vec2(vTexCoord.y, vTexCoord.x)).r;
    totalMaskValue += maskValue5;
  }
  if(uNumMasks > 6) {
    float maskValue6 = texture(uMaskTexture6, vec2(vTexCoord.y, vTexCoord.x)).r;
    totalMaskValue += maskValue6;
  }
  if(uNumMasks > 7) {
    float maskValue7 = texture(uMaskTexture7, vec2(vTexCoord.y, vTexCoord.x)).r;
    totalMaskValue += maskValue7;
  }
  if(uNumMasks > 8) {
    float maskValue8 = texture(uMaskTexture8, vec2(vTexCoord.y, vTexCoord.x)).r;
    totalMaskValue += maskValue8;
  }

  if(totalMaskValue > 0.0f) {
    finalColor = vec4(uBgColor, 1.0f);
  } else {
    finalColor.a = 0.0f;
  }
  fragColor = finalColor;
}