import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MemberService } from 'src/app/services/member/member.service';

@Component({
  selector: 'app-member-form',
  templateUrl: './member-form.component.html',
  styleUrls: ['./member-form.component.scss'],
})
export class MemberFormComponent implements OnInit {

  @Input() team = null;

  memberForm : FormGroup = this.fb.group({
    name : ['', Validators.required ]
  })


  constructor(private fb: FormBuilder,private memberService : MemberService) { }

  ngOnInit() {}

  addMember(){
    if(!this.memberForm.valid) return;

    const teamId = this.team.id;
    const member = this.memberForm.value;
    this.memberService.saveMember(teamId, member, null);
  }

}
