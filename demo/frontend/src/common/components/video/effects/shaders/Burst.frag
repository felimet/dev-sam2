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

precision highp float;

in vec2 vTexCoord;

uniform sampler2D uSampler;
uniform vec2 uSize; // resolution
uniform int uNumMasks;
uniform bool uLineColor;
uniform bool uInterleave;
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
  float PI = radians(180.0f);
  float lines = uInterleave ? 12.0f : 80.0f;
  vec4 color = texture(uSampler, vTexCoord);
  
  // 創建顏色數組
  vec4 maskColors[9];
  maskColors[0] = uMaskColor0 / 255.0;
  maskColors[1] = uMaskColor1 / 255.0;
  maskColors[2] = uMaskColor2 / 255.0;
  maskColors[3] = uMaskColor3 / 255.0;
  maskColors[4] = uMaskColor4 / 255.0;
  maskColors[5] = uMaskColor5 / 255.0;
  maskColors[6] = uMaskColor6 / 255.0;
  maskColors[7] = uMaskColor7 / 255.0;
  maskColors[8] = uMaskColor8 / 255.0;
  
  // 創建遮罩和邊界框數組
  vec4 masks[9];
  vec4 bboxes[9];
  bboxes[0] = bbox0;
  bboxes[1] = bbox1;
  bboxes[2] = bbox2;
  bboxes[3] = bbox3;
  bboxes[4] = bbox4;
  bboxes[5] = bbox5;
  bboxes[6] = bbox6;
  bboxes[7] = bbox7;
  bboxes[8] = bbox8;
  
  // 初始化遮罩
  for(int i = 0; i < 9; i++) {
    masks[i] = vec4(0.0);
  }

  vec2 fragCoord = vTexCoord * uSize; // transform to pixel space
  bool scoped = false;
  vec4 scopedColor = vec4(0.0f);
  vec4 transparent = vec4(0.0);
  float p = PI / lines;

  // 處理所有遮罩
  for(int i = 0; i < 9 && i < uNumMasks; i++) {
    // 基於索引選擇正確的遮罩紋理
    if(i == 0) masks[i] = texture(uMaskTexture0, vec2(vTexCoord.y, vTexCoord.x));
    else if(i == 1) masks[i] = texture(uMaskTexture1, vec2(vTexCoord.y, vTexCoord.x));
    else if(i == 2) masks[i] = texture(uMaskTexture2, vec2(vTexCoord.y, vTexCoord.x));
    else if(i == 3) masks[i] = texture(uMaskTexture3, vec2(vTexCoord.y, vTexCoord.x));
    else if(i == 4) masks[i] = texture(uMaskTexture4, vec2(vTexCoord.y, vTexCoord.x));
    else if(i == 5) masks[i] = texture(uMaskTexture5, vec2(vTexCoord.y, vTexCoord.x));
    else if(i == 6) masks[i] = texture(uMaskTexture6, vec2(vTexCoord.y, vTexCoord.x));
    else if(i == 7) masks[i] = texture(uMaskTexture7, vec2(vTexCoord.y, vTexCoord.x));
    else if(i == 8) masks[i] = texture(uMaskTexture8, vec2(vTexCoord.y, vTexCoord.x));

    vec2 center = (bboxes[i].xy + bboxes[i].zw) * 0.5f * uSize;
    vec2 fragCoordT = (fragCoord - center) / uSize.y;
    float a = mod(atan(fragCoordT.y, fragCoordT.x) + p, p + p) - p; // angle of fragment

    float pattern = sin(a * lines);
    // smoothstep for antialiasing
    float line = smoothstep(2.8 / uSize.y, 0.0, length(fragCoordT) * abs(sin(a)));
    
    vec4 colorToBlend = uLineColor ? vec4(maskColors[i].rgb, 0.80f) : vec4(1.0f);
    bool visible = bboxes[i] != vec4(0.0f);

    if (uInterleave && visible) {
      vec4 tempColor = mix(transparent, colorToBlend, step(0.0, pattern));
      if (scopedColor == vec4(0.0)) {
        scopedColor += tempColor;
      }
      scoped = true;
    } else if (!uInterleave && visible) {
      vec4 tempColor = uLineColor ? vec4(maskColors[i].rgb * line, line) : vec4(line);
      scopedColor += tempColor;    
      scoped = true;
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
  } else {
    fragColor = overlap ? color : vec4(0.0f, 0.0f, 0.0f, 0.0f);
  }
}
