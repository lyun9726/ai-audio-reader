'use client'

import { useReaderStore } from '../stores/readerStore'

export function useTTS() {
  const isPlaying = useReaderStore((state) => state.tts.isPlaying)
  const rate = useReaderStore((state) => state.tts.rate)
  const pitch = useReaderStore((state) => state.tts.pitch)
  const voiceId = useReaderStore((state) => state.tts.voiceId)

  const play = useReaderStore((state) => state.play)
  const pause = useReaderStore((state) => state.pause)
  const stop = useReaderStore((state) => state.stop)
  const setRate = useReaderStore((state) => state.setRate)
  const setPitch = useReaderStore((state) => state.setPitch)
  const setVoiceId = useReaderStore((state) => state.setVoiceId)

  return {
    isPlaying,
    rate,
    pitch,
    voiceId,
    play,
    pause,
    stop,
    setRate,
    setPitch,
    setVoiceId,
  }
}
