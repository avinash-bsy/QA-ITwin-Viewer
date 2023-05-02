/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { BeEvent, BeDuration } from "@itwin/core-bentley";
import { ColorDef, FeatureOverrideType } from "@itwin/core-common";
import { CoreTools } from "@itwin/appui-react";
import { EmphasizeElements, IModelApp, ViewChangeOptions, FitViewTool } from "@itwin/core-frontend";

class HelperMethods {
	public static structureDataForRunWidget(data: any) {
		const clash = data.resultMetadata;
		const structuredResultData = {
			id: clash.id,
			execution_time: new Date(clash.executed).toLocaleString(),
			count: clash.numIssues,
			job_status: clash.status,
		};

		return structuredResultData;
	}

	public static structureDataForResultWidget(data: any) {
		const categoryListMap: { [id: string]: string } = {};
		data.result.categoryList.map((category: any) => {
			categoryListMap[category.id] = category.label;
		});

		const structuredResultData = data.result.clashes.map((clash: any) => {
			return {
				elementALabel: clash.elementALabel,
				elementAId: clash.elementAId,
				elementACategory: categoryListMap[clash.elementACategoryId],
				elementBLabel: clash.elementBLabel,
				elementBId: clash.elementBId,
				elementBCategory: categoryListMap[clash.elementBCategoryId],
				clashType: clash.clashType,
				status: clash.status,
			};
		});

		return structuredResultData;
	}
}

export default class ClashReviewApi extends HelperMethods {
	private static _clashTests: { [id: string]: any } = {}; // List of all clash tests
	private static _clashTestRuns: { [id: string]: any } = {}; // List of all runs for a test
	private static _clashRuns: { [id: string]: any } = {}; // List of all runs for a project
	private static _clashResults: { [id: string]: any } = {}; // List of clash results for a run
	private static _RMS_BASE_URL: string = "https://qa-connect-designvalidationrulemanagement.bentley.com/v3"; // QA - RMS Endpoint
	private static _RAS_BASE_URL: string = "https://qa-connect-resultsanalysisservice.bentley.com/v2"; // QA - RAS Endpoint
	private static _accessToken: string = ""; // JWT Token - Bearer keyword inclusive
	private static _changesetId: string = "";
	public static onResultStatusChanged = new BeEvent<any>();

	public static setAccessToken(accessToken: string): void {
		ClashReviewApi._accessToken = accessToken;
	}

	private static async getLatestChangeSetIdForIModel(iModelId: string) {
		const response = await fetch(`https://qa-api.bentley.com/imodels/${iModelId}/changesets?$top=1&$orderBy=index desc`, {
			headers: {
				Accept: "application/vnd.bentley.itwin-platform.v2+json",
				Prefer: "return=minimal",
				Authorization: ClashReviewApi._accessToken,
			},
		});

		const changeSetData = await response.json();
		return changeSetData.changeSets[0]?.id;
	}

	private static async getResultDetailsById(contextId: string, resultId: string) {
		const resultData = await fetch(`${ClashReviewApi._RAS_BASE_URL}/results/${resultId}`, {
			headers: {
				accept: "application/json",
				context: contextId,
				Authorization: ClashReviewApi._accessToken,
			},
		});

		const rowData = await resultData.json();
		return rowData;
	}

	private static pollForResultStatusChange(contextId: string, resultId: string, testId: string): void {
		const timer = setInterval(async () => {
			const resultData = await ClashReviewApi.getResultDetailsById(contextId, resultId);
			const structuredRunData = ClashReviewApi.structureDataForRunWidget(resultData);
			const structuredResultData = ClashReviewApi.structureDataForResultWidget(resultData);

			const index = ClashReviewApi._clashTestRuns[testId].findIndex((elem: any) => elem.id === structuredRunData.id);
			if (index != -1) {
				ClashReviewApi._clashTestRuns[testId][index] = structuredRunData;
			} else {
				ClashReviewApi._clashTestRuns[testId].push(structuredRunData);
			}

			ClashReviewApi._clashResults[resultId] = structuredResultData;

			if ([1, 2, 7, 9].includes(structuredRunData.job_status)) {
				clearInterval(timer);
			}

			ClashReviewApi.onResultStatusChanged.raiseEvent(
				ClashReviewApi._clashTestRuns[testId],
				[1, 2, 7, 9].includes(structuredRunData.job_status),
				resultId,
				ClashReviewApi._clashResults[resultId]
			);
		}, 5000);
	}

