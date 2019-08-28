import { Component } from '@angular/core';
declare const AppID: any;

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent {
  show = false;
  userName = 'To get started Login or Sign up below';
  idToken = '';
  userData = '';
  buttonDisplay = 'show';
  credentials = 'hide';

  async onLoginClick() {
    const appid = new AppID();
    await appid.init({
      clientId: '<SPA_CLIENT_ID>',
      discoveryEndpoint: '<WELL_KNOWN_ENDPOINT>'
    });
    const tokens = await appid.signinWithPopup();
    const userInfo =  await appid.getUserInfo(tokens.accessToken);
    const decodeTokens = tokens.idTokenPayload;
    this.userName = 'Welcome ' + decodeTokens.name;
    this.buttonDisplay = 'hide';
    this.idToken = JSON.stringify(decodeTokens);
    this.userData = JSON.stringify(userInfo);
    this.credentials = 'show';
  }
}
