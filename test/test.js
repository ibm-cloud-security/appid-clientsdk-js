const assert = require('assert');
const AppIDClient = require('../sample/public/dist/AppIDClient');

import {A} from "../src/TokenValidator";
import {TokenValidator} from "../src/TokenValidator";
import {AppID} from "../src";
import {PopUpControllerMock} from "./mocks/PopUpControllerMock";

describe("AppID", () => {

	describe("signinWithPopup", () => {
		before(() => {
			// noinspection JSAnnotator
			let appId = new AppID({popup=new PopUpControllerMock()});
		});

		it("sha256", () => {
			const plain = getRandomString();
			let hashed = sha256(plain);
			chai.expect(string).to.have.lengthOf(43);
		})
	});

});