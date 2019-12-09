import {useState, useRef, useEffect} from 'react'
import imageUrl from './images/square.png'

const fontName = 'Comic Sans MS, Marker Felt, Sans'
const fontSize = 30
const palette = [
  'crimson',
  'darkcyan',
  'fuchsia',
  'green',
  'indigo',
  'maroon',
  'navy',
  'red',
  'turquoise',
  'yellow'
]

export function useCanvas({initialLines = []}) {
  const [lines, setLines] = useState(initialLines)
  const imgRef = useRef({})
  const canvasRef = useRef()
  const getContext = () => {
    return canvasRef.current && canvasRef.current.getContext('2d')
  }

  useEffect(() => {
    const img = new Image()
    imgRef.current = {el: img}
    img.onload = () => {
      imgRef.current = {
        ...imgRef.current,
        width: img.width,
        height: img.height
      }

      const canvas = canvasRef.current
      if (canvas) {
        canvas.width = img.width
        canvas.height = img.height
      }

      drawLines()
    }

    img.src = imageUrl
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const img = imgRef.current.el
    if (!canvas || !img) {
      return
    }

    canvas.width = img.width
    canvas.height = img.height
  }, [canvasRef.current])

  useEffect(drawLines, [lines, canvasRef.current])

  function clearCanvas() {
    const ctx = getContext()
    if (!ctx) {
      return
    }

    const {el, width, height} = imgRef.current
    ctx.drawImage(el, 0, 0, width, height)
    ctx.font = `${fontSize}px ${fontName}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
  }

  function addLineToCanvas(text, lineIndex, lineSectionHeight) {
    const ctx = getContext()
    const {width} = imgRef.current
    const textWidth = ctx.measureText(text).width
    const xMax = width - textWidth
    const yMin = lineIndex * lineSectionHeight
    const xPos = Math.random() * xMax
    const yPos = yMin + Math.random() * (lineSectionHeight - fontSize)
    const fillStyle = palette[Math.floor((Math.random() * 1000) % palette.length)]

    ctx.fillStyle = fillStyle
    ctx.fillText(text, xPos, yPos)
  }

  function drawLines() {
    const ctx = getContext()
    if (!ctx) {
      return
    }

    clearCanvas()
    const {height} = imgRef.current
    const lineSectionHeight = height / lines.length
    lines.forEach((line, index) => addLineToCanvas(line, index, lineSectionHeight))
  }

  function getBase64() {
    const canvas = canvasRef.current
    return canvas.toDataURL('image/png')
  }

  return {lines, setLines, redraw: drawLines, getBase64, canvasRef}
}
