import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, Button, Tabs, Tab, Table, Anchor } from "@itwin/itwinui-react";
import ClashReviewApi from "../configs/ClashReviewApi";
import { useClashContext } from "../context/ClashContext";
import { CellProps } from "@itwin/appui-layout-react";

export interface Props {
	isOpen: boolean;
	handleOnClose: () => void;
}

export interface ModelProps {
	modelList: Array<any>;
	selectedRowIds: { [id: number]: boolean };
	setSelectedRows: any;
}

export interface CategoryProps {
	outterStep: number;
	innerStep: number;
	categoryList: Array<any>;
}

const ClashTestModel = (props: Props) => {
	const { iModelId, iTwinId } = useClashContext();
	const [currentOutterStep, setCurrentOutterStep] = useState<number>(0);
	const [currentInnerStep, setCurrentInnerStep] = useState<number>(0);
	const [modelList, setModelList] = useState<Array<any>>([]);
	const [categoryList, setCategoryList] = useState<Array<any>>([]);
	// const [setAData, setSetAData] = useState<{ [id: string]: {} }>({});
	// const [setBData, setSetBData] = useState<{ [id: string]: {} }>({});
	let setAData: { [id: string]: {} } = {
		models: {},
		categories: {},
	};
	let setBData: { [id: string]: {} } = {
		models: {},
		categories: {},
	};

	const getFilteredModelsList = () => {
		let modelsToExclude: { [id: string]: {} } = {};

		if (currentOutterStep === 0) {
			modelsToExclude = setBData.models || {};
		} else {
			modelsToExclude = setAData.models || {};
		}

		const filteredModelsList = modelList.filter((model: any) => modelsToExclude[model.id] === undefined);
		return filteredModelsList;
	};

	const getSelectedRows = () => {
		let dataToInclude: { [id: string]: {} } = {};
		if (currentOutterStep === 0) {
			dataToInclude = setAData.models || {};
		} else {
			dataToInclude = setBData.models || {};
		}

		const selectedRowIndexs: { [id: number]: boolean } = {};

		modelList.forEach((model: any, index: number) => {
			if (dataToInclude[model.id]) {
				selectedRowIndexs[index] = true;
			}
		});

		return selectedRowIndexs;
	};

	const getInnerTabContent = () => {
		switch (currentInnerStep) {
			case 0:
				return (
					<ModelComponent
						modelList={getFilteredModelsList()}
						selectedRowIds={getSelectedRows()}
						setSelectedRows={currentOutterStep == 0 ? setAData : setBData}
					/>
				);
			case 1:
				return <CategoriesComponent outterStep={currentOutterStep} innerStep={currentInnerStep} categoryList={categoryList} />;
			case 2:
				return <ECSQLComponent />;
			case 3:
				return <GroupingMappingComponent />;
		}
	};

	const getModelsAndCategoriesList = async () => {
		const data = await ClashReviewApi.getModelsAndCategories(iModelId, iTwinId);
		setCategoryList(data.categories);
		setModelList(data.models);
	};

	useEffect(() => {
		if (props.isOpen) {
			getModelsAndCategoriesList();
		}
	}, [props.isOpen]);

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
					<Tabs
						labels={[<Tab key={1} label="Set A" />, <Tab key={2} label="Set B" />]}
						onTabSelected={(index) => {
							setCurrentOutterStep(index);
						}}>
						<Tabs
							type="borderless"
							labels={[
								<Tab key={1} label="Models" />,
								<Tab key={2} label="Categories" />,
								<Tab key={3} label="ECSQL" />,
								<Tab key={4} label="Grouping And Mapping" />,
							]}
							onTabSelected={(index) => {
								setCurrentInnerStep(index);
							}}>
							{getInnerTabContent()}
							<div style={{ float: "right", marginTop: "10px" }}>
								<Button styleType="high-visibility">Save</Button>
							</div>
						</Tabs>
					</Tabs>
				</Dialog.Content>
				<Dialog.ButtonBar>
					<Button
						styleType="high-visibility"
						onClick={() => {
							console.log("primary");
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

const ModelComponent = (props: ModelProps) => {
	const onSelect = (rows: any) => {
		let selectedRows: { [id: string]: any } = {};

		rows.forEach((row: any) => {
			selectedRows[String(row.id)] = row;
		});

		props.setSelectedRows.models = selectedRows;
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
			data={props.modelList}
			emptyTableContent="No data."
			isSelectable={true}
			onSelect={onSelect}
			initialState={{
				selectedRowIds: props.selectedRowIds,
			}}
			onRowClick={onRowClick}
			selectionMode="multi"
		/>
	);
};

const CategoriesComponent = (props: CategoryProps) => {
	return <h1>Categories Component</h1>;
};

const ECSQLComponent = () => {
	return <h1>ECSQL Component</h1>;
};

const GroupingMappingComponent = () => {
	return <h1>Grouping and Mapping Component</h1>;
};

export default ClashTestModel;
