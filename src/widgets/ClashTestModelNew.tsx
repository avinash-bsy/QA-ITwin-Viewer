import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, Button, Tabs, Tab, Table, Alert, ProgressLinear } from "@itwin/itwinui-react";
import ClashReviewApi from "../configs/ClashReviewApi";
import { useClashContext } from "../context/ClashContext";

interface ClashTestModelProps {
	isOpen: boolean;
	handleOnClose: () => void;
	currentTest: null | string;
}

interface ModelComponentProps {
	selectedModels: Array<string>;
	modelsList: Array<any>;
	setSelectedItems: (tab: string, ids: Array<string>) => void;
}

interface CommonComponentProps {
	dataItems: { [id: string]: Array<any> };
	selectedDataItems: { [id: string]: Array<string> };
	setSelectedIds: (ids: { [id: string]: Array<string> }) => void;
}

interface CategoryComponentProps {
	selectedCategories: Array<string>;
	categoriesList: Array<any>;
	setSelectedItems: (tab: string, ids: Array<string>) => void;
}

interface GroupingAndMappingProps {
	selectedMapAndGroups: Array<string>;
	mapAndGroupsList: Array<any>;
	setSelectedItems: (tab: string, ids: any) => void;
}

const ClashTestModel = (props: ClashTestModelProps) => {
	const [activeTab, setActiveTab] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(false);
	const [selectedDataItems, setSelectedDataItems] = useState<any>({});
	const [dataItems, setDataItems] = useState<{ [id: string]: [{ [id: string]: string }] }>({});
	const [testDetails, setTestDetails] = useState<any>({});
	const { iTwinId, iModelId } = useClashContext();

	const getFilteredDataItems = () => {
		let dataToExclude: { [id: string]: Array<any> } = {};

		if (activeTab == 0) {
			dataToExclude = selectedDataItems["setB"] || {};
		} else {
			dataToExclude = selectedDataItems["setA"] || {};
		}

		let filteredDataItems: { [id: string]: Array<any> } = {};

		const tempObject: { [id: string]: [{ [id: string]: string }] } = JSON.parse(JSON.stringify(dataItems));

		Object.entries(tempObject).map(([tab, values]) => {
			if (tab == "mappingAndGroupings") {
				filteredDataItems[tab] = values.filter((value: any) => {
					if (dataToExclude[tab]) {
						if (dataToExclude[tab][value.id]) {
							value.subRows = value.subRows.filter((subRow: any) => !dataToExclude[tab][value.id].includes(subRow.id));

							return value.subRows.length > 0;
						}
						return true;
					}
					return true;
				});
			} else {
				filteredDataItems[tab] = values.filter((value) => !dataToExclude[tab]?.includes(value.id));
			}
		});

		return filteredDataItems;
	};

	const setSelectedIds = (ids: { [id: string]: Array<string> }) => {
		selectedDataItems[activeTab === 0 ? "setA" : "setB"] = ids;
		setSelectedDataItems(selectedDataItems);
		alert("set data added");
	};

	const formatQueryReference = (obj: { [id: string]: Array<string> }): string => {
		let responseString = "";
		if (obj) {
			Object.entries(obj).map(([key, value]: [string, Array<string>], index: number) => {
				responseString += key + ":[";
				value.forEach((v: string, idx: number) => {
					responseString += v;
					if (idx !== value.length - 1) {
						responseString += ",";
					}
				});

				responseString += "]";

				if (index !== value.length - 1) {
					responseString += ";";
				}
			});
		}

		return responseString;
	};

	const saveUpdatedClashTest = async () => {
		console.log(selectedDataItems);
		testDetails.setA = {
			...testDetails.setA,
			modelIds: [...(selectedDataItems.setA?.models || [])],
			categoryIds: [...(selectedDataItems.setA?.categories || [])],
			queries: {
				type: 1,
				queryReference: formatQueryReference(selectedDataItems.setA?.mappingAndGroupings),
			},
		};
		testDetails.setB = {
			...testDetails.setB,
			modelIds: [...(selectedDataItems.setB?.models || [])],
			categoryIds: [...(selectedDataItems.setB?.categories || [])],
			queries: {
				type: 1,
				queryReference: formatQueryReference(selectedDataItems.setB?.mappingAndGroupings),
			},
		};

		testDetails.tag = {
			repositoryId: testDetails.tag?.id,
			repositoryType: testDetails.tag?.type,
		};

		const { contextId, createdBy, creationDate, id, lastModifiedBy, modificationDate, ...requiredData } = testDetails;

		const response = await ClashReviewApi.updateClashTest(iTwinId, props.currentTest!, requiredData);
		alert("Test updated successfully");
	};

	const getSelectedDataItems = () => {
		return { ...(selectedDataItems[activeTab === 0 ? "setA" : "setB"] || {}) };
	};

	const convertStringtoObject = (queryReference: string): { [id: string]: Array<string> } => {
		if (queryReference) {
			let responseObject: { [id: string]: Array<string> } = {};
			const mappingAndGrouppings = queryReference.split(";");
			mappingAndGrouppings.forEach((mappingAndGroupping) => {
				const mappingId = mappingAndGroupping.split(":")[0];
				const groupingIds = mappingAndGroupping.split(":")[1];

				const groupingIdsString = groupingIds.substring(1, groupingIds.length - 1);
				let groupingIdArray = groupingIdsString.split(",");
				responseObject[mappingId] = groupingIdArray;
			});

			return responseObject;
		} else {
			return {};
		}
	};

	const initApp = async () => {
		setLoading(true);
		const modelAndCategories = await ClashReviewApi.getModelsAndCategories(iModelId, iTwinId);
		const { models, categories } = modelAndCategories;

		const mappingAndGroupings = await ClashReviewApi.getMappingAndGrouping(iModelId);
		const testId = props.currentTest;
		const response = await ClashReviewApi.getClashTestDetailById(iTwinId, testId!);
		setSelectedDataItems({
			setA: {
				models: response.setA?.modelIds,
				categories: response.setA?.categoryIds,
				mappingAndGroupings: convertStringtoObject(response.setA?.queries?.queryReference),
			},
			setB: {
				models: response.setB?.modelIds,
				categories: response.setB?.categoryIds,
				mappingAndGroupings: convertStringtoObject(response.setB?.queries?.queryReference),
			},
		});
		setTestDetails(response);
		setDataItems({ models, categories, mappingAndGroupings });
		setLoading(false);
	};

	useEffect(() => {
		initApp();
	}, []);

	return (
		<Dialog
			isOpen={props.isOpen}
			onClose={props.handleOnClose}
			closeOnEsc
			closeOnExternalClick
			preventDocumentScroll
			trapFocus
			setFocus
			isDismissible>
			<Dialog.Backdrop />
			<Dialog.Main>
				<Dialog.TitleBar titleText="Modify Clash Detection Test" />
				<Dialog.Content>
					{
						<Tabs
							labels={[<Tab key={1} label="Set A" />, <Tab key={2} label="Set B" />]}
							onTabSelected={(index) => {
								setActiveTab(index);
							}}>
							{loading ? (
								<ProgressLinear indeterminate={true} />
							) : (
								<CommonInnerTabsComponent
									dataItems={getFilteredDataItems()}
									selectedDataItems={getSelectedDataItems()}
									setSelectedIds={setSelectedIds}
								/>
							)}
						</Tabs>
					}
				</Dialog.Content>
				<Dialog.ButtonBar>
					<Button
						styleType="high-visibility"
						onClick={() => {
							saveUpdatedClashTest();
						}}>
						Submit
					</Button>
					<Button
						onClick={() => {
							console.log("secondary");
						}}>
						Close
					</Button>
				</Dialog.ButtonBar>
			</Dialog.Main>
		</Dialog>
	);
};

