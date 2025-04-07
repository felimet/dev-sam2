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
uniform bool uFillColor;
uniform bool uLight;
uniform bool uTransparency;
uniform sampler2D uMaskTexture0;
uniform sampler2D uMaskTexture1;
uniform sampler2D uMaskTexture2;
uniform sampler2D uMaskTexture3;
uniform sampler2D uMaskTexture4;
uniform sampler2D uMaskTexture5;
uniform sampler2D uMaskTexture6;
uniform sampler2D uMaskTexture7;
uniform sampler2D uMaskTexture8;

uniform vec4 uMaskColor0;
uniform vec4 uMaskColor1;
uniform vec4 uMaskColor2;
uniform vec4 uMaskColor3;
uniform vec4 uMaskColor4;
uniform vec4 uMaskColor5;
uniform vec4 uMaskColor6;
uniform vec4 uMaskColor7;
uniform vec4 uMaskColor8;

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

void main() {
  vec4 color = texture(uSampler, vTexCoord);
  float aspectRatio = uSize.y / uSize.x;
  float radiusThreshold = 0.8f;
  float tickness = 0.085f;

  // 創建遮罩、顏色和邊界框數組
  vec4 masks[9];
  vec4 maskColors[9];
  vec4 bboxes[9];
  
  // 初始化遮罩陣列
  for(int i = 0; i < 9; i++) {
    masks[i] = vec4(0.0f);
  }
  
  // 設置顏色和邊界框
  maskColors[0] = uMaskColor0 / 255.0;
  maskColors[1] = uMaskColor1 / 255.0;
  maskColors[2] = uMaskColor2 / 255.0;
  maskColors[3] = uMaskColor3 / 255.0;
  maskColors[4] = uMaskColor4 / 255.0;
  maskColors[5] = uMaskColor5 / 255.0;
  maskColors[6] = uMaskColor6 / 255.0;
  maskColors[7] = uMaskColor7 / 255.0;
  maskColors[8] = uMaskColor8 / 255.0;
  
  bboxes[0] = bbox0;
  bboxes[1] = bbox1;
  bboxes[2] = bbox2;
  bboxes[3] = bbox3;
  bboxes[4] = bbox4;
  bboxes[5] = bbox5;
  bboxes[6] = bbox6;
  bboxes[7] = bbox7;
  bboxes[8] = bbox8;
  
  vec4 scopedColor = vec4(0.0f);
  bool scoped = false;
  vec4 whiteVariation = uTransparency ? vec4(0.0,0.0,0.0,1.0) : vec4(1.0);

  // 處理所有支援的遮罩
  for(int i = 0; i < 9 && i < uNumMasks; i++) {
    // 為每個遮罩讀取正確的紋理
    if(i == 0) masks[i] = texture(uMaskTexture0, vec2(vTexCoord.y, vTexCoord.x));
    else if(i == 1) masks[i] = texture(uMaskTexture1, vec2(vTexCoord.y, vTexCoord.x));
    else if(i == 2) masks[i] = texture(uMaskTexture2, vec2(vTexCoord.y, vTexCoord.x));
    else if(i == 3) masks[i] = texture(uMaskTexture3, vec2(vTexCoord.y, vTexCoord.x));
    else if(i == 4) masks[i] = texture(uMaskTexture4, vec2(vTexCoord.y, vTexCoord.x));
    else if(i == 5) masks[i] = texture(uMaskTexture5, vec2(vTexCoord.y, vTexCoord.x));
    else if(i == 6) masks[i] = texture(uMaskTexture6, vec2(vTexCoord.y, vTexCoord.x));
    else if(i == 7) masks[i] = texture(uMaskTexture7, vec2(vTexCoord.y, vTexCoord.x));
    else if(i == 8) masks[i] = texture(uMaskTexture8, vec2(vTexCoord.y, vTexCoord.x));

    vec2 center = (bboxes[i].xy + bboxes[i].zw) * 0.5f;
    float radiusX = abs(bboxes[i].y - bboxes[i].w) * 0.5f;
    float radiusY = radiusX / aspectRatio;

    float distX = (vTexCoord.x - center.x) / radiusX;
    float distY = (vTexCoord.y - center.y) / radiusY;
    float dist = sqrt(pow(distX, 2.0f) + pow(distY, 2.0f));
   
    if(uFillColor) {
      if(dist >= radiusThreshold - tickness && dist <= radiusThreshold) {
        scoped = true;
        scopedColor = uLight ? whiteVariation : maskColors[i];
      }
    } else if(dist <= radiusThreshold) {
      scoped = true;
      scopedColor = uLight ? whiteVariation : maskColors[i];
    }
  }

  // 檢查任何遮罩是否有重疊
  bool overlap = false;
  for(int i = 0; i < 9 && i < uNumMasks; i++) {
    if(masks[i].r > 0.0f) {
      overlap = true;
      break;
    }
  }

  if(scoped) {
    fragColor = overlap ? color : scopedColor;
    fragColor.a = uTransparency ? fragColor.a : 1.0;
  } else {
    fragColor = overlap ? color : vec4(0.0f, 0.0f, 0.0f, 0.0f);
  }
}
