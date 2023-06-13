/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import "./index.scss";

import { BrowserAuthorizationCallbackHandler } from "@itwin/browser-authorization";
import React from "react";
import ReactDOM from "react-dom";

import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { ClashContextProvider } from "./context/ClashContext";
import { ThemeProvider } from "@itwin/itwinui-react";

globalThis.IMJS_URL_PREFIX = process.env.REACT_APP_IMJS_URL_PREFIX || "";

if (!process.env.REACT_APP_IMJS_AUTH_CLIENT_CLIENT_ID) {
	throw new Error("Please add a valid OIDC client id to the .env file and restart the application. See the README for more information.");
}
if (!process.env.REACT_APP_IMJS_AUTH_CLIENT_SCOPES) {
	throw new Error(
		"Please add valid scopes for your OIDC client to the .env file and restart the application. See the README for more information."
	);
}
if (!process.env.REACT_APP_IMJS_AUTH_CLIENT_REDIRECT_URI) {
	throw new Error("Please add a valid redirect URI to the .env file and restart the application. See the README for more information.");
}

globalThis.IMJS_URL_PREFIX = process.env.REACT_APP_IMJS_URL_PREFIX || "";

const redirectUrl = new URL(process.env.REACT_APP_IMJS_AUTH_CLIENT_REDIRECT_URI);

if (redirectUrl.pathname === window.location.pathname) {
	BrowserAuthorizationCallbackHandler.handleSigninCallback(redirectUrl.toString()).catch(console.error);
} else {
	ReactDOM.render(
		<React.StrictMode>
			<ClashContextProvider>
				<ThemeProvider theme={"os"}>
					<App />
				</ThemeProvider>
			</ClashContextProvider>
		</React.StrictMode>,
		document.getElementById("root")
	);
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
