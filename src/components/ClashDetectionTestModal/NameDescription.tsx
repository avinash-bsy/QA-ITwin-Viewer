import { IconButton, LabeledInput, ModalButtonBar, ModalContent } from "@itwin/itwinui-react";
import { ChangeEvent, FunctionComponent } from "react";
import { useClashDetectionTestContext } from "../../context/ClashDetectionTestContext";
import { SvgGoToEnd } from "@itwin/itwinui-icons-react";

interface NameDescriptionScreenProps {}

const NameDescriptionScreen: FunctionComponent<NameDescriptionScreenProps> = ({}) => {
	const { testDetails, setTestDetails} = useClashDetectionTestContext();

	const handleInput = (event: ChangeEvent<HTMLInputElement>): void => {
		let modifiedTestDetails = { ...testDetails, [event.target.name]: event.target.value };
		setTestDetails(modifiedTestDetails);
	};

	return (
		<>
			<LabeledInput
				placeholder="Name Required"
				label="Name"
				name="name"
				onChange={handleInput}
				value={testDetails.name || ""}
				style={{ margin: "10px 0px" }}
			/>
			<LabeledInput
				placeholder="Description Required"
				label="Description"
				name="description"
				onChange={handleInput}
				value={testDetails.description || ""}
			/>
		</>
	);
};

export default NameDescriptionScreen;
