/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import "./App.scss";

import { BrowserAuthorizationClient } from "@itwin/browser-authorization";
import type { ScreenViewport } from "@itwin/core-frontend";
import { FitViewTool, IModelApp, StandardViewId } from "@itwin/core-frontend";
import { FillCentered } from "@itwin/core-react";
import { ProgressLinear } from "@itwin/itwinui-react";
import { MeasureTools, MeasureToolsUiItemsProvider } from "@itwin/measure-tools-react";
import { PropertyGridManager, PropertyGridUiItemsProvider } from "@itwin/property-grid-react";
import { TreeWidget } from "@itwin/tree-widget-react";
import {
	useAccessToken,
	Viewer,
	ViewerContentToolsProvider,
	ViewerNavigationToolsProvider,
	ViewerPerformance,
} from "@itwin/web-viewer-react";
import React, { useCallback, useEffect, useMemo } from "react";

import { ClashTestsWidgetProvider } from "./widgets/ClashTestsWidget";
import { ClashRunsWidgetProvider } from "./widgets/ClashRunsWidget";
import { ClashResultsWidgetProvider } from "./widgets/ClashResultsWidget";

import { history } from "./configs/history";
import ClashReviewApi from "./configs/ClashReviewApi";
import { useClashContext } from "./context/ClashContext";
import { CustomNavigationToolsProvider } from "./components/RefreshButton";

const App: React.FC = () => {
	const { iTwinId, iModelId, setIModelId, setITwinId } = useClashContext();

	const accessToken = useAccessToken();

	const authClient = useMemo(
		() =>
			new BrowserAuthorizationClient({
				scope: process.env.REACT_APP_IMJS_AUTH_CLIENT_SCOPES ?? "",
				clientId: process.env.REACT_APP_IMJS_AUTH_CLIENT_CLIENT_ID ?? "",
				redirectUri: process.env.REACT_APP_IMJS_AUTH_CLIENT_REDIRECT_URI ?? "",
				postSignoutRedirectUri: process.env.REACT_APP_IMJS_AUTH_CLIENT_LOGOUT_URI,
				responseType: "code",
				authority: process.env.REACT_APP_IMJS_AUTH_AUTHORITY,
			}),
		[]
	);

	const login = useCallback(async () => {
		try {
			await authClient.signInSilent();
		} catch {
			await authClient.signIn();
		}
	}, [authClient]);

	useEffect(() => {
		void login();
	}, [login]);

	useEffect(() => {
		if (accessToken) {
			const urlParams = new URLSearchParams(window.location.search);
			if (urlParams.has("iTwinId")) {
				setITwinId(urlParams.get("iTwinId") as string);
			} else {
				if (!process.env.REACT_APP_IMJS_ITWIN_ID) {
					throw new Error(
						"Please add a valid iTwin ID in the .env file and restart the application or add it to the iTwinId query parameter in the url and refresh the page. See the README for more information."
					);
				} else {
					setITwinId(process.env.REACT_APP_IMJS_ITWIN_ID!);
				}
			}

			if (urlParams.has("iModelId")) {
				setIModelId(urlParams.get("iModelId") as string);
			} else {
				setIModelId(process.env.REACT_APP_IMJS_IMODEL_ID!);
			}

			ClashReviewApi.setAccessToken(accessToken);
		}
	}, [accessToken]);

	useEffect(() => {
		if (accessToken && iTwinId) {
			let queryString = `?iTwinId=${iTwinId}`;
			if (iModelId) {
				queryString += `&iModelId=${iModelId}`;
			}

			history.push(queryString);
		}
	}, [accessToken, iTwinId, iModelId]);

	/** NOTE: This function will execute the "Fit View" tool after the iModel is loaded into the Viewer.
	 * This will provide an "optimal" view of the model. However, it will override any default views that are
	 * stored in the iModel. Delete this function and the prop that it is passed to if you prefer
	 * to honor default views when they are present instead (the Viewer will still apply a similar function to iModels that do not have a default view).
	 */
	const viewConfiguration = useCallback((viewPort: ScreenViewport) => {
		// default execute the fitview tool and use the iso standard view after tile trees are loaded
		const tileTreesLoaded = () => {
			return new Promise((resolve, reject) => {
				const start = new Date();
				const intvl = setInterval(() => {
					if (viewPort.areAllTileTreesLoaded) {
						ViewerPerformance.addMark("TilesLoaded");
						ViewerPerformance.addMeasure("TileTreesLoaded", "ViewerStarting", "TilesLoaded");
						clearInterval(intvl);
						resolve(true);
					}
					const now = new Date();
					// after 20 seconds, stop waiting and fit the view
					if (now.getTime() - start.getTime() > 20000) {
						reject();
					}
				}, 100);
			});
		};

		tileTreesLoaded().finally(() => {
			void IModelApp.tools.run(FitViewTool.toolId, viewPort, true, false);
			viewPort.view.setStandardRotation(StandardViewId.Iso);
		});
	}, []);

	const viewCreatorOptions = useMemo(() => ({ viewportConfigurer: viewConfiguration }), [viewConfiguration]);

	const onIModelAppInit = useCallback(async () => {
		await TreeWidget.initialize();
		await PropertyGridManager.initialize();
		await MeasureTools.startup();
	}, []);

	return (
		<div className="viewer-container">
			{!accessToken && (
				<FillCentered>
					<div className="signin-content">
						<ProgressLinear indeterminate={true} labels={["Signing in..."]} />
					</div>
				</FillCentered>
			)}
			<Viewer
				iTwinId={iTwinId ?? ""}
				iModelId={iModelId ?? ""}
				authClient={authClient}
				viewCreatorOptions={viewCreatorOptions}
				enablePerformanceMonitors={true} // see description in the README (https://www.npmjs.com/package/@itwin/web-viewer-react)
				onIModelAppInit={onIModelAppInit}
				uiProviders={[
					new ClashTestsWidgetProvider(),
					new ClashRunsWidgetProvider(),
					new ClashResultsWidgetProvider(),
					new CustomNavigationToolsProvider(),
					new ViewerContentToolsProvider({
						vertical: {
							measureGroup: false,
						},
					}),
					new ViewerNavigationToolsProvider(),
					new PropertyGridUiItemsProvider({
						enableCopyingPropertyText: true,
					}),
					new MeasureToolsUiItemsProvider(),
				]}
			/>
		</div>
	);
};

export default App;
