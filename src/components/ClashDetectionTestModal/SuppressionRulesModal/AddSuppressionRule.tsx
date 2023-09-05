import { Dispatch, FunctionComponent, SetStateAction, useState } from "react";
import SelectRuleTemplates from "./SelectRuleTemplates";
import { Button, ModalButtonBar, ModalContent } from "@itwin/itwinui-react";
import { PageList } from ".";
import RuleDetails from "./RuleDetails";
import ClashReviewApi from "../../../configs/ClashReviewApi";
import { useClashContext } from "../../../context/ClashContext";
import { SvgGoToStart } from "@itwin/itwinui-icons-react";

interface AddSuppressionRuleProps {
	setCurrentPage: Dispatch<SetStateAction<PageList>>;
}

type AddRulePageList = "selectTemplate" | "ruleDetails";

const AddSuppressionRule: FunctionComponent<AddSuppressionRuleProps> = ({ setCurrentPage }) => {
	const [currentInnerPage, setCurrentInnerPage] = useState<AddRulePageList>("selectTemplate");
	const [selectedRuleTemplate, setSelectedRuleTemplate] = useState<string>("");
	const [ruleDetails, setRuleDetails] = useState<Record<string, any>>({});
	const { iTwinId } = useClashContext();

	const getContent = () => {
		switch (currentInnerPage) {
			case "selectTemplate": {
				return (
					<SelectRuleTemplates selectedRuleTemplate={selectedRuleTemplate} setSelectedRuleTemplate={setSelectedRuleTemplate} />
				);
			}
			case "ruleDetails": {
				return <RuleDetails ruleDetails={ruleDetails} setRuleDetails={setRuleDetails} />;
			}
		}
	};

	const handleBack = () => {
		if (currentInnerPage === "selectTemplate") {
			setCurrentPage("listRules");
		} else {
			setCurrentInnerPage("selectTemplate");
		}
	};

	const handleMainFunction = async () => {
		if (currentInnerPage === "selectTemplate") {
			setCurrentInnerPage("ruleDetails");
		} else {
			const requestBody = {
				templateId: selectedRuleTemplate,
				name: ruleDetails.name,
				reason: ruleDetails.reason,
				parameters: {
					queries: {
						type: 1,
						queryReference: `${ruleDetails.mappingId}:[${ruleDetails.groupingIds?.map((id: string) => id)}]`,
					},
				},
			};

			const response = await ClashReviewApi.createSuppressionRule(iTwinId, requestBody);
			console.log(response);
		}
	};

	return (
		<>
			<ModalContent className="customModal">{getContent()}</ModalContent>
			<ModalButtonBar style={{ justifyContent: "space-between" }}>
				<div>
					<Button onClick={handleBack}>
						<SvgGoToStart style={{ width: "25", height: "25" }} />
					</Button>
				</div>
				<Button styleType="high-visibility" disabled={!selectedRuleTemplate} onClick={handleMainFunction}>
					{currentInnerPage === "selectTemplate" ? "Next" : "Create"}
				</Button>
			</ModalButtonBar>
		</>
	);
};

export default AddSuppressionRule;
