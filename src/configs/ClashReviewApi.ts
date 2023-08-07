/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { BeEvent } from "@itwin/core-bentley";
import { ColorDef, FeatureOverrideType } from "@itwin/core-common";
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
	private static _RMS_BASE_URL: string = "https://dev-connect-designvalidationrulemanagement.bentley.com/v3"; // QA - RMS Endpoint
	private static _RAS_BASE_URL: string = "https://dev-connect-resultsanalysisservice.bentley.com/v2"; // QA - RAS Endpoint
	private static _accessToken: string = ""; // JWT Token - Bearer keyword inclusive
	private static _changesetId: string = "";
	private static _modelsAndCategories: { [id: string]: any } = {};
	private static _mappings: { [id: string]: any } = {};
	private static _groupings: { [id: string]: any } = {};
	private static _ruleTemplates: { [id: string]: any } = {};
	public static onResultStatusChanged = new BeEvent<any>();

	public static setAccessToken(accessToken: string): void {
		ClashReviewApi._accessToken = accessToken;
	}

	private static async getLatestChangeSetIdForIModel(iModelId: string) {
		const response = await fetch(`https://dev-api.bentley.com/imodels/${iModelId}/changesets?$top=1&$orderBy=index desc`, {
			headers: {
				Accept: "application/vnd.bentley.itwin-platform.v2+json",
				Prefer: "return=minimal",
				Authorization: ClashReviewApi._accessToken,
			},
		});

		const changeSetData = await response.json();
		return changeSetData.changesets[0]?.id;
	}

	private static async getResultDetailsById(contextId: string, resultId: string) {
		const resultData = await fetch(`${ClashReviewApi._RAS_BASE_URL}/results/${resultId}`, {
			headers: {
				accept: "application/json",
				"itwin-id": contextId,
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

	private static async getAllRuleTemplates(projectId: string, continuationToken: string) {
		const response = await fetch(`${ClashReviewApi._RMS_BASE_URL}/contexts/${projectId}/ruletemplates`, {
			headers: {
				Authorization: ClashReviewApi._accessToken,
				continuationToken: continuationToken,
				pageSize: "50",
				accept: "application/json",
			},
		});

		const responseData = await response.json();

		if (responseData.hasMoreData) {
			const data = await ClashReviewApi.getAllRuleTemplates(projectId, responseData.continuationToken);
			responseData.rows = [...responseData.rows, ...data.rows];
			return responseData;
		} else {
			return responseData;
		}
	}

	public static async getClashTests(projectId: string): Promise<any> {
		const response = await fetch(`${ClashReviewApi._RMS_BASE_URL}/contexts/${projectId}/tests`, {
			headers: {
				accept: "application/json",
				"Include-User-Metadata": "false",
				Authorization: ClashReviewApi._accessToken,
			},
		});

		const responseData = await response.json();

		return responseData;
	}

	public static async getClashTestDetailById(projectId: string, testId: string) {
		const response = await fetch(
			`https://dev-connect-designvalidationrulemanagement.bentley.com/v3/contexts/${projectId}/tests/${testId}`,
			{
				headers: {
					Authorization: ClashReviewApi._accessToken,
					"Include-User-Metadata": "false",
				},
			}
		);

		const testDetails = await response.json();
		return testDetails;
	}

	public static async updateClashDetectionTest(projectId: string, testId: string, data: any) {
		const response = await fetch(
			`https://dev-connect-designvalidationrulemanagement.bentley.com/v3/contexts/${projectId}/tests/${testId}`,
			{
				method: "PUT",
				headers: {
					Authorization: ClashReviewApi._accessToken,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			}
		);

		const parsedResponse = await response.json();
		return parsedResponse;
	}

	public static async createClashDetectionTest(projectId: string, data: any) {
		const response = await fetch(`https://dev-connect-designvalidationrulemanagement.bentley.com/v3/contexts/${projectId}/tests`, {
			method: "POST",
			headers: {
				Authorization: ClashReviewApi._accessToken,
				"Content-Type": "application/json",
			},
			body: JSON.stringify([data]),
		});

		const parsedResponse = await response.json();
		return parsedResponse;
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
		if (process.env.REACT_APP_USE_LATEST_CHANGESET) {
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

	public static async getModelsAndCategories(iModelId: string, projectId: string) {
		if (ClashReviewApi._modelsAndCategories[iModelId] === undefined) {
			const response = await fetch(
				`https://dev-api.bentley.com/clashdetection/modelsAndCategories/imodels/${iModelId}?projectId=${projectId}`,
				{
					headers: {
						Authorization: ClashReviewApi._accessToken,
					},
				}
			);

			ClashReviewApi._modelsAndCategories[iModelId] = await response.json();
		}

		return ClashReviewApi._modelsAndCategories[iModelId];
	}

	public static async getMappingAndGrouping(iModelId: string) {
		if (ClashReviewApi._mappings[iModelId] === undefined) {
			const response = await fetch(`https://dev-api.bentley.com/insights/reporting/datasources/imodels/${iModelId}/mappings`, {
				headers: {
					Authorization: ClashReviewApi._accessToken,
				},
			});

			const parsedResponse = await response.json();
			const mappings = parsedResponse.mappings;

			for (const mapping of mappings) {
				const associatedGroups = await ClashReviewApi.getGroupsForMappingId(iModelId, mapping.id);
				mapping.subRows = associatedGroups.groups.map((group: any) => {
					return {
						...group,
						mappingId: mapping.id,
						name: group.groupName,
					};
				});
				mapping.name = mapping.mappingName;
			}

			ClashReviewApi._mappings[iModelId] = mappings;
		}

		return ClashReviewApi._mappings[iModelId];
	}

	public static async getGroupsForMappingId(iModelId: string, mappingId: string) {
		if (ClashReviewApi._groupings[mappingId] === undefined) {
			const response = await fetch(
				`https://dev-api.bentley.com/insights/reporting/datasources/imodels/${iModelId}/mappings/${mappingId}/groups`,
				{
					headers: {
						Authorization: ClashReviewApi._accessToken,
					},
				}
			);

			ClashReviewApi._groupings[mappingId] = await response.json();
		}

		return ClashReviewApi._groupings[mappingId];
	}

	public static async getSuppressionRules(projectId: string) {
		const response = await fetch(`${ClashReviewApi._RMS_BASE_URL}/contexts/${projectId}/suppressionrules`, {
			headers: {
				"Include-User-Metadata": "true",
				Authorization: ClashReviewApi._accessToken,
			},
		});

		const dataRows = await response.json();
		const filteredRows = dataRows.rows.filter((row: any) => row.templateId === "95d3e23f-e175-4979-b128-fff03fa231e3");

		return filteredRows;
	}

	public static async getRuleTemplates(projectId: string) {
		if (ClashReviewApi._ruleTemplates[projectId] === undefined) {
			ClashReviewApi._ruleTemplates[projectId] = await ClashReviewApi.getAllRuleTemplates(projectId, "");
		}

		return ClashReviewApi._ruleTemplates[projectId];
	}

	public static async createSuppressionRule(projectId: string, body: any) {
		const response = await fetch(`${ClashReviewApi._RMS_BASE_URL}/contexts/${projectId}/suppressionrules`, {
			method: "POST",
			headers: {
				Authorization: ClashReviewApi._accessToken,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		const responseData = await response.json();
		return responseData;
	}

	public static async updateSuppressionRule(projectId: string, ruleId: string, body: any) {
		const response = await fetch(`${ClashReviewApi._RMS_BASE_URL}/contexts/${projectId}/suppressionrules/${ruleId}`, {
			method: "PATCH",
			headers: {
				Authorization: ClashReviewApi._accessToken,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		const responseData = await response.json();
		return responseData;
	}

	public static async getSuppressionRuleDetailsById(projectId: string, ruleId: string) {
		const response = await fetch(`${ClashReviewApi._RMS_BASE_URL}/contexts/${projectId}/suppressionrules/${ruleId}`, {
			headers: {
				Authorization: ClashReviewApi._accessToken,
			},
		});

		const responseData = await response.json();
		return responseData;
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
