import React, { useRef, useEffect } from 'react'

const WaterBall: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) return

    // Set up canvas dimensions and background color
    canvas.width = 500
    canvas.height = 500
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)

    // Set up 3D projection matrix
    const projectionMatrix = new Float32Array([
      2 / canvas.width,
      0,
      0,
      0,
      0,
      -2 / canvas.height,
      0,
      0,
      0,
      0,
      2 / 1,
      0,
      -1,
      1,
      0,
      1
    ])

    // Set up camera position
    const cameraPosition = [0, 0, 500]

    // Set up light position
    const lightPosition = [0, 0, 1000]

    // Set up water ball radius and color
    const radius = 100
    const color = [0, 0, 255]

    // Set up water ball vertices and faces
    const vertices: number[][] = []
    const faces: number[][] = []
    for (let i = 0; i <= 20; i++) {
      const lat = Math.PI * (-0.5 + i / 20)
      for (let j = 0; j <= 20; j++) {
        const lng = (2 * Math.PI * j) / 20
        const x = Math.cos(lat) * Math.cos(lng)
        const y = Math.cos(lat) * Math.sin(lng)
        const z = Math.sin(lat)
        vertices.push([x * radius, y * radius, z * radius])
      }
    }
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        const v1 = i * 21 + j
        const v2 = (i + 1) * 21 + j
        const v3 = i * 21 + j + 1
        const v4 = (i + 1) * 21 + j + 1
        faces.push([v1, v2, v3])
        faces.push([v3, v2, v4])
      }
    }

    // Set up rotation matrix
    const rotationMatrix = new Float32Array([
      Math.cos(Math.PI / 4),
      -Math.sin(Math.PI / 4),
      0,
      0,
      Math.sin(Math.PI / 4),
      Math.cos(Math.PI / 4),
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ])

    // Render water ball
    function render() {
      if (!context || !canvas) return
      context.clearRect(0, 0, canvas.width, canvas.height)

      const transformedVertices: number[][] = []
      for (const vertex of vertices) {
        // Transform vertex by projection matrix
        const x =
          vertex[0] * projectionMatrix[0] +
          vertex[1] * projectionMatrix[4] +
          vertex[2] * projectionMatrix[8] +
          projectionMatrix[12]
        const y =
          vertex[0] * projectionMatrix[1] +
          vertex[1] * projectionMatrix[5] +
          vertex[2] * projectionMatrix[9] +
          projectionMatrix[13]
        const z =
          vertex[0] * projectionMatrix[2] +
          vertex[1] * projectionMatrix[6] +
          vertex[2] * projectionMatrix[10] +
          projectionMatrix[14]
        const w =
          vertex[0] * projectionMatrix[3] +
          vertex[1] * projectionMatrix[7] +
          vertex[2] * projectionMatrix[11] +
          projectionMatrix[15]

        const rx =
          vertex[0] * rotationMatrix[0] +
          vertex[1] * rotationMatrix[4] +
          vertex[2] * rotationMatrix[8] +
          rotationMatrix[12]
        const ry =
          vertex[0] * rotationMatrix[1] +
          vertex[1] * rotationMatrix[5] +
          vertex[2] * rotationMatrix[9] +
          rotationMatrix[13]
        const rz =
          vertex[0] * rotationMatrix[2] +
          vertex[1] * rotationMatrix[6] +
          vertex[2] * rotationMatrix[10] +
          rotationMatrix[14]
        const rw =
          vertex[0] * rotationMatrix[3] +
          vertex[1] * rotationMatrix[7] +
          vertex[2] * rotationMatrix[11] +
          rotationMatrix[15]

        const ndcX = rx / rw
        const ndcY = ry / rw
        const ndcZ = rz / rw

        const screenX = ((ndcX + 1) * canvas.width) / 2
        const screenY = ((1 - ndcY) * canvas.height) / 2

        transformedVertices.push([screenX, screenY, ndcZ])
      }

      // Sort faces by depth
      faces.sort((a, b) => {
        const z1 = (transformedVertices[a[0]][2] + transformedVertices[a[1]][2] + transformedVertices[a[2]][2]) / 3
        const z2 = (transformedVertices[b[0]][2] + transformedVertices[b[1]][2] + transformedVertices[b[2]][2]) / 3

        return z2 - z1
      })

      // Calculate normals for each face
      const faceNormals: number[][] = []
      for (const face of faces) {
        const v1 = transformedVertices[face[0]]
        const v2 = transformedVertices[face[1]]
        const v3 = transformedVertices[face[2]]
        const normal = calculateNormal(v1, v2, v3)
        faceNormals.push(normal)
      }

      // Calculate intensity of each face
      const faceIntensities: number[] = []
      for (let i = 0; i < faces.length; i++) {
        const normal = faceNormals[i]
        const intensity = calculateIntensity(normal, lightPosition, cameraPosition)

        faceIntensities.push(intensity)
      }

      // Render each face
      for (let i = 0; i < faces.length; i++) {
        const face = faces[i]
        const intensity = faceIntensities[i]
        context.fillStyle = `rgb(${color[0] * intensity}, ${color[1] * intensity}, ${color[2] * intensity})`
        context.beginPath()
        context.moveTo(transformedVertices[face[0]][0], transformedVertices[face[0]][1])
        context.lineTo(transformedVertices[face[1]][0], transformedVertices[face[1]][1])
        context.lineTo(transformedVertices[face[2]][0], transformedVertices[face[2]][1])
        context.closePath()
        context.fill()
      }

      requestAnimationFrame(render)
    }

    function calculateNormal(v1: number[], v2: number[], v3: number[]): number[] {
      const a = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]]
      const b = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]]
      const normal = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
      const length = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2])

      return [normal[0] / length, normal[1] / length, normal[2] / length]
    }

    function calculateIntensity(normal: number[], lightPosition: number[], cameraPosition: number[]): number {
      const lightDirection = [
        lightPosition[0] - cameraPosition[0],
        lightPosition[1] - cameraPosition[1],
        lightPosition[2] - cameraPosition[2]
      ]
      const length = Math.sqrt(
        lightDirection[0] * lightDirection[0] +
          lightDirection[1] * lightDirection[1] +
          lightDirection[2] * lightDirection[2]
      )
      lightDirection[0] /= length
      lightDirection[1] /= length
      lightDirection[2] /= length

      return Math.max(0, normal[0] * lightDirection[0] + normal[1] * lightDirection[1] + normal[2] * lightDirection[2])
    }

    requestAnimationFrame(render)
  }, [])

  return <canvas ref={canvasRef} />
}

export default WaterBall
