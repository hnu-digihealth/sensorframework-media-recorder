import {WebPlugin} from '@capacitor/core';
import {MediaRecorderOptions, MediaRecorderPlugin} from './definitions';

interface MediaRecording {

    id: string;

    stream: MediaStream;

    recorder: any;

    chunks: Blob[];

    finished: Promise<void>;

    name: string;
}

const uuidv4 = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const Recorder = (window as any).MediaRecorder;

export class MediaRecorderWeb extends WebPlugin implements MediaRecorderPlugin {

    private recordings: Map<string, MediaRecording> = new Map<string, MediaRecording>();

    constructor() {
        super({
            name: 'MediaRecorder',
            platforms: ['web', 'android']
        });
    }

    async startRecording(options: MediaRecorderOptions): Promise<{ id: string }> {

        const stream = await navigator.mediaDevices.getUserMedia(options);
        const recorder = new Recorder(stream);
        const id = uuidv4();
        const chunks: Blob[] = [];
        const name = options.name || Date.now().toString();

        const finished = new Promise<void>((resolve) => {

            recorder.ondataavailable = (event: any) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            recorder.onstop = () => {
                resolve();
            };

            recorder.start();
        });

        const recording = {
            id,
            stream,
            recorder,
            chunks,
            finished,
            name,
        };

        this.recordings.set(id, recording);

        return {id};
    }

    async stopRecording(options: { id: string }): Promise<File> {

        const {id} = options;
        const recording = this.recordings.get(id);

        if(!recording){
            return Promise.reject(`Recording with id ${id} does not exist`);
        }

        recording.recorder.stop();
        await recording.finished;

        const blob = new Blob(recording.chunks);
        const file = new File([blob], recording.name, {type: blob.type});
        recording.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        this.recordings.delete(id);
        return file;
    }

    async getPreview(options: { id: string }): Promise<MediaStream> {
        const {id} = options;
        const recording = this.recordings.get(id);

        return recording != null ? recording.stream : null;
    }

}

const MediaRecorder = new MediaRecorderWeb();

export {MediaRecorder};

import {registerWebPlugin} from '@capacitor/core';

registerWebPlugin(MediaRecorder);
