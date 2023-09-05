/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { useEffect, useMemo, useState } from "react";
import { actions, ActionType } from "react-table";
import { StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState, Widget } from "@itwin/appui-react";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { Table, DefaultCell, IconButton } from "@itwin/itwinui-react";
import ClashReviewApi from "../configs/ClashReviewApi";
import { useClashContext } from "../context/ClashContext";
import { SvgPlay, SvgSync, SvgEdit, SvgAdd } from "@itwin/itwinui-icons-react";
import "../App.scss";
import ClashDetectionTestModal from "../components/ClashDetectionTestModal";
import { ClashDetectionTestProvider } from "../context/ClashDetectionTestContext";

interface TableRow extends Record<string, string> {
	name: string;
}

const ClashTestsWidget = () => {
	const iModelConnection = useActiveIModelConnection();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [currentTest, setCurrentTest] = useState<string>("");
	const [method, setMethod] = useState<"create" | "update">("create");
	const { clashTests, newRunRequested, setClashTests, setNewRunRequested, setTestId, setRuns, iModelId, iTwinId } = useClashContext();

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
									<IconButton style={{ backgroundColor: "transparent", border: "none", padding: 0 }} disabled={true}>
										<SvgSync />
									</IconButton>
								) : (
									<div className="play-button">
										<IconButton
											style={{ backgroundColor: "transparent", border: "none", padding: 0 }}
											disabled={newRunRequested !== null}
											onClick={(e) => {
												setCurrentTest(props.cellProps.row.original.id);
												setIsOpen(true);
												setMethod("update");
											}}>
											<SvgEdit />
										</IconButton>
										<IconButton
											style={{ backgroundColor: "transparent", border: "none", padding: 0 }}
											disabled={newRunRequested !== null}
											onClick={(e) => handleRunCreation(e, props.cellProps.row.original.id)}>
											<SvgPlay style={{ height: 22, width: 22 }} />
										</IconButton>
									</div>
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
			setTestId(data.rows[0]?.id);
			setClashTests(data.rows);
			setIsLoading(false);
		} catch (error) {
			console.log(error);
		}
	};

	const onRowClick = (_: any, row: any) => {
		if (iModelConnection) {
			row.toggleRowSelected(true);
			setTestId(row.original.id);
		}
	};

	const handleRunCreation = async (event: React.MouseEvent, testId: string) => {
		try {
			setNewRunRequested(testId);
			const response = await ClashReviewApi.submitTestRunRequest(iTwinId, iModelId, testId);
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

	const handleModalClose = () => {
		setIsOpen(false);
		setCurrentTest("");
		getClashTests(iModelConnection?.iTwinId!);
	};

	useEffect(() => {
		if (iModelConnection) {
			getClashTests(iModelConnection.iTwinId!);
		}
	}, [iModelConnection]);

	return (
		<>
			<IconButton
				onClick={() => {
					setCurrentTest("");
					setIsOpen(true);
					setMethod("create");
				}}>
				<SvgAdd />
				&nbsp;&nbsp; New
			</IconButton>
			<Table<TableRow>
				data={clashTests}
				columns={columnDefinition}
				isLoading={isLoading}
				isSortable
				initialState={{
					selectedRowIds: {
						0: true,
					},
				}}
				onRowClick={onRowClick}
				stateReducer={tableStateSingleSelectReducer}
				emptyTableContent={"No tests"}
				density="extra-condensed"
				style={{ height: "100%", zIndex: -1 }}
				className={newRunRequested ? "loading" : ""}
			/>
			{isOpen && (
				<ClashDetectionTestProvider>
					<ClashDetectionTestModal method={method} handleModalClose={handleModalClose} selectedTestId={currentTest} />
				</ClashDetectionTestProvider>
			)}
		</>
	);
};

export class ClashTestsWidgetProvider implements UiItemsProvider {
	public readonly id: string = "ClashTestsWidgetProvider";

	public provideWidgets(
		_stageId: string,
		_stageUsage: string,
		location: StagePanelLocation,
		_section?: StagePanelSection
	): ReadonlyArray<Widget> {
		const widgets: Widget[] = [];
		if (location === StagePanelLocation.Left && _section === StagePanelSection.Start) {
			widgets.push({
				id: "ClashTestsWidget",
				label: "Tests",
				defaultState: WidgetState.Open,
				content: <ClashTestsWidget />,
			});
		}
		return widgets;
	}
}
