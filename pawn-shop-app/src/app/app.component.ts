import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { ToastContainerComponent } from "./shared/commons/toast-container/toast-container.component";

@Component({
  selector: 'app-root',
  standalone: true, 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterOutlet, ToastContainerComponent], 
})
export class AppComponent {
  title = 'pawn-shop-app';
}
