import { Label, LabeledInput, Select, SelectOption, SelectValueChangeEvent, ModalContent, ModalButtonBar, IconButton, ProgressRadial} from "@itwin/itwinui-react";
import { ChangeEvent, Dispatch, FunctionComponent, SetStateAction, useEffect, useState } from "react";
import ClashReviewApi from "../../../../configs/ClashReviewApi";
import { useClashContext } from "../../../../context/ClashContext";
import { convertStringtoObject } from "../..";
import { useSuppressionModalContext } from "../../../../context/SuppressionModalContext";
import { SvgGoToStart } from "@itwin/itwinui-icons-react";
import MappingAndGroupingRule from "./MAndGForm";
import CompareAspectProperties from "./CompareAspectProperties";
import AnyAspectProperty from "./AnyAspectProperty";
import BothAspectProperties from "./BothAspectProperties";
import AnyTypeDefinition from "./AnyTypeDefinition";
import SameTypeDefinition from "./SameTypeDefinition";
import BothTypeDefition from "./BothTypeDefinition";

interface RuleDetailProps {
	selectedRuleForEdit? : null | string;
}

const RuleDetails: FunctionComponent<RuleDetailProps> = ({selectedRuleForEdit}) => {
	const [loading, setLoading] = useState(true)
	const {iTwinId} = useClashContext()
	const {selectedRuleTemplate, setSelectedRuleTemplate} = useSuppressionModalContext()

	const [ruleDetails, setRuleDetails] = useState<any>(null)

	useEffect(() => {
		const init = async () => {
			setLoading(true)
			const response = await ClashReviewApi.getSuppressionRuleDetailsById(iTwinId, selectedRuleForEdit!);
			const ruleDetails = response.rows[0];
			setRuleDetails(ruleDetails)
			const allRuleTemplates = await ClashReviewApi.getRuleTemplates(iTwinId)
			const selectedRuleTemplate = allRuleTemplates?.rows.filter((row:any) => row.id === ruleDetails.templateId)
			setSelectedRuleTemplate(selectedRuleTemplate[0])
			setLoading(false)
		}

		if(selectedRuleForEdit)
		{
			init()
		}
		else
		{
			setLoading(false)
		}
	}, [])

	return (
		<>
			{
				loading ? <ProgressRadial indeterminate={true}/> :
				<>
					{selectedRuleTemplate?.name?.includes("CompareAspectProperties") && <CompareAspectProperties ruleData={ruleDetails}/>}
					{selectedRuleTemplate?.name?.includes("AnyAspectProperty") && <AnyAspectProperty ruleData={ruleDetails}/>}
					{selectedRuleTemplate?.name?.includes("BothAspectProperties") && <BothAspectProperties ruleData={ruleDetails}/>}
					{selectedRuleTemplate?.name?.includes("AnyTypeDef") && <AnyTypeDefinition ruleData={ruleDetails}/>}
					{selectedRuleTemplate?.name?.includes("SameTypeDef") && <SameTypeDefinition ruleData={ruleDetails}/>}
					{selectedRuleTemplate?.name?.includes("BothTypeDef") && <BothTypeDefition ruleData={ruleDetails}/>}
					{selectedRuleTemplate?.name?.includes("MappingAndGrouping") && <MappingAndGroupingRule ruleData={ruleDetails}/>}
				</>
			}
			
		</>
	)
};

export default RuleDetails;
