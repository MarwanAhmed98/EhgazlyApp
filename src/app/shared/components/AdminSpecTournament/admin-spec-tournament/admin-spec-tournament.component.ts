import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminTournamentsService } from '../../../../core/services/AdminTournaments/admin-tournaments.service';
import { ActivatedRoute } from '@angular/router';
import { IAdminSpecTournament } from '../../../interfaces/iadmin-spec-tournament';

@Component({
  selector: 'app-admin-spec-tournament',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-spec-tournament.component.html',
  styleUrl: './admin-spec-tournament.component.scss'
})
export class AdminSpecTournamentComponent implements OnInit {
  private adminTournamentsService = inject(AdminTournamentsService);
  private readonly activatedRoute = inject(ActivatedRoute);

  SpecDetails: IAdminSpecTournament = {} as IAdminSpecTournament;
  productid: any;

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe({
      next: (res) => {
        this.productid = res.get('id');
        if (this.productid) {
          this.adminTournamentsService.ShowSpecificCourt(this.productid).subscribe({
            next: (res) => {
              this.SpecDetails = res.data;
            },
            error: (err) => {
              console.error('Failed to load tournament', err);
            }
          });
        }
      }
    });
  }
}