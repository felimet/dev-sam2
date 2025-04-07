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
import BaseGLEffect from '@/common/components/video/effects/BaseGLEffect';
import {
  EffectFrameContext,
  EffectInit,
} from '@/common/components/video/effects/Effect';
import vertexShaderSource from '@/common/components/video/effects/shaders/DefaultVert.vert?raw';
import fragmentShaderSource from '@/common/components/video/effects/shaders/Sobel.frag?raw';
import {Tracklet} from '@/common/tracker/Tracker';
import invariant from 'invariant';
import {CanvasForm} from 'pts';
import {RLEObject, decode} from '@/jscocotools/mask';
import {preAllocateTextures} from '@/common/utils/ShaderUtils';
import {demoObjectLimit} from '@/demo/DemoConfig';

export default class SobelEffect extends BaseGLEffect {
  private _numMasks: number = 0;
  private _numMasksUniformLocation: WebGLUniformLocation | null = null;
  private _maskTextures: WebGLTexture[] = [];
  private _masksTextureUnitStart: number = 1;

  constructor() {
    super(4);

    this.vertexShaderSource = vertexShaderSource;
    this.fragmentShaderSource = fragmentShaderSource;
  }

  protected setupUniforms(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    init: EffectInit,
  ): void {
    super.setupUniforms(gl, program, init);
    
    this._numMasksUniformLocation = gl.getUniformLocation(program, 'uNumMasks');
    gl.uniform1i(this._numMasksUniformLocation, this._numMasks);
    
    // 動態分配紋理數量
    const maskCount = demoObjectLimit || 9; // 支持9種顏色
    this._maskTextures = preAllocateTextures(gl, maskCount);
  }

  apply(form: CanvasForm, context: EffectFrameContext, _tracklets: Tracklet[]) {
    const gl = this._gl;
    const program = this._program;

    if (!program) {
      return;
    }
    invariant(gl !== null, 'WebGL2 context is required');

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const pairIndex = Math.floor(this.variant / 2) % 2;
    gl.uniform1i(
      gl.getUniformLocation(program, 'uSwapColor'),
      this.variant % 2 === 0 ? 1 : 0,
    );
    gl.uniform1i(
      gl.getUniformLocation(program, 'uMonocolor'),
      pairIndex === 0 ? 0 : 1,
    );
    gl.uniform1i(this._numMasksUniformLocation, context.masks.length);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._frameTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      context.width,
      context.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      context.frame,
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    
    // 處理所有遮罩
    context.masks.forEach((mask, index) => {
      const decodedMask = decode([mask.bitmap as RLEObject]);
      const maskData = decodedMask.data as Uint8Array;
      gl.activeTexture(gl.TEXTURE0 + index + this._masksTextureUnitStart);
      gl.bindTexture(gl.TEXTURE_2D, this._maskTextures[index]);

      gl.uniform1i(
        gl.getUniformLocation(program, `uMaskTexture${index}`),
        index + this._masksTextureUnitStart,
      );

      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.LUMINANCE,
        context.height,
        context.width,
        0,
        gl.LUMINANCE,
        gl.UNSIGNED_BYTE,
        maskData,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    });

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    const ctx = form.ctx;
    invariant(this._canvas !== null, 'canvas is required');
    ctx.drawImage(this._canvas, 0, 0);
  }
  
  async cleanup(): Promise<void> {
    super.cleanup();

    if (this._gl != null) {
      // Delete mask textures to prevent memory leaks
      this._maskTextures.forEach(texture => {
        if (texture != null && this._gl != null) {
          this._gl.deleteTexture(texture);
        }
      });
      this._maskTextures = [];
    }
  }
}
