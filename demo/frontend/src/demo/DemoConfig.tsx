/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {Effects} from '@/common/components/video/effects/Effects';

type EffectLayers = {
  background: keyof Effects;
  highlight: keyof Effects;
};

export const DEMO_SHORT_NAME = 'SAM 2 Demo';
export const RESEARCH_BY_META_AI = 'By Meta FAIR';
export const DEMO_FRIENDLY_NAME = 'Segment Anything 2 Demo';
// export const VIDEO_WATERMARK_TEXT = `Modified with ${DEMO_FRIENDLY_NAME}`;
export const VIDEO_WATERMARK_TEXT = ``;
export const PROJECT_GITHUB_URL =
  'https://github.com/facebookresearch/sam2';
export const AIDEMOS_URL = 'https://aidemos.meta.com';
export const ABOUT_URL = 'https://ai.meta.com/sam2';
export const EMAIL_ADDRESS = 'segment-anything@meta.com';
export const BLOG_URL = 'http://ai.meta.com/blog/sam2';


// for ./demo/frontend/src/settings/SettingsReducer.ts 
const Localhost_API_ENDPOINT = 'http://localhost:7263'; 
const Remote_API_ENDPOINT = 'https://api-sam2.jmprohub.com'; 

// 建立一個安全的方式來檢查是否在本地網絡
const checkIsLocalNetwork = () => {
  if (typeof window === 'undefined') {
    // 在伺服器端渲染時，預設為非本地網絡
    return false;
  }
  
  // 在客戶端檢查 hostname
  return (
    window.location.hostname === 'localhost' || 
    window.location.hostname.startsWith('192.168.') || 
    window.location.hostname.startsWith('10.') ||
    window.location.hostname.startsWith('172.16.') || 
    window.location.hostname.startsWith('172.17.') ||
    window.location.hostname.startsWith('172.18.') ||
    window.location.hostname.startsWith('172.19.') ||
    window.location.hostname.startsWith('172.2') ||
    window.location.hostname.startsWith('172.3') ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.endsWith('.local')
  );
};

// 使用函數而不是直接賦值，避免在伺服器端渲染時執行
const isLocalNetwork = checkIsLocalNetwork();

export const API_ENDPOINT = isLocalNetwork 
  ? Localhost_API_ENDPOINT 
  : Remote_API_ENDPOINT;

export const VIDEO_API_ENDPOINT = API_ENDPOINT; 
export const INFERENCE_API_ENDPOINT = API_ENDPOINT; 
// export const IMAGE_API_ENDPOINT = API_ENDPOINT; 

// 只在客戶端才執行日誌輸出
if (typeof window !== 'undefined') {
  console.log('目前主機名稱:', window.location.hostname);
  console.log('是否為本地網絡:', isLocalNetwork);
  console.log('使用中的API端點:', API_ENDPOINT);
}

export const demoObjectLimit = 9;

export const DEFAULT_EFFECT_LAYERS: EffectLayers = {
  background: 'Original',
  highlight: 'Overlay',
};

export const MAX_UPLOAD_FILE_SIZE = "5000MB"; // 5000MB
