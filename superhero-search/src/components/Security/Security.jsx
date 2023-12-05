import React from 'react';
import { useEffect, useState} from 'react';
import './securitystyle.css';
import MyAdminRights from '../Admin/admin.jsx'
const Security = () => {

    const [policyTitleForSP, setPolicyTitleForSP] = useState(); //use states for setting specific policies
    const [policyTextForSP, setPolicyTextForSP] = useState(); //
    const [policyTitleForDMCA, setPolicyTitleForDMCA] = useState(); //
    const [policyTextForDMCA, setPolicyTextForDMCA] = useState(); //
    const [policyTitleForAcceptable, setPolicyTitleAcceptable] = useState(); //
    const [policyTextForAcceptable, setPolicyTextForAcceptable] = useState(); //
    const routerPath2 = "/api/users";//router to user path

    useEffect(() => {
        // Fetch admin status from the backend and update the state
        const getPolicyInfo = async () => {//only displaying policy info 
          try {

            const response = await fetch(`${routerPath2}/policies`);
    
            if (response.ok) {
                const data = await response.json();
                for(let dataObj of data){
                    if(dataObj.title === "Security and Privacy Policy"){
                        setPolicyTitleForSP(dataObj.title);//setting title of security and privacy policy
                        setPolicyTextForSP(dataObj.content);
                    }
                    else if(dataObj.title === "DMCA Notice & Takedown Policy"){
                        setPolicyTitleForDMCA(dataObj.title);//setting title of takedown policy
                        setPolicyTextForDMCA(dataObj.content);
                    }
                    else if(dataObj.title === "Acceptable Use Policy"){
                        setPolicyTitleAcceptable(dataObj.title);//setting title of acceptable policy
                        setPolicyTextForAcceptable(dataObj.content);
                    }

                }
            }
            else {
              console.log("There was a problem finding policy data")//eror statements for admin method
            }
          } catch (error) {
            console.error('Error getting data', error);
          }
        };
    
        getPolicyInfo();
    
      },[]);


    return (
        <div>
            {policyTitleForSP && (
                    <div>
                                <div className="privacy-security-policy-container">
                                    <div className="policy-header">
                                        <h1>{policyTitleForSP}:</h1>
                                        <div>
                                            <p>{policyTextForSP}</p>
                                        </div>
                                    </div>
                                </div>
                    </div>
                    )
                }
             {policyTitleForDMCA && (
                <div>
                            <div className="privacy-security-policy-container">
                                <div className="policy-header">
                                    <h1>{policyTitleForDMCA}:</h1>
                                    <div>
                                        <p>{policyTextForDMCA}</p>
                                    </div>
                                </div>
                            </div>
                </div>
                )
            }
              {policyTitleForAcceptable && (
                <div>
                            <div className="privacy-security-policy-container">
                                <div className="policy-header">
                                    <h1>{policyTitleForAcceptable}:</h1>
                                    <div>
                                        <p>{policyTextForAcceptable}</p>
                                    </div>
                                </div>
                            </div>
                </div>
                )
            }
        </div>
    );
};

export default Security;