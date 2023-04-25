/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { BeEvent } from "@itwin/core-bentley";
import { ColorDef, FeatureOverrideType } from "@itwin/core-common";
import { EmphasizeElements, IModelApp, ViewChangeOptions } from "@itwin/core-frontend";

export default class ClashReviewApi {
	public static onResultStatusChanged = new BeEvent<any>();
	private static _clashTests: { [id: string]: any } = {};
	private static _clashTestRuns: { [id: string]: any } = {};
	private static _clashRuns: { [id: string]: any } = {};
	private static _clashResults: { [id: string]: any } = {};
	private static _RMS_BASE_URL: string = "https://qa-connect-designvalidationrulemanagement.bentley.com/v3";
	private static _RAS_BASE_URL: string = "https://qa-connect-resultsanalysisservice.bentley.com/v2";
	private static _accessToken: string = "";
	private static _changesetId: string = "";

	public static setAccessToken(accessToken: string): void {
		ClashReviewApi._accessToken = accessToken;
	}

	public static async createTestRun(projectId: string, testId: string): Promise<any> {
		if (ClashReviewApi._changesetId === "") {
			if (process.env.USE_LATEST_CHANGESET) {
				ClashReviewApi._changesetId = await ClashReviewApi.getLatestChangeSetIdForIModel(projectId);
			} else {
				ClashReviewApi._changesetId = process.env.IMJS_CHANGESET_ID!;
			}
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

		const response = await fetch(`${ClashReviewApi._RMS_BASE_URL}/contexts/${process.env.IMJS_CONTEXT_ID}/tests/run`, {
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

		const newResultData = await ClashReviewApi.getResultDetails(resultId);

		ClashReviewApi.checkResultStatus(resultId, testId);

		return newResultData;
	}

	private static async getResultDetails(resultId: string) {
		const resultData = await fetch(`${ClashReviewApi._RAS_BASE_URL}/results/${resultId}`, {
			headers: {
				accept: "application/json",
				context: process.env.IMJS_CONTEXT_ID!,
				Authorization: ClashReviewApi._accessToken,
			},
		});

		const rowData = await resultData.json();

		const clash = rowData.resultMetadata;
		const structuredResultData = {
			id: clash.id,
			execution_time: new Date(clash.executed).toLocaleString(),
			count: clash.numIssues,
			job_status: clash.status,
		};

		return structuredResultData;
	}

	private static checkResultStatus(resultId: string, testId: string): void {
		const timer = setInterval(async () => {
			const structuredResultData = await ClashReviewApi.getResultDetails(resultId);

			const index = ClashReviewApi._clashTestRuns[testId].findIndex((elem: any) => elem.id === structuredResultData.id);

			if (index != -1) {
				ClashReviewApi._clashTestRuns[testId][index] = structuredResultData;
			} else {
				ClashReviewApi._clashTestRuns[testId].push(structuredResultData);
			}

			if ([1, 2, 7, 9].includes(structuredResultData.job_status)) {
				clearInterval(timer);
			}

			ClashReviewApi.onResultStatusChanged.raiseEvent(
				ClashReviewApi._clashTestRuns[testId],
				[1, 2, 7, 9].includes(structuredResultData.job_status),
				testId
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

	public static async getClashResults(projectId: string, resultId: string): Promise<any> {
		if (ClashReviewApi._clashResults[resultId] === undefined) {
			const response = await fetch(`${ClashReviewApi._RAS_BASE_URL}/results/${resultId}`, {
				headers: {
					accept: "application/json",
					context: projectId,
					Authorization: ClashReviewApi._accessToken,
				},
			});

			const data = await response.json();
			ClashReviewApi._clashResults[resultId] = data.result.clashes.map((clash: any) => {
				return {
					elementALabel: clash.elementALabel,
					elementAId: clash.elementAId,
					elementACategory: clash.elementACategoryId,
					elementBLabel: clash.elementBLabel,
					elementBId: clash.elementBId,
					elementBCategory: clash.elementBCategoryId,
					clashType: clash.clashType,
					status: clash.status,
				};
			});
		}

		return ClashReviewApi._clashResults[resultId];
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
	}
}
