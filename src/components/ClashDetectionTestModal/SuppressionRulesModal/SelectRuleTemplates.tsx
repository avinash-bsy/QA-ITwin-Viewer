import { IconButton, ModalButtonBar, ModalContent, Table } from "@itwin/itwinui-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import ClashReviewApi from "../../../configs/ClashReviewApi";
import { useClashContext } from "../../../context/ClashContext";
import { useSuppressionModalContext } from "../../../context/SuppressionModalContext";
import { SvgGoToEnd, SvgGoToStart } from "@itwin/itwinui-icons-react";

const SelectRuleTemplates = () => {
	const [ruleTemplates, setRuleTemplates] = useState<any>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const { iTwinId } = useClashContext();
	const {setSelectedRuleTemplate, selectedRuleTemplate, selectedRuleType, setCurrentPage} = useSuppressionModalContext()

	const getRuleTemplates = async () => {
		setLoading(true);
		let ruleTemplatesData = await ClashReviewApi.getRuleTemplates(iTwinId);
		let filteredArray = [];
		let allowedRuleTemplates:string[] = [
			"Suppression/Definition/Generic/MappingAndGrouping"			
		]

		if (selectedRuleType === "aspects")
		{
			allowedRuleTemplates = [
				"Suppression/Definition/Generic/BothAspectProperties",
				"Suppression/Definition/Generic/AnyAspectProperty",
				"Suppression/Definition/Generic/CompareAspectProperties",
			]
		}
		else if (selectedRuleType === "typeDefinition")
		{
			allowedRuleTemplates = [
				"Suppression/Definition/Generic/AnyTypeDef",
				"Suppression/Definition/Generic/SameTypeDef",
				"Suppression/Definition/Generic/BothTypeDef"
			]
		}

		for (let rule of ruleTemplatesData.rows) {
			if (allowedRuleTemplates.includes(rule.name)) {
				console.log(rule)
				filteredArray.push(rule);
			}
		}

		setRuleTemplates(filteredArray);
		setLoading(false);
	};

	const columnDefinition = useMemo(
		() => [
			{
				Header: "Table",
				columns: [
					{
						id: "name",
						accessor: "name",
						Header: "Rule",
					},
				],
			},
		],
		[]
	);

	const handleRowClick = (event: React.MouseEvent<Element, MouseEvent>, row: any) => {
		if (row.original.id === selectedRuleTemplate) {
			setSelectedRuleTemplate({});
			return;
		}

		setSelectedRuleTemplate(row.original);
	};

	const getSelectedRows = () => {
		const selectedRows: { [id: number]: boolean } = {};
		ruleTemplates.forEach((rule: any, idx: number) => {
			if (rule.id === selectedRuleTemplate?.id) {
				selectedRows[idx] = true;
			}
		});

		return selectedRows;
	};

	useEffect(() => {
		getRuleTemplates();
	}, []);

	return (
		<>
			<ModalContent className="customModal">
				<Table
					columns={columnDefinition}
					data={ruleTemplates}
					emptyTableContent="No rule templates"
					isSelectable={true}
					isLoading={loading}
					initialState={{
						selectedRowIds: getSelectedRows(),
					}}
					onRowClick={handleRowClick}
					selectionMode="single"
				/>
				{selectedRuleTemplate && <h3><strong>Note : </strong>{selectedRuleTemplate?.description} </h3>}
			</ModalContent>
			<ModalButtonBar style={{justifyContent:"space-between"}}>
				<IconButton onClick={() => {setSelectedRuleTemplate(null);setCurrentPage("selectRuleType")}}>
					<SvgGoToStart style={{ height: 25, width: 25 }} />
				</IconButton>
				<IconButton onClick={() => setCurrentPage("ruleDetails")}>
					<SvgGoToEnd style={{ height: 25, width: 25 }} />
				</IconButton>
			</ModalButtonBar>
		</>
	);
};

export default SelectRuleTemplates;
