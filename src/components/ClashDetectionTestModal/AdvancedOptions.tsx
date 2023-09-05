import { Button, InputGroup, LabeledInput, ToggleSwitch } from "@itwin/itwinui-react";
import { ChangeEvent, FunctionComponent, useState } from "react";
import { TestDetails, useClashDetectionTestContext } from "../../context/ClashDetectionTestContext";

interface AdvancedOptionProps {}

const AdvancedOption: FunctionComponent<AdvancedOptionProps> = () => {
	const { testDetails, setTestDetails, setCurrentPage} = useClashDetectionTestContext();

	const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
		const eventName = event.target.name;
		
		if (eventName === "touchingTolerance") {
			testDetails[eventName] = Number(event.target.value);
		} else if (eventName === "toleranceOverlapValidation") {
			testDetails.advancedSettings[eventName] = event.target.checked;
		} else if (eventName === "suppressTouching") {
			testDetails[eventName] = event.target.checked;
		}

		setTestDetails({...testDetails});
	};

	return (
		<>
			<div style={{ padding: "10px 0px" }}>
				<Button
					style={{ margin: "10px 0px" }}
					onClick={() => {
						setCurrentPage("suppressionRules");
					}}
					styleType="high-visibility">
					Suppression Rules
				</Button>
				<InputGroup displayStyle="inline" style={{ margin: "10px 0px" }}>
					<ToggleSwitch
						label="Suppress Touching"
						checked={testDetails.suppressTouching}
						name="suppressTouching"
						onChange={handleChange}
					/>
					<LabeledInput
						type="number"
						value={testDetails.touchingTolerance}
						label="Touching Tolerance"
						displayStyle="inline"
						name="touchingTolerance"
						onChange={handleChange}
					/>
				</InputGroup>
				<ToggleSwitch
					label="Validate Touching Tolerance"
					checked={testDetails.advancedSettings?.toleranceOverlapValidation}
					name="toleranceOverlapValidation"
					onChange={handleChange}
				/>
			</div>
			{}
		</>
	);
};

export default AdvancedOption;
