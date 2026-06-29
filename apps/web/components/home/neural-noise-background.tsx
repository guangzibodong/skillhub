"use client";

import { useEffect, useRef } from "react";

const vertexShaderSource = `
precision mediump float;

varying vec2 vUv;
attribute vec2 a_position;

void main() {
  vUv = 0.5 * (a_position + 1.0);
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;

varying vec2 vUv;
uniform float u_time;
uniform float u_ratio;
uniform vec2 u_pointer_position;
uniform float u_scroll_progress;

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float neuro_shape(vec2 uv, float t, float p) {
  vec2 sine_acc = vec2(0.0);
  vec2 res = vec2(0.0);
  float scale = 8.0;

  for (int j = 0; j < 15; j++) {
    uv = rotate(uv, 1.0);
    sine_acc = rotate(sine_acc, 1.0);
    vec2 layer = uv * scale + float(j) + sine_acc - t;
    sine_acc += sin(layer);
    res += (0.5 + 0.5 * cos(layer)) / scale;
    scale *= (1.2 - 0.07 * p);
  }

  return res.x + res.y;
}

void main() {
  vec2 uv = 0.5 * vUv;
  uv.x *= u_ratio;

  vec2 pointer = vUv - u_pointer_position;
  pointer.x *= u_ratio;
  float p = clamp(length(pointer), 0.0, 1.0);
  p = 0.5 * pow(1.0 - p, 2.0);

  float t = 0.001 * u_time;
  vec3 color = vec3(0.0);
  float noise = neuro_shape(uv, t, p);

  noise = 1.2 * pow(noise, 3.0);
  noise += pow(noise, 10.0);
  noise = max(0.0, noise - 0.5);
  noise *= 1.0 - length(vUv - 0.5);

  color = normalize(vec3(
    0.2,
    0.5 + 0.4 * cos(3.0 * u_scroll_progress),
    0.5 + 0.5 * sin(3.0 * u_scroll_progress)
  ));

  gl_FragColor = vec4(color * noise, noise);
}
`;

type UniformMap = {
  u_time: WebGLUniformLocation;
  u_ratio: WebGLUniformLocation;
  u_pointer_position: WebGLUniformLocation;
  u_scroll_progress: WebGLUniformLocation;
};

function createShader(gl: WebGLRenderingContext, source: string, type: number) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(`Neural noise shader compile failed: ${gl.getShaderInfoLog(shader) ?? "unknown error"}`);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertexShader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  const fragmentShader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(`Neural noise program link failed: ${gl.getProgramInfoLog(program) ?? "unknown error"}`);
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

function getUniforms(gl: WebGLRenderingContext, program: WebGLProgram): UniformMap | null {
  const u_time = gl.getUniformLocation(program, "u_time");
  const u_ratio = gl.getUniformLocation(program, "u_ratio");
  const u_pointer_position = gl.getUniformLocation(program, "u_pointer_position");
  const u_scroll_progress = gl.getUniformLocation(program, "u_scroll_progress");

  if (!u_time || !u_ratio || !u_pointer_position || !u_scroll_progress) return null;

  return {
    u_time,
    u_ratio,
    u_pointer_position,
    u_scroll_progress,
  };
}

function getScrollProgress() {
  return window.pageYOffset / (2 * window.innerHeight);
}

export function NeuralNoiseBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const gl = (canvas.getContext("webgl") ?? canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;

    if (!gl) return;

    const program = createProgram(gl);
    if (!program) return;

    const uniforms = getUniforms(gl, program);
    if (!uniforms) {
      gl.deleteProgram(program);
      return;
    }

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      gl.deleteProgram(program);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const pointer = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    };

    let frameId = 0;

    const resizeCanvas = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, window.innerWidth);
      const height = Math.max(1, window.innerHeight);

      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uniforms.u_ratio, canvas.width / canvas.height);
    };

    const updatePointer = (x: number, y: number) => {
      pointer.targetX = x;
      pointer.targetY = y;
    };

    const handlePointerMove = (event: PointerEvent) => {
      updatePointer(event.clientX, event.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) updatePointer(touch.clientX, touch.clientY);
    };

    const handleClick = (event: MouseEvent) => {
      updatePointer(event.clientX, event.clientY);
    };

    const render = (time: number) => {
      pointer.x += (pointer.targetX - pointer.x) * 0.5;
      pointer.y += (pointer.targetY - pointer.y) * 0.5;

      gl.uniform1f(uniforms.u_time, time);
      gl.uniform2f(uniforms.u_pointer_position, pointer.x / window.innerWidth, 1 - pointer.y / window.innerHeight);
      gl.uniform1f(uniforms.u_scroll_progress, getScrollProgress());
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      frameId = requestAnimationFrame(render);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("click", handleClick);
    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("click", handleClick);
      gl.deleteBuffer(vertexBuffer);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <div className="home-neural-noise-background" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
