import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FaceApiComponent } from './face-api/face-api.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FaceApiComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'face-detection';
}
