import { ChangeEvent, FunctionComponent, useEffect, useState } from "react";
import RuleDetailFooter from "./RuleDetailFooter";
import { Label, LabeledInput, ModalContent } from "@itwin/itwinui-react";
import { useSuppressionModalContext } from "../../../../context/SuppressionModalContext";
import ClashReviewApi from "../../../../configs/ClashReviewApi";
import { useClashContext } from "../../../../context/ClashContext";

interface BothAspectPropertiesProps {
    ruleData:any
}
 
const BothAspectProperties: FunctionComponent<BothAspectPropertiesProps> = ({ruleData}) => {
    const {selectedRuleTemplate} = useSuppressionModalContext()
	const {iTwinId} = useClashContext()
	const [method, setMethod] = useState<"update" | "create">(!!ruleData ? "update" : "create")
	const [ruleDetails, setRuleDetails] = useState<any>({});


    const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
		setRuleDetails((ruleDetails: any) => {
			return {
				...ruleDetails,
				[event.target.name]: event.target.value,
			};
		});
	};

    const handleAction = async () => {
		if(method === "update")
		{
			updateSuppressionRule()
		}
		else
		{
			addSuppressionRule()
		}
    }

	const updateSuppressionRule = async () => {
        try {
            const requestBody = {
                name: ruleDetails.name,
                reason: ruleDetails.reason,
                parameters: {
                    propertyExpression1: {
                        operator : ruleDetails.operator,
                        propertyName: ruleDetails.propertyName,
                        propertyValue: ruleDetails.propertyValue,
                        relationshipPath: ruleDetails.relationshipPath
                    },
                    propertyExpression2: {
                        operator : ruleDetails.operator2,
                        propertyName: ruleDetails.propertyName2,
                        propertyValue: ruleDetails.propertyValue2,
                        relationshipPath: ruleDetails.relationshipPath2
                    }
                },
            };
    
            await ClashReviewApi.updateSuppressionRule(iTwinId, ruleDetails.id, requestBody);
            alert("Suppression rule updated successfully")
        } catch (error) {
            console.log(error)
            alert("Something went wrong!")
        }

	};

	const addSuppressionRule = async () => {
        try {
            const requestBody = {
                templateId: selectedRuleTemplate.id,
                name: ruleDetails.name,
                reason: ruleDetails.reason,
                parameters: {
                    propertyExpression1: {
                        operator : ruleDetails.operator,
                        propertyName: ruleDetails.propertyName,
                        propertyValue: ruleDetails.propertyValue,
                        relationshipPath: ruleDetails.relationshipPath
                    },
                    propertyExpression2: {
                        operator : ruleDetails.operator2,
                        propertyName: ruleDetails.propertyName2,
                        propertyValue: ruleDetails.propertyValue2,
                        relationshipPath: ruleDetails.relationshipPath2
                    }
                },
            };

            await ClashReviewApi.createSuppressionRule(iTwinId, requestBody);
            alert("Suppression rule created successfully")
        } catch (error) {
            console.log(error)
            alert("Something went wrong!")
        }
	};

	useEffect(() => {
        if(method === "update")
        {
            const parameters = JSON.parse(ruleData.parameters)
            let structuredRuleData = {
                ...ruleData,
                operator : parameters?.propertyExpression1?.operator,
                propertyName : parameters?.propertyExpression1?.propertyName,
                propertyValue : parameters?.propertyExpression1?.propertyValue,
                relationshipPath : parameters?.propertyExpression1?.relationshipPath,
                operator2 : parameters?.propertyExpression2?.operator,
                propertyName2 : parameters?.propertyExpression2?.propertyName,
                propertyValue2 : parameters?.propertyExpression2?.propertyValue,
                relationshipPath2 : parameters?.propertyExpression2?.relationshipPath,
            }
    
            setRuleDetails(structuredRuleData)
        }
	}, [])

    return ( 
        <>
            <ModalContent className="customModal">
                <LabeledInput
					placeholder="Name"
					label="Name"
					name="name"
					onChange={handleInput}
					value={ruleDetails.name || ""}
					style={{ margin: "10px 0px" }}
					required
				/>
				<LabeledInput
					placeholder="Reason"
					label="Reason"
					name="reason"
					onChange={handleInput}
					value={ruleDetails.reason || ""}
					style={{ margin: "10px 0px" }}
					required
				/>
                <div style={{display:"flex", justifyContent:"space-between"}}>
                    <div style={{width:"48%"}}>
                        <Label>Property Expression 1</Label>
                        <LabeledInput
                            placeholder="Operator"
                            label="Operator"
                            name="operator"
                            onChange={handleInput}
                            value={ruleDetails.operator || ""}
                            style={{ margin: "10px 0px" }}
                            required
                        />
                        <LabeledInput
                            placeholder="Property Name"
                            label="Property Name"
                            name="propertyName"
                            onChange={handleInput}
                            value={ruleDetails.propertyName || ""}
                            style={{ margin: "10px 0px" }}
                            required
                        />
                        <LabeledInput
                            placeholder="Property Value"
                            label="Property Value"
                            name="propertyValue"
                            onChange={handleInput}
                            value={ruleDetails.propertyValue || ""}
                            style={{ margin: "10px 0px" }}
                            required
                        />
                        <LabeledInput
                            placeholder="Relationship Path"
                            label="Relationship Path"
                            name="relationshipPath"
                            onChange={handleInput}
                            value={ruleDetails.relationshipPath || ""}
                            style={{ margin: "10px 0px" }}
                            required
                        />
                    </div>
                    <div style={{width:"48%"}}>
                        <Label>Property Expression 2</Label>
                        <LabeledInput
                            placeholder="Operator"
                            label="Operator"
                            name="operator2"
                            onChange={handleInput}
                            value={ruleDetails.operator2 || ""}
                            style={{ margin: "10px 0px" }}
                            required
                        />
                        <LabeledInput
                            placeholder="Property Name"
                            label="Property Name"
                            name="propertyName2"
                            onChange={handleInput}
                            value={ruleDetails.propertyName2 || ""}
                            style={{ margin: "10px 0px" }}
                            required
                        />
                        <LabeledInput
                            placeholder="Property Value"
                            label="Property Value"
                            name="propertyValue2"
                            onChange={handleInput}
                            value={ruleDetails.propertyValue2 || ""}
                            style={{ margin: "10px 0px" }}
                            required
                        />
                        <LabeledInput
                            placeholder="Relationship Path"
                            label="Relationship Path"
                            name="relationshipPath2"
                            onChange={handleInput}
                            value={ruleDetails.relationshipPath2 || ""}
                            style={{ margin: "10px 0px" }}
                            required
                        />
                    </div>
                </div>
			</ModalContent>
			<RuleDetailFooter actionHandler={handleAction} method={method}/>
        </>
    );
}
 
export default BothAspectProperties;