const CommonInnerTabsComponent = (props: CommonComponentProps) => {
	const [activeTab, setActiveTab] = useState<number>(0);
	const [selectedItems, setSelectedItems] = useState<{ [id: string]: any }>(props.selectedDataItems);

	const setTabSelectedItems = (tab: string, ids: any) => {
		selectedItems[tab] = ids;
		setSelectedItems(selectedItems);
	};

	const mockupData = props.dataItems;

	const getContent = () => {
		switch (activeTab) {
			case 0:
				return (
					<ModelComponent
						selectedModels={selectedItems?.models || []}
						modelsList={mockupData?.models || []}
						setSelectedItems={setTabSelectedItems}
					/>
				);
			case 1:
				return (
					<CategoriesComponent
						selectedCategories={selectedItems?.categories || []}
						categoriesList={mockupData?.categories || []}
						setSelectedItems={setTabSelectedItems}
					/>
				);
			case 2:
				return (
					<GroupingAndMapping
						selectedMapAndGroups={selectedItems?.mappingAndGroupings || []}
						mapAndGroupsList={mockupData?.mappingAndGroupings || []}
						setSelectedItems={setTabSelectedItems}
					/>
				);
		}
	};

	useEffect(() => {
		setSelectedItems(props.selectedDataItems);
	}, [props.selectedDataItems]);

	return (
		<Tabs
			type="borderless"
			labels={[<Tab key={1} label="Models" />, <Tab key={2} label="Categories" />, <Tab key={3} label="Mapping And Grouping" />]}
			onTabSelected={(index: number) => {
				setActiveTab(index);
			}}>
			<div className="customModal">{getContent()}</div>
			<div style={{ float: "right", marginTop: "10px" }}>
				<Button
					styleType="high-visibility"
					onClick={() => {
						props.setSelectedIds(selectedItems);
					}}>
					Save
				</Button>
			</div>
		</Tabs>
	);
};

