'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * 정적 배경만 깔고 셰이더는 끌 경로.
 * 데이터 위주의 페이지(검색결과/상세) 에서는 GPU/배터리 부담을 없애고
 * 시각적으로도 산만함을 줄인다.
 */
const STATIC_BG_PATHS = ['/result', '/businessInfo']

/**
 * Aurora Drift — 메인 페이지의 풀스크린 WebGL 배경.
 *
 * 원본 (frontend/Aurora Drift.html) 의 인터랙션(마우스 추적, 클릭 버스트) 을 제거해
 * 단순 idle drift 만 유지한 단순 배경 버전.
 *
 * - `position: fixed; inset: 0` 로 viewport 전체를 덮고
 * - `pointer-events: none` 으로 클릭/마우스 이벤트를 콘텐츠로 통과시킴
 * - `prefers-reduced-motion` 또는 WebGL 미지원 시 정적 그라디언트로 폴백
 */

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`

const FRAG = `
precision highp float;
uniform vec2  u_res;
uniform float u_time;

float hash12(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash12(i+vec2(0,0)), hash12(i+vec2(1,0)), u.x),
             mix(hash12(i+vec2(0,1)), hash12(i+vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){
  float v=0.0, a=0.5;
  mat2 R = mat2(0.8,-0.6,0.6,0.8);
  for(int i=0;i<5;i++){ v += a*noise(p); p = R*p*2.0; a*=0.5; }
  return v;
}

void main(){
  vec2 p  = (gl_FragCoord.xy*2.0 - u_res.xy)/u_res.y;
  float t = u_time*0.15;

  // 시간 기반 자동 드리프트
  vec2 m = vec2(cos(t*0.23)*0.28, sin(t*0.31)*0.22);

  vec2 q = p + vec2(0.0, sin(p.x*1.2 + t*1.5)*0.05);
  q.y += m.x*0.4 * exp(-pow(p.x-m.x,2.0)*1.5);

  // 밝은 파스텔 베이스 — 옅은 라벤더 화이트, 위쪽이 약간 더 밝고 아래쪽으로 갈수록 살짝 핑크 톤.
  vec3 col = vec3(0.96, 0.95, 0.99);
  col -= vec3(0.02, 0.04, 0.03) * smoothstep(-1.0, 0.6, -p.y);

  // 5 layered aurora bands — 파스텔 wash (mix 로 베이스에 부드럽게 끌어당김)
  for(int i=0;i<5;i++){
    float fi = float(i);
    float speed   = 0.2 + fi*0.07;
    float scaleX  = 0.7 + fi*0.25;
    float yOffset = -0.15 + fi*0.18 + m.y*0.3;

    float wave = fbm(vec2(q.x*scaleX + t*speed, fi*3.7 + t*0.4))*0.6
               + sin(q.x*2.0 + t*2.0 + fi)*0.08;
    float band = exp(-pow((q.y - yOffset - wave)*4.0, 2.0));

    // 색조 순환을 약간 다르게 잡고 흰색과 강하게 mix 해서 파스텔로.
    vec3 hue = 0.5 + 0.5*cos(6.2831*(vec3(0.0,0.33,0.67) + fi*0.16 + t*0.25 + 0.1));
    hue = mix(hue, vec3(1.0), 0.35);                          // 채도 낮춰 파스텔
    hue = mix(hue, vec3(0.95, 0.78, 0.92), 0.3);              // 분홍-라벤더 bias

    col = mix(col, hue, band * (0.40 - fi*0.05));
  }

  // 아주 약한 grain (밝은 톤에서 너무 도드라지지 않게)
  col += (hash12(gl_FragCoord.xy + u_time)-0.5)*0.012;

  gl_FragColor = vec4(col, 1.0);
}
`

// WebGL 미지원/모션 감소 폴백 — 메인 등 어두운 페이지에서 사용.
const STATIC_GRADIENT_BG =
  'radial-gradient(ellipse at 50% 70%, #0a1430 0%, #04081a 50%, #02030a 100%)'

// 데이터 페이지(/result, /businessInfo) 의 흰 배경.
const STATIC_LIGHT_BG = '#f2f2f6'

const canvasStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  width: '100%',
  height: '100%',
  zIndex: 0,
  pointerEvents: 'none',
  display: 'block',
}

const AuroraBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const pathname = usePathname()
  const isStaticRoute = STATIC_BG_PATHS.some((p) => pathname?.startsWith(p))

  useEffect(() => {
    // 정적 분기에서는 캔버스가 아예 마운트되지 않으므로 (아래 early return)
    // 셋업 자체가 발생하지 않는다.
    if (isStaticRoute) return

    const canvas = canvasRef.current
    if (!canvas) return

    // 모션 감소 선호 — 정적 그라디언트만 표시
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      canvas.style.background = STATIC_GRADIENT_BG
      return
    }

    const gl = canvas.getContext('webgl', {
      antialias: false,
      alpha: false,
      premultipliedAlpha: false,
    })
    if (!gl) {
      canvas.style.background = STATIC_GRADIENT_BG
      return
    }

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type)
      if (!shader) throw new Error('createShader failed')
      gl.shaderSource(shader, src)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('shader compile error:', gl.getShaderInfoLog(shader))
      }
      return shader
    }

    const vs = compile(gl.VERTEX_SHADER, VERT)
    const fs = compile(gl.FRAGMENT_SHADER, FRAG)
    const prog = gl.createProgram()
    if (!prog) {
      canvas.style.background = STATIC_GRADIENT_BG
      return
    }
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    )
    const aPos = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(prog, 'u_res')
    const uTime = gl.getUniformLocation(prog, 'u_time')

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const start = performance.now()
    let rafId = 0
    const frame = () => {
      const tSec = (performance.now() - start) / 1000
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, tSec)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      rafId = requestAnimationFrame(frame)
    }
    rafId = requestAnimationFrame(frame)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafId)
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [isStaticRoute])

  // 정적 경로: canvas 대신 div 를 렌더 → 페이지 전환 시 React 가 element 자체를 교체해
  // 이전 셰이더 픽셀 잔상이 남지 않는다. RAF/GL 셋업도 진입하지 않음.
  if (isStaticRoute) {
    return (
      <div
        aria-hidden="true"
        style={{ ...canvasStyle, background: STATIC_LIGHT_BG }}
      />
    )
  }

  return <canvas ref={canvasRef} style={canvasStyle} aria-hidden="true" />
}

export default AuroraBackground
