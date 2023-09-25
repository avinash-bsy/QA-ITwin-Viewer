import { SvgGoToStart, SvgSave } from "@itwin/itwinui-icons-react";
import { Button, IconButton, ModalButtonBar } from "@itwin/itwinui-react";
import { FunctionComponent } from "react";
import { useSuppressionModalContext } from "../../../../context/SuppressionModalContext";

interface RuleDetailFooterProps {
    actionHandler: () => void;
    method: "update" | "create"
}
 
const RuleDetailFooter: FunctionComponent<RuleDetailFooterProps> = ({actionHandler, method}) => {
    const {setCurrentPage} = useSuppressionModalContext();
    const handleBack = () => {
        if(method === "update")
        {
            setCurrentPage("listRules")
        }
        else
        {
            setCurrentPage("selectRuleTemplate")
        }
    }
    return (
        <ModalButtonBar style={{justifyContent:"space-between"}}>
            <IconButton onClick={handleBack}>
                <SvgGoToStart style={{ height: 25, width: 25 }} />
            </IconButton>
            <IconButton styleType="high-visibility" onClick={actionHandler}>
                <SvgSave style={{ height: 25, width: 25 }} />
            </IconButton>
        </ModalButtonBar>
    );
}
 
export default RuleDetailFooter;