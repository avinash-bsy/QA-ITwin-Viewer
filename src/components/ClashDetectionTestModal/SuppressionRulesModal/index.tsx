import { Button, ButtonGroup, IconButton, Modal, ModalButtonBar, ModalContent } from "@itwin/itwinui-react";
import { Dispatch, FunctionComponent, SetStateAction, useCallback, useEffect, useState } from "react";
import ListSuppressionRules from "./ListSuppressionRules";
// import AddSuppressionRule from "./AddSuppressionRule";
import { SvgAdd, SvgEdit } from "@itwin/itwinui-icons-react";
// import EditSuppressionRule from "./EditSuppressionRule";
import { SuppressionModalContextProvider, useSuppressionModalContext } from "../../../context/SuppressionModalContext";
import SelectRuleType from "./SelectRuleType";
import SelectRuleTemplates from "./SelectRuleTemplates";
import RuleDetails from "./RuleDetails";

interface SuppressionRuleModalProps {
	handleOnClose: () => void;
}

const SuppressionRuleModal: FunctionComponent<SuppressionRuleModalProps> = ({ handleOnClose}) => {
	const {currentPage, setCurrentPage} = useSuppressionModalContext()
	const [selectedRuleForEdit, setSelectedRuleForEdit] = useState<null | string>(null)

	const getModalContent = () => {
		switch (currentPage) {
			case "listRules": {
				return (
					<ListSuppressionRules
						setSelectedRuleForEdit={setSelectedRuleForEdit}
						selectedRuleForEdit={selectedRuleForEdit}
						handleOnClose={handleOnClose}
					/>
				);
			}
			case "selectRuleType": {
				return <SelectRuleType />;
			}
			case "selectRuleTemplate": {
				return <SelectRuleTemplates />
			}
			case "ruleDetails": {
				return selectedRuleForEdit === null ? <RuleDetails /> : <RuleDetails selectedRuleForEdit={selectedRuleForEdit} />
			}
			case "listTemplates": {
				return <SelectRuleTemplates />
			}
		}
	};

	return (
			<Modal
				style={{ width: "800px" }}
				title="Suppression Rules"
				isOpen={true}
				onClose={handleOnClose}
				closeOnEsc
				closeOnExternalClick
				isDismissible
			>
				{getModalContent()}
			</Modal>
	);
};

export default SuppressionRuleModal;
