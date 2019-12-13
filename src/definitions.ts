declare module "@capacitor/core" {
  interface PluginRegistry {
    MediaRecorder: MediaRecorderPlugin;
  }
}

export interface MediaRecorderPlugin {

  startRecording(options: MediaRecorderOptions): Promise<{id: string}>;

  stopRecording(options: {id: string}): Promise<File>;

  getPreview(options: {id: string}): Promise<MediaStream>;

}

export type MediaRecorderOptions = {name?: string} & MediaStreamConstraints;
