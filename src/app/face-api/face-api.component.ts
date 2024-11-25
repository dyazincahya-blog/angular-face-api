import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-face-api',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './face-api.component.html',
  styleUrls: ['./face-api.component.scss'],
})
export class FaceApiComponent implements OnInit {
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;

  private videoStream: MediaStream | null = null; // Store the video stream

  smileValue: string = 'No face detected';
  blinkStatus: string = 'Eyes open';
  mouthStatus: string = 'Mouth closed';
  headPose: string = 'Head position normal';
  ageGender: string = 'Age: N/A, Gender: N/A';

  async ngOnInit() {
    await this.loadModels();
    this.startVideo();
  }

  async loadModels() {
    // OFFLINE MODELS
    const MODEL_URL = '/assets/models';

    // ONLINE MODELS >> uncomment this part if you want using online models
    // const MODEL_URL = `https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights`;
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL), // For age and gender detection
    ]);
    console.log('Models loaded successfully');
  }

  startVideo() {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        this.videoStream = stream; // Store the stream for later use
        const video = this.videoElement.nativeElement;
        video.srcObject = stream;

        video.onloadedmetadata = () => {
          video.play();
          video.width = video.videoWidth;
          video.height = video.videoHeight;
          this.onPlay();
        };
      })
      .catch((err) => console.error('Error accessing webcam: ', err));
  }

  stopVideo() {
    if (this.videoStream) {
      // Stop all tracks in the stream
      this.videoStream.getTracks().forEach((track) => track.stop());
      this.videoStream = null;
    }

    const video = this.videoElement.nativeElement;
    video.pause();
    video.srcObject = null; // Clear the video source
  }

  async onPlay() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;

    video.addEventListener('play', () => {
      const displaySize = {
        width: video.videoWidth,
        height: video.videoHeight,
      };

      faceapi.matchDimensions(canvas, displaySize);

      setInterval(async () => {
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          console.error('Video dimensions are invalid.');
          return;
        }

        const detections = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions()
          .withAgeAndGender();

        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);

        if (detections) {
          const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
          );
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

          // Smile Detection
          const happyExpression = detections.expressions.happy || 0;
          this.smileValue =
            happyExpression > 0.5
              ? `Smiling: ${(happyExpression * 100).toFixed(1)}%`
              : 'No smile detected';

          // Blink Detection
          const landmarks = detections.landmarks;
          const leftEye = landmarks.getLeftEye();
          const rightEye = landmarks.getRightEye();
          const leftEyeBlink = this.calculateEyeAspectRatio(leftEye);
          const rightEyeBlink = this.calculateEyeAspectRatio(rightEye);

          this.blinkStatus =
            leftEyeBlink < 0.27 && rightEyeBlink < 0.27
              ? 'Eyes closed'
              : 'Eyes open';

          // Mouth Openness Detection
          const mouth = landmarks.getMouth();
          const mouthOpenness = this.calculateMouthOpenness(mouth);
          this.mouthStatus =
            mouthOpenness > 0.3 ? 'Mouth open' : 'Mouth closed';

          // Head Pose Detection
          const nose = landmarks.getNose();
          this.headPose = this.detectHeadPose(nose);

          // Age and Gender Detection
          this.ageGender = `Age: ${Math.round(detections.age)}, Gender: ${
            detections.gender
          }`;
        } else {
          this.smileValue = 'No face detected';
          this.blinkStatus = 'No face detected';
          this.mouthStatus = 'No face detected';
          this.headPose = 'No face detected';
          this.ageGender = 'Age: N/A, Gender: N/A';
        }
      }, 200);
    });
  }

  captureFrameAsBase64(): void {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;

    if (video.videoWidth && video.videoHeight) {
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame onto the canvas
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get the base64 representation of the image
      const base64Image = canvas.toDataURL('image/png');
      console.log('Base64 Image:', base64Image);
      // return base64Image;
    } else {
      console.log('Cannot capture frame: Video dimensions are invalid.');
    }
    // return '';
  }

  calculateEyeAspectRatio(eye: faceapi.Point[]): number {
    const vertical1 = this.distance(eye[1], eye[5]);
    const vertical2 = this.distance(eye[2], eye[4]);
    const horizontal = this.distance(eye[0], eye[3]);

    return (vertical1 + vertical2) / (2 * horizontal);
  }

  calculateMouthOpenness(mouth: faceapi.Point[]): number {
    const vertical = this.distance(mouth[13], mouth[19]); // Top and bottom lip
    const horizontal = this.distance(mouth[12], mouth[16]); // Left and right corners

    return vertical / horizontal;
  }

  detectHeadPose(nose: faceapi.Point[]): string {
    const dx = nose[0].x - nose[3].x; // Horizontal distance
    const dy = nose[0].y - nose[3].y; // Vertical distance

    if (dx > 10) return 'Head tilted left';
    if (dx < -10) return 'Head tilted right';
    if (dy > 10) return 'Head tilted down';
    if (dy < -10) return 'Head tilted up';
    return 'Head position normal';
  }

  distance(point1: faceapi.Point, point2: faceapi.Point): number {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
