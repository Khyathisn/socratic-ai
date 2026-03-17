'use client'
import { useState, useEffect, useCallback } from 'react'

export function useVoiceInterview() {
  const [transcript, setTranscript] = useState('')
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setSupported(true)
    }
  }, [])

  const startListening = useCallback(() => {
    if (!supported) return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript
      setTranscript(text)
      setListening(false)
    }

    recognition.start()
  }, [supported])

  const stopListening = useCallback(() => {
    setListening(false)
  }, [])

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined') return
    window.speechSynthesis.cancel()

    // Process line by line
    const lines = text.split('\n')
    const cleanedLines: string[] = []

    for (const line of lines) {
      let l = line.trim()
      if (!l) continue
      // Skip table rows
      if (l.includes('|')) continue
      // Skip horizontal rules
      if (/^[-=*_]{3,}$/.test(l)) continue
      // Skip code blocks
      if (l.startsWith('```')) continue
      // Remove headers
      l = l.replace(/^#{1,6}\s+/, '')
      // Remove bullet points — ensure space after removal
      l = l.replace(/^[\*\-\+•]\s+/, '')
      // Remove numbered lists
      l = l.replace(/^\d+\.\s+/, '')
      // Remove bold/italic — keep text inside
      l = l.replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
      l = l.replace(/\*\*([^*]+)\*\*/g, '$1')
      l = l.replace(/\*([^*]+)\*/g, '$1')
      // Remove inline code but keep content
      l = l.replace(/`([^`]+)`/g, '$1')
      // Remove any remaining asterisks
      l = l.replace(/\*/g, '')
      // Remove backticks
      l = l.replace(/`/g, '')
      l = l.trim()
      if (l.length > 0) cleanedLines.push(l)
    }

    // Join lines with period+space so words don't merge
    const fullText = cleanedLines.join('. ').replace(/\.\s*\.\s*/g, '. ').trim()

    if (!fullText) return

    // Split into chunks of max 150 chars at sentence boundaries
    const chunks: string[] = []
    const sentences = fullText.split(/(?<=[.!?])\s+/)
    let current = ''
    for (const sentence of sentences) {
      if ((current + ' ' + sentence).length > 150) {
        if (current) chunks.push(current.trim())
        current = sentence
      } else {
        current = current ? current + ' ' + sentence : sentence
      }
    }
    if (current) chunks.push(current.trim())

    // Speak chunks sequentially
    let i = 0
    const speakNext = () => {
      if (i >= chunks.length) return
      const utterance = new SpeechSynthesisUtterance(chunks[i])
      utterance.rate = 0.95
      utterance.pitch = 1.0
      utterance.volume = 1.0
      utterance.onend = () => {
        i++
        speakNext()
      }
      window.speechSynthesis.speak(utterance)
    }
    speakNext()
  }, [])

  return { transcript, listening, startListening, stopListening, speak, supported }
}
