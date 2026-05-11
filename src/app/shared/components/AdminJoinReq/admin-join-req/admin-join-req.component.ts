import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from "@angular/router";


@Component({
  selector: 'app-admin-join-req',
  imports: [RouterLink],
  templateUrl: './admin-join-req.component.html',
  styleUrl: './admin-join-req.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class AdminJoinReqComponent {

}
