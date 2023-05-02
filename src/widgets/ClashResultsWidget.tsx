/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { useCallback, useEffect, useMemo, useState } from "react";
import { actions, ActionType, TableState } from "react-table";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { DefaultCell, Table } from "@itwin/itwinui-react";
import { useClashContext } from "../context/ClashContext";
import ClashReviewApi from "../configs/ClashReviewApi";

interface TableRow extends Record<string, string> {
	elementALabel: string;
	elementBLabel: string;
	elementACategoryIndex: string;
	elementBCategoryIndex: string;
	clashType: string;
	clashStatus: string;
}

export interface ElementPair {
	elementAId: string | undefined;
	elementBId: string | undefined;
}

const ClashResultsWidget = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { clashResults, runId, testId, setClashResults, iTwinId } = useClashContext();

	const columnDefinition = useMemo(
		() => [
			{
				Header: "Table",
				columns: [
					{
						Header: "Element A Label",
						accessor: "elementALabel",
					},
					{
						Header: "Element B Label",
						accessor: "elementBLabel",
					},
					{
						Header: "Element A Category",
						accessor: "elementACategory",
					},
					{
						Header: "Element B Category",
						accessor: "elementBCategory",
					},
					{
						Header: "Clash Type",
						accessor: "clashType",
					},
					{
						Header: "Status",
						accessor: "status",
						cellRenderer: (props: any) => (
							<DefaultCell {...props}>{getResultStatusText(props.cellProps.row.original.status)}</DefaultCell>
						),
					},
				],
			},
		],
		[clashResults]
	);

	const tableStateReducer = (
		newState: TableState<TableRow>,
		action: ActionType,
		_previousState: TableState<TableRow>
	): TableState<TableRow> => {
		switch (action.type) {
			case actions.toggleRowSelected: {
				newState.selectedRowIds = {};
				if (action.value) {
					newState.selectedRowIds[action.id] = true;
				}
				break;
			}
			default:
				break;
		}
		return newState;
	};

	const getResultStatusText = useCallback((statusCode: string) => {
		const statusMap: { [id: string]: string } = {
			"0": "New",
			"1": "Open",
			"2": "Accepted",
			"3": "Resolved",
			"4": "Followup",
		};

		return statusMap[statusCode];
	}, []);

	const onRowClick = useCallback(
		(_, row) => {
			ClashReviewApi.visualizeClash(row.original.elementAId, row.original.elementBId, false);
			row.toggleRowSelected(true);
		},
		[clashResults]
	);

	const getClashResults = async () => {
		setIsLoading(true);
		const clashResults = await ClashReviewApi.getClashResults(iTwinId, runId);
		setClashResults(clashResults);
		setIsLoading(false);
	};

	useEffect(() => {
		if (runId) {
			getClashResults();
		} else {
			setClashResults([]);
		}
	}, [runId]);

	useEffect(() => {
		ClashReviewApi.resetDisplay();
	}, [runId, testId]);

	return (
		<Table<TableRow>
			data={clashResults}
			columns={columnDefinition}
			onRowClick={onRowClick}
			isSortable
			stateReducer={tableStateReducer}
			isLoading={isLoading}
			emptyTableContent={"No results"}
			density="extra-condensed"
			style={{ height: "100%" }}
		/>
	);
};

export class ClashResultsWidgetProvider implements UiItemsProvider {
	public readonly id: string = "ClashResultsWidgetProvider";

	public provideWidgets(
		_stageId: string,
		_stageUsage: string,
		location: StagePanelLocation,
		_section?: StagePanelSection
	): ReadonlyArray<AbstractWidgetProps> {
		const widgets: AbstractWidgetProps[] = [];
		if (location === StagePanelLocation.Bottom && _section === StagePanelSection.Start) {
			widgets.push({
				id: "ClashResultsWidget",
				label: "Clash Results",
				defaultState: WidgetState.Open,
				getWidgetContent: () => <ClashResultsWidget />,
			});
		}
		return widgets;
	}
}