const ModelComponent = (props: ModelComponentProps) => {
	const onSelect = (rows: any) => {
		let selectedRows: Array<string> = [];

		rows.forEach((row: any) => {
			selectedRows.push(row.id);
		});

		props.setSelectedItems("models", selectedRows);
	};

	const getSelectedRows = () => {
		const selectedRowIds: { [id: number]: boolean } = {};
		props.modelsList.map((model: any, index: number) => {
			if (props.selectedModels.includes(model.id)) {
				selectedRowIds[index] = true;
			}
		});

		return selectedRowIds;
	};

	const onRowClick = useCallback((event: React.MouseEvent, row: any) => console.log(`Row clicked: ${JSON.stringify(row.original)}`), []);
	return (
		<Table
			columns={[
				{
					id: "name",
					Header: "Name",
					accessor: "displayName",
				},
			]}
			data={props.modelsList}
			emptyTableContent="No data."
			isSelectable={true}
			onSelect={onSelect}
			initialState={{
				selectedRowIds: getSelectedRows(),
			}}
			onRowClick={onRowClick}
			selectionMode="multi"
		/>
	);
};

const CategoriesComponent = (props: CategoryComponentProps) => {
	const onSelect = (rows: any) => {
		let selectedRows: Array<string> = [];

		rows.forEach((row: any) => {
			selectedRows.push(row.id);
		});

		props.setSelectedItems("categories", selectedRows);
	};

	const getSelectedRows = () => {
		var selectedRowIds: { [id: number]: boolean } = {};
		props.categoriesList.map((category: any, index: number) => {
			if (props.selectedCategories.includes(category.id)) {
				selectedRowIds[index] = true;
			}
		});

		return selectedRowIds;
	};

	const onRowClick = useCallback((event: React.MouseEvent, row: any) => console.log(`Row clicked: ${JSON.stringify(row.original)}`), []);
	return (
		<Table
			columns={[
				{
					id: "name",
					Header: "Name",
					accessor: "displayName",
				},
			]}
			data={props.categoriesList}
			emptyTableContent="No data."
			isSelectable={true}
			onSelect={onSelect}
			initialState={{
				selectedRowIds: getSelectedRows(),
			}}
			onRowClick={onRowClick}
			selectionMode="multi"
		/>
	);
};

const GroupingAndMapping = (props: GroupingAndMappingProps) => {
	const onSelect = (rows: any) => {
		let selectedRows: { [id: string]: Array<string> } = {};
		rows.forEach((row: any) => {
			if (row.mappingId) {
				if (selectedRows[row.mappingId] === undefined) {
					selectedRows[row.mappingId] = [row.id];
				} else {
					selectedRows[row.mappingId].push(row.id);
				}
			} else {
				if (!selectedRows[row.id]) {
					selectedRows[row.id] = [];
				}
			}
		});

		props.setSelectedItems("mappingAndGroupings", selectedRows);
	};

	const getSelectedRows = () => {
		const selectedRowIds: { [id: string]: boolean } = {};
		props.mapAndGroupsList.map((row: any, index: number) => {
			if (props.selectedMapAndGroups[row.id]) {
				if (row.subRows) {
					if (props.selectedMapAndGroups[row.id].length === row.subRows.length) {
						selectedRowIds[index] = true;
					}
					row.subRows.map((subRow: any, idx: string) => {
						if (props.selectedMapAndGroups[row.id].includes(subRow.id)) {
							selectedRowIds[`${index}.${idx}`] = true;
						}
					});
				}
			}
		});

		console.log(selectedRowIds);
		return selectedRowIds;
	};
	return (
		<>
			<Table
				emptyTableContent="No data."
				isSelectable
				isSortable
				data={props.mapAndGroupsList}
				columns={[
					{
						id: "name",
						Header: "Name",
						accessor: "name",
					},
				]}
				initialState={{
					selectedRowIds: getSelectedRows(),
				}}
				onSelect={onSelect}
				// onExpand={onExpand}
			/>
		</>
	);
};

export default ClashTestModel;
