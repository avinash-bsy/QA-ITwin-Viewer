/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { useEffect, useMemo } from "react";
import { actions, ActionType } from "react-table";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { Table, DefaultCell } from "@itwin/itwinui-react";
import ClashReviewApi from "../configs/ClashReviewApi";
import { useClashContext } from "../context/ClashContext";
import "../App.scss";

interface TableRow extends Record<string, string> {
	name: string;
}

const ClashTestsWidget = () => {
	const iModelConnection = useActiveIModelConnection();
	const { clashTests, testsLoading, newRunRequested, setClashTests, setRuns, setTestsLoading, setRunsLoading, setNewRunRequested } =
		useClashContext();

	const columnDefinition = useMemo(() => {
		return [
			{
				Header: "Table",
				columns: [
					{
						id: "name",
						Header: "Name",
						accessor: "name",
						cellRenderer: (props: any) => (
							<DefaultCell {...props} style={{ display: "flex", justifyContent: "space-between" }}>
								{props.cellProps.row.original.name}
								{newRunRequested ? (
									<button disabled={true}>Loading</button>
								) : (
									<button className="play-button" onClick={(e) => handleRunCreation(e, props.cellProps.row.original.id)}>
										Run
									</button>
								)}
							</DefaultCell>
						),
					},
				],
			},
		];
	}, [clashTests, newRunRequested]);

	const tableStateSingleSelectReducer = (newState: any, action: ActionType): any => {
		switch (action.type) {
			case actions.toggleRowSelected: {
				return { ...newState, selectedRowIds: { [action.id]: action.value } };
			}
			default:
				break;
		}
		return newState;
	};

	const getClashTests = async (iTwinId: string) => {
		try {
			const data = await ClashReviewApi.getClashTests(iTwinId!);
			setClashTests(data.rows);
			setTestsLoading(false);
		} catch (error) {
			console.log(error);
		}
	};

	const onRowClick = async (_: any, row: any) => {
		if (iModelConnection) {
			setRunsLoading(true);
			row.toggleRowSelected(true);
			const runs = await ClashReviewApi.getClashRuns(iModelConnection.iTwinId!, row.original.id);
			setRuns(runs);
			setRunsLoading(false);
		}
	};

	const handleRunCreation = async (event: React.MouseEvent, testId: string) => {
		try {
			setNewRunRequested(true);
			const response = await ClashReviewApi.createTestRun(process.env.IMJS_IMODEL_ID!, testId);
			setRuns((runs) => {
				return [...runs, response];
			});
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		if (iModelConnection) {
			getClashTests(iModelConnection.iTwinId!);
		}
	}, [iModelConnection]);

	return (
		<Table<TableRow>
			data={clashTests}
			columns={columnDefinition}
			isLoading={testsLoading}
			isSortable
			onRowClick={onRowClick}
			stateReducer={tableStateSingleSelectReducer}
			emptyTableContent={"No tests"}
			density="extra-condensed"
			style={{ height: "100%" }}
			className={newRunRequested ? "loading" : ""}
		/>
	);
};

export class ClashTestsWidgetProvider implements UiItemsProvider {
	public readonly id: string = "ClashTestsWidgetProvider";

	public provideWidgets(
		_stageId: string,
		_stageUsage: string,
		location: StagePanelLocation,
		_section?: StagePanelSection
	): ReadonlyArray<AbstractWidgetProps> {
		const widgets: AbstractWidgetProps[] = [];
		if (location === StagePanelLocation.Left && _section === StagePanelSection.Start) {
			widgets.push({
				id: "ClashTestsWidget",
				label: "Tests",
				defaultState: WidgetState.Open,
				getWidgetContent: () => <ClashTestsWidget />,
			});
		}
		return widgets;
	}
}
