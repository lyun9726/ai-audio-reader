export interface TTSRequest {
  text: string
  voiceId?: string
  rate?: number
  pitch?: number
}

export interface TTSResponse {
  audioUrl: string
  metadata?: {
    rate: number
    pitch: number
    voiceId: string
  }
}

export class TTSProvider {
  static async synthesize(request: TTSRequest): Promise<TTSResponse> {
    const { text, voiceId = 'alloy', rate = 1.0, pitch = 1.0 } = request

    // Demo mode: return data URL
    const demoAudioUrl = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABhADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD/////////////////////////////////////////////////////////////////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'

    return {
      audioUrl: demoAudioUrl,
      metadata: {
        rate,
        pitch,
        voiceId,
      },
    }
  }
}
