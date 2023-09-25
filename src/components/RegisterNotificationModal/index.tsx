import { Button, LabeledInput, Modal, ModalButtonBar, ModalContent, ProgressRadial } from "@itwin/itwinui-react";
import { FunctionComponent, useEffect, useState } from "react";
// import CustomInput from "../CustomInput";
import CustomInput from "../CustomInput";
import ClashReviewApi from "../../configs/ClashReviewApi";

interface RegisterNotificationModalProps {
    modalOpen : boolean;
    handleModalClose : () => void
}
 
const RegisterNotificationModal: FunctionComponent<RegisterNotificationModalProps> = ({modalOpen, handleModalClose}) => {
    const [emails, setEmails] = useState<string[]>([])
    const [url, setUrl] = useState<string>("")
    const [formMethod, setFormMethod] = useState<"create" | "update">("create")
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const isEmailValid = (value:string) => {
        const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(value.toLowerCase());
    }

    const handleNotificationRegistration = async () => {
        try {
            const requestData = {
                clientId: process.env.REACT_APP_IMJS_AUTH_CLIENT_CLIENT_ID,
                urlFormat: url,
                admins: emails
            }
    
            await ClashReviewApi.createNotificationRegistration(requestData)
            alert("Registered successfully")
        } catch (error) {
            console.log(error)
        }
    }

    const handleNotificationRegistrationUpdate = async () => {
        try {
            const requestData = {
                urlFormat: url,
                admins: emails.join(",")
            }
    
            await ClashReviewApi.updateNotificationRegistration(requestData)
            alert("Updated successfully")
        } catch (error) {
            console.log(error)
        }
    }

    const handleURLChange = (event: any) => {
        setUrl(event.target.value)
    }

    useEffect(() => {
        const initApp = async () => {
            try {
                const response = await ClashReviewApi.getNotificationRegisterationDetails()
                if(response.urlFormat)
                    setUrl(response.urlFormat)

                if(response.admins)
                    setEmails(response.admins.split(","))

                setFormMethod("update")
            } catch (error) {
                console.log(error)
            }
            finally{
                setIsLoading(false)
            }
        }

        initApp()
    }, [])

    return ( 
        <Modal
			style={{ width: "800px" }}
			title="Register Notification"
			isOpen={modalOpen}
			onClose={handleModalClose}
			closeOnEsc
			closeOnExternalClick
			isDismissible>
                <ModalContent>
                    {isLoading && <ProgressRadial indeterminate={true}/>}
                    {
                        !isLoading && 
                        <>
                            <LabeledInput placeholder='https://some.bentley.com/{{itwinId}}/{{iModelId}}?result={{resultId}}' label='URL Format' value={url} onChange={handleURLChange}/>
                            <CustomInput placeholder="Enter emails" label="Admins" value={emails} setValue={setEmails} validatorFunction={isEmailValid}/>
                        </>
                    }
                </ModalContent>
                <ModalButtonBar>
                    {formMethod === "create" && <Button onClick={handleNotificationRegistration}>Save</Button>}
                    {formMethod === "update" && <Button onClick={handleNotificationRegistrationUpdate}>Update</Button>}
                </ModalButtonBar>
		</Modal>
    );
}
 
export default RegisterNotificationModal;