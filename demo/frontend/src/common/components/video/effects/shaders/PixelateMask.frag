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
uniform mediump vec2 uSize;
uniform lowp float uBlockSize;
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
  vec4 color = texture(uSampler, vTexCoord);
  vec2 uv = vTexCoord.xy;
  float dx = uBlockSize / uSize.x;
  float dy = uBlockSize / uSize.y;

  

  vec2 sampleCoord = (vec2(dx * floor((uv.x / dx)), dy * floor((uv.y / dy))) +
  vec2(dx * ceil((uv.x / dx)), dy * ceil((uv.y / dy)))) / 2.0f;
  vec4 frameColor = texture(uSampler, sampleCoord);
  color = frameColor;

  // 為每個遮罩獲取適當的紋理
  if(uNumMasks > 0) masks[0] = texture(uMaskTexture0, vec2(vTexCoord.y, vTexCoord.x));
  if(uNumMasks > 1) masks[1] = texture(uMaskTexture1, vec2(vTexCoord.y, vTexCoord.x));
  if(uNumMasks > 2) masks[2] = texture(uMaskTexture2, vec2(vTexCoord.y, vTexCoord.x));
  if(uNumMasks > 3) masks[3] = texture(uMaskTexture3, vec2(vTexCoord.y, vTexCoord.x));
  if(uNumMasks > 4) masks[4] = texture(uMaskTexture4, vec2(vTexCoord.y, vTexCoord.x));
  if(uNumMasks > 5) masks[5] = texture(uMaskTexture5, vec2(vTexCoord.y, vTexCoord.x));
  if(uNumMasks > 6) masks[6] = texture(uMaskTexture6, vec2(vTexCoord.y, vTexCoord.x));
  if(uNumMasks > 7) masks[7] = texture(uMaskTexture7, vec2(vTexCoord.y, vTexCoord.x));
  if(uNumMasks > 8) masks[8] = texture(uMaskTexture8, vec2(vTexCoord.y, vTexCoord.x));

  // 檢查任何遮罩是否有重疊
  bool overlap = false;
  for(int i = 0; i < 9 && i < uNumMasks; i++) {
    if(masks[i].r > 0.0f) {
      overlap = true;
      break;
    }
  }

  if(overlap) {
    fragColor = color;
  } else {
    fragColor = vec4(0.0f);
  }
}