/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { useCallback, useEffect, useMemo, useState } from "react";
import { actions, ActionType, MetaBase, TableState } from "react-table";
import { StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState, Widget } from "@itwin/appui-react";
import { Table, DefaultCell, ExpandableBlock } from "@itwin/itwinui-react";
import { useClashContext } from "../context/ClashContext";
import ClashReviewApi from "../configs/ClashReviewApi";

interface TableRow extends Record<string, string> {
	time: string;
	count: string;
}

const ClashRunsWidget = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { runs, setRuns, setNewRunRequested, setClashResults, runId, testId, setRunId, iTwinId } = useClashContext();

	const getJobStatusText = useCallback((jobStatus: string) => {
		const statusMap: { [id: string]: any } = {
			"-1": "Queued",
			"0": "Started",
			"1": "Completed",
			"2": "Failed",
			"3": "DownloadingiModel",
			"4": "StoringResults",
			"5": "ValidationInProgress",
			"6": "ValidationLimited",
			"7": "Cancelled",
			"8": "FailedSuppressionRules",
			"9": "CompletedWithElementLoadErrors",
		};

		return statusMap[jobStatus];
	}, []);

	const columnDefinition = useMemo(
		() => [
			{
				Header: "Table",
				columns: [
					{
						Header: "Time",
						accessor: "execution_time",
					},
					{
						Header: "Count",
						accessor: "count",
					},
					{
						Header: "Job-Status",
						accessor: "job_status",
						cellRenderer: (props: any) => (
							<DefaultCell {...props}>{getJobStatusText(props.cellProps.row.original.job_status)}</DefaultCell>
						),
					},
				],
			},
		],
		[runs]
	);

	const onRowClick = useCallback(
		async (_: any, row: any) => {
			row.toggleRowSelected(true);
			setRunId(row.original.id);
		},
		[runs]
	);

	const tableStateSingleSelectReducer = (newState: any, action: any): any => {
		switch (action.type) {
			case actions.toggleRowSelected: {
				return { ...newState, selectedRowIds: { [action.id]: action.value } };
			}
			default:
				break;
		}
		return newState;
	};

	const getClashRuns = async () => {
		setIsLoading(true);
		const clashRuns = await ClashReviewApi.getClashRuns(iTwinId, testId);
		setRunId(clashRuns[0]?.id);
		setRuns(clashRuns);
		setIsLoading(false);
	};

	const onExpand = () => {
	}

	useEffect(() => {
		const removeListener = ClashReviewApi.onResultStatusChanged.addListener(
			(clashTestRuns: any, exitCode: boolean, selectedRunId: string, clashResultData: any) => {
				setRuns((runs) => {
					return [...clashTestRuns];
				});

				if (runId === selectedRunId) {
					setClashResults([...clashResultData]);
				}

				if (exitCode) {
					setNewRunRequested(null);
				}
			}
		);

		return () => {
			removeListener();
		};
	}, [runId]);

	useEffect(() => {
		if (testId) {
			getClashRuns();
		}
	}, [testId]);

	return (
		<Table<TableRow>
			data={runs}
			columns={columnDefinition}
			onRowClick={onRowClick}
			isLoading={isLoading}
			initialState={{
				selectedRowIds: {
					0: true,
				},
			}}
			stateReducer={tableStateSingleSelectReducer}
			emptyTableContent={"No runs"}
			density="extra-condensed"
			style={{ height: "100%" }}
			subComponent={ClashHistory}
			onExpand={onExpand}
		/>
	);
};

export class ClashRunsWidgetProvider implements UiItemsProvider {
	public readonly id: string = "ClashRunsWidgetProvider";

	public provideWidgets(
		_stageId: string,
		_stageUsage: string,
		location: StagePanelLocation,
		_section?: StagePanelSection
	): ReadonlyArray<Widget> {
		const widgets: Widget[] = [];
		if (location === StagePanelLocation.Left && _section === StagePanelSection.End) {
			widgets.push({
				id: "ClashRunsWidget",
				label: "Runs",
				defaultState: WidgetState.Open,
				content: <ClashRunsWidget />,
			});
		}
		return widgets;
	}
}

const ClashHistory = (row:any) => {
	const {iTwinId} = useClashContext()
	const [clashHistory, setClashHistory] = useState([])

	useEffect(() => {
		const initApp = async () => {
			const clashHistory = await ClashReviewApi.getClashEvolutionDetails(iTwinId, row.original.id)
			setClashHistory(clashHistory.rows)
		}

		initApp()
	}, [])

	return <div style={{width:"100%"}}>
		{
			clashHistory.map((row:any) => (
				<div key={row.testRunId} >
					<ExpandableBlock title={new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'medium'}).format(new Date(row.executedAt))} style={{width:"90%", margin:"auto"}}>
						<span style={{fontSize:"16px"}}><strong>{row.changesetName}</strong></span>
						<hr />
						<table style={{width : "100%"}}>
							<tr>
								<th style={{textAlign:"center"}}>New</th>
								<th style={{textAlign:"center"}}>Open</th>
								<th style={{textAlign:"center"}}>Resolved</th>
							</tr>
							<tr>
								<td style={{textAlign:"center"}}>{row.status.new}</td>
								<td style={{textAlign:"center"}}>{row.status.open}</td>
								<td style={{textAlign:"center"}}>{row.status.resolved}</td>
							</tr>
						</table>
					</ExpandableBlock>
				</div>
			))
		}
	</div>
}

