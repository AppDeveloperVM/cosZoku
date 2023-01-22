import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { UserService } from 'src/app/services/user/user.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ProfileComponent } from 'src/app/components/profile/profile.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { TeamService } from 'src/app/services/team/team.service';
import { TeamFormComponent } from 'src/app/components/team-form/team-form.component';
import { TeamItemComponent } from 'src/app/components/team-item/team-item.component';
import { MemberComponent } from 'src/app/components/member/member.component';
import { MemberFormComponent } from 'src/app/components/member-form/member-form.component';
import { CosItemComponent } from 'src/app/components/cos-item/cos-item.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HomePageRoutingModule,
  ],
  declarations: [HomePage, ProfileComponent, HeaderComponent,TeamFormComponent,TeamItemComponent,CosItemComponent, MemberComponent, MemberFormComponent],
  providers: [UserService, AuthService, TeamService]
})
export class HomePageModule {}
