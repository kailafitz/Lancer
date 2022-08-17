import React from "react";
import { Container, Col, Row } from "react-bootstrap";
import { UpdateBankAccountDetails } from "../components/UpdateBankAccountDetails";
import { UpdatePersonalDetails } from "../components/UpdatePersonalDetails";
import styled from "styled-components";

const StyledContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const StyledCol = styled(Col)`
    border-top: #8DB5B3 2px solid;
    border-left: none;

    @media only screen and (min-width: 768px) {
        border-left: #8DB5B3 2px solid;
        border-top: none;
    }
`

export const Settings = () => {
    return (
        <StyledContainer className="flex-grow-1">
            <Row><Col xs={12} className="mb-5 mt-5 mt-md-0 text-center">
                <h1>Settings</h1>
                <h6 className="mb-md-5">Set the record straight</h6>
            </Col></Row>
            <Row className="justify-content-center">
                <Col xs={11} md={6}>
                    <UpdateBankAccountDetails />
                </Col>
                <StyledCol xs={11} md={6} className="mt-5 pt-5 mt-md-0 pt-md-0">
                    <UpdatePersonalDetails />
                </StyledCol>
            </Row>
        </StyledContainer>
    )
}
