import { Component, Input, OnInit } from '@angular/core';
import { MemberService } from 'src/app/services/member/member.service';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
})
export class MemberComponent implements OnInit {
  @Input() member = null;
  @Input() team = null;

  constructor(private memberService : MemberService) { }

  ngOnInit() {}

  deleteMember(memberId : string){
    const teamId = this.team.id;
    this.memberService.deleteMember(teamId, memberId);
  }

}
