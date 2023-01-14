import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { TeamService } from 'src/app/services/team/team.service';

@Component({
  selector: 'app-team-form',
  templateUrl: './team-form.component.html',
  styleUrls: ['./team-form.component.scss'],
})
export class TeamFormComponent implements OnInit {

  teamForm : FormGroup = this.fb.group({
    name: ['', Validators.required],
  })

  constructor(private fb: FormBuilder, private teamService: TeamService) { }

  ngOnInit() {}

  addTeam(){
    if(!this.teamForm.valid) return;

    const team = this.teamForm.value;
    this.teamService.saveTeam(team,null);
  }

}
