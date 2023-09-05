import { Button, ButtonGroup, IconButton, Modal, ModalButtonBar, ModalContent } from "@itwin/itwinui-react";
import { Dispatch, FunctionComponent, SetStateAction, useEffect, useState } from "react";
import ListSuppressionRules from "./ListSuppressionRules";
import AddSuppressionRule from "./AddSuppressionRule";
import { SvgAdd, SvgEdit } from "@itwin/itwinui-icons-react";
import EditSuppressionRule from "./EditSuppressionRule";

interface SuppressionRuleModalProps {
	handleOnClose: () => void;
}

export type PageList = "listRules" | "addRules" | "editRules";

const SuppressionRuleModal: FunctionComponent<SuppressionRuleModalProps> = ({ handleOnClose}) => {
	const [currentPage, setCurrentPage] = useState<PageList>("listRules");
	const [selectedRuleForEdit, setSelectedRuleForEdit] = useState<string>("");

	const getModalContent = () => {
		switch (currentPage) {
			case "listRules": {
				return (
					<ListSuppressionRules
						setCurrentPage={setCurrentPage}
						setSelectedRuleForEdit={setSelectedRuleForEdit}
						selectedRuleForEdit={selectedRuleForEdit}
						handleOnClose={handleOnClose}
					/>
				);
			}
			case "addRules": {
				return <AddSuppressionRule setCurrentPage={setCurrentPage} />;
			}
			case "editRules": {
				return <EditSuppressionRule setCurrentPage={setCurrentPage} selectedRuleForEdit={selectedRuleForEdit} />;
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
			isDismissible>
			{getModalContent()}
		</Modal>
	);
};

export default SuppressionRuleModal;