	public static async getClashTests(projectId: string): Promise<any> {
		if (ClashReviewApi._clashTests[projectId] === undefined) {
			const response = await fetch(`${ClashReviewApi._RMS_BASE_URL}/contexts/${projectId}/tests`, {
				headers: {
					accept: "application/json",
					"Include-User-Metadata": "false",
					Authorization: ClashReviewApi._accessToken,
				},
			});

			ClashReviewApi._clashTests[projectId] = response.json();
		}

		return ClashReviewApi._clashTests[projectId];
	}

	public static async getClashRuns(projectId: string, testId: string): Promise<any> {
		if (ClashReviewApi._clashRuns[projectId] === undefined) {
			const response = await fetch(`${ClashReviewApi._RAS_BASE_URL}/results`, {
				headers: {
					accept: "application/json",
					"itwin-id": projectId,
					Authorization: ClashReviewApi._accessToken,
				},
			});

			const data = await response.json();
			ClashReviewApi._clashRuns[projectId] = data;
		}

		if (ClashReviewApi._clashTestRuns[testId] === undefined) {
			const data = ClashReviewApi._clashRuns[projectId];
			if (data !== undefined) {
				let clashRuns = [];
				for (let row of data.rows) {
					if (row.configurationId === testId && row.configurationType === 2) {
						clashRuns.push({
							id: row.id,
							execution_time: new Date(row.executed).toLocaleString(),
							count: row.numIssues,
							job_status: row.status,
						});
					}
				}

				ClashReviewApi._clashTestRuns[testId] = clashRuns;
			}
		}

		return ClashReviewApi._clashTestRuns[testId];
	}

	public static async getClashResults(contextId: string, resultId: string): Promise<any> {
		if (ClashReviewApi._clashResults[resultId] === undefined) {
			const resultData = await ClashReviewApi.getResultDetailsById(contextId, resultId);
			ClashReviewApi._clashResults[resultId] = ClashReviewApi.structureDataForResultWidget(resultData);
		}

		return ClashReviewApi._clashResults[resultId];
	}

	public static async submitTestRunRequest(contextId: string, projectId: string, testId: string): Promise<any> {
		if (process.env.USE_LATEST_CHANGESET) {
			ClashReviewApi._changesetId = await ClashReviewApi.getLatestChangeSetIdForIModel(projectId);
		} else {
			ClashReviewApi._changesetId = process.env.IMJS_CHANGESET_ID!;
		}

		const data = [
			{
				iModelId: projectId,
				changesetId: ClashReviewApi._changesetId,
				configurationId: testId,
				testSettings: {
					resultsLimit: 100,
				},
			},
		];

		const response = await fetch(`${ClashReviewApi._RMS_BASE_URL}/contexts/${contextId}/tests/run`, {
			method: "POST",
			headers: {
				accept: "application/json",
				Authorization: ClashReviewApi._accessToken,
				"Content-Type": "application/json",
				"In-Place": "force",
			},
			body: JSON.stringify(data),
		});

		const responseData = await response.json();

		const resultId = responseData.status[0].resultId;

		const resultData = await ClashReviewApi.getResultDetailsById(contextId, resultId);
		const structuredRunData = ClashReviewApi.structureDataForRunWidget(resultData);
		ClashReviewApi.pollForResultStatusChange(contextId, resultId, testId);

		return structuredRunData;
	}

	public static visualizeClash(elementAId: string, elementBId: string, isMarkerClick: boolean) {
		if (!IModelApp.viewManager.selectedView) return;

		const vp = IModelApp.viewManager.selectedView;
		const provider = EmphasizeElements.getOrCreate(vp);
		provider.clearEmphasizedElements(vp);
		provider.clearOverriddenElements(vp);
		provider.overrideElements(elementAId, vp, ColorDef.red, FeatureOverrideType.ColorOnly, true);
		provider.overrideElements(elementBId, vp, ColorDef.blue, FeatureOverrideType.ColorOnly, false);
		provider.wantEmphasis = true;
		provider.emphasizeElements([elementAId, elementBId], vp, undefined, false);

		const viewChangeOpts: ViewChangeOptions = {};
		viewChangeOpts.animateFrustumChange = true;
		vp.zoomToElements([elementAId, elementBId], { ...viewChangeOpts }).catch((error) => {
			console.error(error);
		});
	}

	public static resetDisplay() {
		if (!IModelApp.viewManager.selectedView) return;

		const vp = IModelApp.viewManager.selectedView;
		const provider = EmphasizeElements.getOrCreate(vp);
		provider.clearEmphasizedElements(vp);
		provider.clearOverriddenElements(vp);
		IModelApp.tools.run(FitViewTool.toolId, IModelApp.viewManager.selectedView, true);
	}
}
