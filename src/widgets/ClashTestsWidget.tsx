/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { useEffect, useMemo, useState, useCallback } from "react";
import { actions, ActionType, MetaBase, TableState } from "react-table";
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
	const [isAutoSelect, setIsAutoSelect] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { clashTests, newRunRequested, setClashTests, setNewRunRequested, setTestId, setRuns } = useClashContext();

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
								{props.cellProps.row.original.id === newRunRequested ? (
									<button disabled={true}>Loading</button>
								) : (
									<button
										className="play-button"
										disabled={newRunRequested !== null}
										onClick={(e) => handleRunCreation(e, props.cellProps.row.original.id)}>
										Run
									</button>
								)}
							</DefaultCell>
						),
					},
				],
			},
		];
	}, [newRunRequested]);

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
			setIsLoading(true);
			const data = await ClashReviewApi.getClashTests(iTwinId!);
			setClashTests(data.rows);
			setIsLoading(false);
		} catch (error) {
			console.log(error);
		}
	};

	const controlledState = useCallback(
		(state: TableState<TableRow>, meta: MetaBase<TableRow>) => {
			if (isAutoSelect && meta.instance.rows && meta.instance.rows.length) {
				const row = meta.instance.rows[0];
				state.selectedRowIds = {};
				state.selectedRowIds[row.id] = true;
				setTestId(row.original.id);
			}
			return { ...state };
		},
		[isAutoSelect]
	);

	const onRowClick = async (_: any, row: any) => {
		if (iModelConnection) {
			setIsAutoSelect(false);
			row.toggleRowSelected(true);
			setTestId(row.original.id);
		}
	};

	const handleRunCreation = async (event: React.MouseEvent, testId: string) => {
		try {
			setNewRunRequested(testId);
			const response = await ClashReviewApi.submitTestRunRequest(process.env.IMJS_IMODEL_ID!, testId);
			setRuns((runs) => {
				const updatedRuns = runs.map((run: any) => {
					if (run.id === response.id) {
						return response;
					}
					return run;
				});

				return updatedRuns;
			});
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		if (iModelConnection) {
			setIsAutoSelect(true);
			getClashTests(iModelConnection.iTwinId!);
		}
	}, [iModelConnection]);

	return (
		<Table<TableRow>
			data={clashTests}
			columns={columnDefinition}
			isLoading={isLoading}
			isSortable
			useControlledState={controlledState}
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
