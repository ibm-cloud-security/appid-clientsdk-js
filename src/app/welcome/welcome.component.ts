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
      clientId: '1b0e3658-fc1f-402e-843c-18402d4dbe58',
      discoveryEndpoint: 'https://eu-gb.appid.test.cloud.ibm.com/oauth/v4/5b1eb5f1-34bd-41fd-b6dd-e257c188a4dd/.well-known/openid-configuration'
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
