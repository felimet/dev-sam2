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
uniform vec2 uSize;
uniform int uNumMasks;
uniform sampler2D uEmojiTexture;
uniform bool uFill; // use all emoji texture
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

vec2 calculateAdjustedTexCoord(vec2 vTexCoord, vec4 bbox, float aspectRatio, out float distanceFromCenter) {
  vec2 center = (bbox.xy + bbox.zw) * 0.5f;
  float radiusX = abs(bbox.z - bbox.x);
  float radiusY = radiusX / aspectRatio;
  float scale = 1.25f;
  radiusX *= scale;
  radiusY *= scale;
  vec2 adjustedTexCoord = (vTexCoord - center) / vec2(radiusX, radiusY) + vec2(0.5f);
  distanceFromCenter = length((vTexCoord - center) / vec2(radiusX * 0.5f, radiusY * 0.5f));
  return adjustedTexCoord;
}

void main() {
  vec4 finalColor = vec4(0.0f);

  float aspectRatio = uSize.y / uSize.x;
  float totalMaskValue = 0.0f;
  vec4 bgFill = vec4(1.0f, 0.0f, 0.0f, 1.0f);

  vec4 emojiColor;

  if(uNumMasks > 0) {
    float maskValue0 = texture(uMaskTexture0, vec2(vTexCoord.y, vTexCoord.x)).r;
    float distanceFromCenter;
    vec2 adjustedTexCoord = calculateAdjustedTexCoord(vTexCoord, bbox0, aspectRatio, distanceFromCenter);

    if(maskValue0 > 0.0f) {
      emojiColor = texture(uEmojiTexture, adjustedTexCoord);
      if(distanceFromCenter > 0.85f && !uFill) {
        emojiColor = bgFill;
      }
    }
    if(uFill) {
      emojiColor = texture(uEmojiTexture, adjustedTexCoord);
    }
    
    totalMaskValue += maskValue0;
  }
  if(uNumMasks > 1) {
    float maskValue1 = texture(uMaskTexture1, vec2(vTexCoord.y, vTexCoord.x)).r;
    float distanceFromCenter;
    vec2 adjustedTexCoord = calculateAdjustedTexCoord(vTexCoord, bbox1, aspectRatio, distanceFromCenter);

    if(maskValue1 > 0.0f) {
      emojiColor = texture(uEmojiTexture, adjustedTexCoord);
      if(distanceFromCenter > 0.85f && !uFill) {
        emojiColor = bgFill;
      }
    }
    if(uFill && emojiColor.a == 0.0f) {
      emojiColor = texture(uEmojiTexture, adjustedTexCoord);
    }
      
    totalMaskValue += maskValue1;
  }
  if(uNumMasks > 2) {
    float maskValue2 = texture(uMaskTexture2, vec2(vTexCoord.y, vTexCoord.x)).r;
    float distanceFromCenter;
    vec2 adjustedTexCoord = calculateAdjustedTexCoord(vTexCoord, bbox2, aspectRatio, distanceFromCenter);
    if(maskValue2 > 0.0f) {
      emojiColor = texture(uEmojiTexture, adjustedTexCoord);
      if(distanceFromCenter > 0.85f && !uFill) {
        emojiColor = bgFill;
      }
    }
    if(uFill && emojiColor.a == 0.0f) {
      emojiColor = texture(uEmojiTexture, adjustedTexCoord);
    }

    totalMaskValue += maskValue2;
  }
  if(uNumMasks > 3) {
    float maskValue3 = texture(uMaskTexture3, vec2(vTexCoord.y, vTexCoord.x)).r;
    float distanceFromCenter;
    vec2 adjustedTexCoord = calculateAdjustedTexCoord(vTexCoord, bbox3, aspectRatio, distanceFromCenter);
    
    if(maskValue3 > 0.0f) {
      emojiColor = texture(uEmojiTexture, adjustedTexCoord);
      if(distanceFromCenter > 0.85f && !uFill) {
        emojiColor = bgFill;
      }
    }
    if(uFill && emojiColor.a == 0.0f) {
      emojiColor = texture(uEmojiTexture, adjustedTexCoord);
    }
    
    totalMaskValue += maskValue3;
  }
  if(uNumMasks > 4) {
    float maskValue4 = texture(uMaskTexture4, vec2(vTexCoord.y, vTexCoord.x)).r;
    float distanceFromCenter;
    vec2 adjustedTexCoord = calculateAdjustedTexCoord(vTexCoord, bbox4, aspectRatio, distanceFromCenter);
    
    if(maskValue4 > 0.0f) {
      emojiColor = texture(uEmojiTexture, adjustedTexCoord);
      if(distanceFromCenter > 0.85f && !uFill) {
        emojiColor = bgFill;
      }
    }
    if(uFill && emojiColor.a == 0.0f) {
      emojiColor = texture(uEmojiTexture, adjustedTexCoord);
    }
    
    totalMaskValue += maskValue4;
  }
  if(uNumMasks > 5) {
    float maskValue5 = texture(uMaskTexture5, vec2(vTexCoord.y, vTexCoord.x)).r;
    float distanceFromCenter;
    vec2 adjustedTexCoord = calculateAdjustedTexCoord(vTexCoord, bbox5, aspectRatio, distanceFromCenter);
    
    if(maskValue5 > 0.0f) {
      emojiColor = texture(uEmojiTexture, adjustedTexCoord);
      if(distanceFromCenter > 0.85f && !uFill) {
        emojiColor = bgFill;
      }
    }
    if(uFill && emojiColor.a == 0.0f) {
      emojiColor = texture(uEmojiTexture, adjustedTexCoord);
    }
    
    totalMaskValue += maskValue5;
  }
  if(uNumMasks > 6) {
    float maskValue6 = texture(uMaskTexture6, vec2(vTexCoord.y, vTexCoord.x)).r;
    float distanceFromCenter;
    vec2 adjustedTexCoord = calculateAdjustedTexCoord(vTexCoord, bbox6, aspectRatio, distanceFromCenter);
    
    if(maskValue6 > 0.0f) {
      emojiColor = texture(uEmojiTexture, adjustedTexCoord);
      if(distanceFromCenter > 0.85f && !uFill) {
        emojiColor = bgFill;
      }
    }
    if(uFill && emojiColor.a == 0.0f) {
      emojiColor = texture(uEmojiTexture, adjustedTexCoord);
    }
    
    totalMaskValue += maskValue6;
  }
if(uNumMasks > 7) {
    float maskValue7 = texture(uMaskTexture7, vec2(vTexCoord.y, vTexCoord.x)).r;
    float distanceFromCenter;
    vec2 adjustedTexCoord = calculateAdjustedTexCoord(vTexCoord, bbox7, aspectRatio, distanceFromCenter);
    
    if(maskValue7 > 0.0f) {
      emojiColor = texture(uEmojiTexture, adjustedTexCoord);
      if(distanceFromCenter > 0.85f && !uFill) {
        emojiColor = bgFill;
      }
    }
    if(uFill && emojiColor.a == 0.0f) {
      emojiColor = texture(uEmojiTexture, adjustedTexCoord);
    }
    
    totalMaskValue += maskValue7;
  }
  if(uNumMasks > 8) {
    float maskValue8 = texture(uMaskTexture8, vec2(vTexCoord.y, vTexCoord.x)).r;
    float distanceFromCenter;
    vec2 adjustedTexCoord = calculateAdjustedTexCoord(vTexCoord, bbox8, aspectRatio, distanceFromCenter);
    
    if(maskValue8 > 0.0f) {
      emojiColor = texture(uEmojiTexture, adjustedTexCoord);
      if(distanceFromCenter > 0.85f && !uFill) {
        emojiColor = bgFill;
      }
    }
    if(uFill && emojiColor.a == 0.0f) {
      emojiColor = texture(uEmojiTexture, adjustedTexCoord);
    }
    
    totalMaskValue += maskValue8;
  }


  if(totalMaskValue > 0.0f) {
    finalColor = emojiColor;
  } else {
    finalColor = uFill ? emojiColor : vec4(0.0f);
  }
  fragColor = finalColor;
}
