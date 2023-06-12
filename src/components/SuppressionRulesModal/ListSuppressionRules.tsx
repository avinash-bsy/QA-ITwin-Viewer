import { SvgAdd, SvgEdit } from "@itwin/itwinui-icons-react";
import { Button, ButtonGroup, IconButton, ModalButtonBar, ModalContent, Table } from "@itwin/itwinui-react";
import { Dispatch, FunctionComponent, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { PageList } from "./SuppressionRulesModal";
import ClashReviewApi from "../../configs/ClashReviewApi";
import { useClashContext } from "../../context/ClashContext";

interface ListSuppressionRulesProps {
	setCurrentPage: Dispatch<SetStateAction<PageList>>;
	setSelectedRuleForEdit: Dispatch<SetStateAction<string>>;
	selectedRuleForEdit: string;
	testDetails: any;
	setTestDetails: Dispatch<SetStateAction<any>>;
	handleOnClose: () => void;
}

const ListSuppressionRules: FunctionComponent<ListSuppressionRulesProps> = ({
	setCurrentPage,
	setSelectedRuleForEdit,
	selectedRuleForEdit,
	testDetails,
	setTestDetails,
	handleOnClose,
}) => {
	const [suppressionRules, setSuppressionRules] = useState([]);
	const [loading, setLoading] = useState(false);
	const [addButtonDisabled, setAddButtonDisabled] = useState(false);
	const [editButtonDisabled, setEditButtonDisabled] = useState(true);
	const [selectedRules, setSelectedRules] = useState([]);
	const { iTwinId } = useClashContext();

	const columnDefinition = useMemo(
		() => [
			{
				Header: "Table",
				columns: [
					{
						id: "name",
						accessor: "name",
						Header: "Name",
					},
					{
						id: "createdBy",
						accessor: "userMetadata.createdBy.name",
						Header: "Created By",
					},
					{
						id: "reason",
						accessor: "reason",
						Header: "Reason",
					},
					{
						id: "description",
						accessor: "description",
						Header: "Description",
					},
				],
			},
		],
		[]
	);

	const handleSelect = (rows: any, state: any) => {
		// if (rows.length === 0) {
		// 	setAddButtonDisabled(false);
		// 	setEditButtonDisabled(true);
		// 	return;
		// }
		// setAddButtonDisabled(true);
		// if (rows.length === 1) {
		// 	setSelectedRuleForEdit(rows[0].id);
		// 	setEditButtonDisabled(false);
		// 	return;
		// }

		// setSelectedRuleForEdit("");
		// setEditButtonDisabled(true);
		// console.log(rows);
		// setSelectedRules(rows);

		if (rows.length === 0) {
			setAddButtonDisabled(false);
			setEditButtonDisabled(true);
		} else if (rows.length === 1) {
			setSelectedRuleForEdit(rows[0].id);
			setEditButtonDisabled(false);
			setAddButtonDisabled(true);
		} else {
			setSelectedRuleForEdit("");
			setEditButtonDisabled(true);
		}

		setSelectedRules(rows);
	};

	const getSelectedRows = useCallback(() => {
		const selectedRows: { [id: number]: boolean } = {};
		suppressionRules.forEach((rule: any, idx: number) => {
			if (rule.id === selectedRuleForEdit || testDetails.suppressionRules?.includes(rule.id)) {
				selectedRows[idx] = true;
			}
		});

		return selectedRows;
	}, [selectedRuleForEdit, suppressionRules]);

	const updateTestDetailsWithSelectedRules = () => {
		testDetails.suppressionRules = selectedRules.map((rule: any) => rule.id);
		setTestDetails({ ...testDetails });
		handleOnClose();
	};

	useEffect(() => {
		if (selectedRuleForEdit) {
			setEditButtonDisabled(false);
			setAddButtonDisabled(true);
		}

		if (testDetails.suppressionRules?.length === 1) {
			setSelectedRuleForEdit(testDetails.suppressionRules[0]);
			setEditButtonDisabled(false);
			setAddButtonDisabled(true);
		}

		const getSuppressionRules = async () => {
			setLoading(true);
			const response = await ClashReviewApi.getSuppressionRules(iTwinId);
			setSuppressionRules(response);
			setLoading(false);
		};

		getSuppressionRules();
	}, []);

	return (
		<>
			<ModalContent className="customModal">
				<div style={{ display: "inline-block", width: "100%", marginTop: "10px" }}>
					<ButtonGroup style={{ float: "right" }}>
						<IconButton
							onClick={() => {
								setCurrentPage("addRules");
							}}
							disabled={addButtonDisabled}>
							<SvgAdd />
						</IconButton>
						<IconButton
							onClick={() => {
								setCurrentPage("editRules");
							}}
							disabled={editButtonDisabled}>
							<SvgEdit />
						</IconButton>
					</ButtonGroup>
				</div>
				<div>
					<Table
						columns={columnDefinition}
						data={suppressionRules}
						emptyTableContent="No suppression rules"
						isLoading={loading}
						isSelectable={true}
						initialState={{
							selectedRowIds: getSelectedRows(),
						}}
						onSelect={handleSelect}
						selectionMode="multi"
					/>
				</div>
			</ModalContent>
			<ModalButtonBar>
				<Button styleType="high-visibility" onClick={updateTestDetailsWithSelectedRules}>
					Save
				</Button>
			</ModalButtonBar>
		</>
	);
};

export default ListSuppressionRules;
