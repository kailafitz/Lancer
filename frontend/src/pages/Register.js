import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import useToken from "../helpers/useToken";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ErrorMessage } from "../components/ErrorMessage";
import styled from "styled-components";
import { Stepper, Step } from "react-form-stepper";

const StyledContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 5vh;
  flex-grow: 1;
`

const registerSchema = yup.object({
  username: yup.string().required("This is required"),
  email: yup.string().email("This must be an email address").required("This is required"),
  password: yup.string().required("This is required").min(8, "This must be at least 8 characters"),
  confirmPassword: yup.string().required("This is required").min(8, "This must be at least 8 characters"),
  firstName: yup.string().required("This is required"),
  lastName: yup.string().required("This is required"),
  bic: yup.string().required("This is required"),
  iban: yup.string().required("This is required"),
  vatNumber: yup.string().required("This is required"),
  line1: yup.string().required("This is required"),
  line2: yup.string().required("This is required"),
  town: yup.string().required("This is required"),
  region: yup.string().required("This is required"),
  country: yup.string().required("This is required"),
}).required();

const StepStyleDTO = {
  "activeBgColor": "#90baca",
  "completedBgColor": "#90baca"
}

const ConnectorStyleProps = {
  "activeColor": "#90baca",
  "completeColor": "#90baca"
}

export const Register = () => {
  const { setToken } = useToken();
  const [errorMessage, setErrorMessage] = useState("");
  const [step, setStep] = useState(0);
  const [agreement, setAgreement] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    mode: "onChange",
    reValidateMode: "onSubmit",
    resolver: yupResolver(registerSchema)
  });

  const onSubmit = (e) => {
    e.preventDefault();
    const username = e.target[3].value;
    const email = e.target[4].value;
    const password = e.target[5].value;
    const confirm_password = e.target[6].value;
    const first_name = e.target[7].value;
    const last_name = e.target[8].value;
    const bic = e.target[9].value;
    const iban = e.target[10].value;
    const vat_number = e.target[11].value;
    const line_1 = e.target[12].value;
    const line_2 = e.target[13].value;
    const town = e.target[14].value;
    const region = e.target[15].value;
    const country = e.target[16].value;
    axios.post("https://cs50-lancer.herokuapp.com/api/register", { "username": username, "email": email, "password": password, "confirm_password": confirm_password, "first_name": first_name, "last_name": last_name, "bic": bic, "iban": iban, "vat_number": vat_number, "line_1": line_1, "line_2": line_2, "town": town, "region": region, "country": country }).then(response => {
      setToken(response.data.access_token);
      window.location.href = "https://cs50-lancer.herokuapp.com/records";
    }).catch((e) => {
      let string = "";
      string = e.response.data.message;
      setErrorMessage(string);
    })
  }

  return (
    <StyledContainer>
      <form onSubmit={(e) => handleSubmit(onSubmit(e))}>
        <Row className="justify-content-center">
          <Col xs={12} className="mb-4 text-center">
            <h1>Register</h1>
            <h6>Sign up for your own invoicing system</h6>
          </Col>
        </Row>
        <Row className="justify-content-center mb-2">
          <Col xs={12}>
            <Stepper activeStep={step} styleConfig={StepStyleDTO} connectorStyleConfig={ConnectorStyleProps}>
              <Step label="Sign up" />
              <Step label="Bank Account" />
              <Step label="Address" />
            </Stepper>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col xs={9} md={5} lg={3}>
            <div className={step === 0 ? "d-block" : "d-none"}>
              <Form.Group className="mb-3" controlId="registerUsername">
                <Form.Control type="text" placeholder="username" name="username" {...register("username")} />
                {errors ? <p className="text-danger pt-1">{errors.username?.message}</p> : null}
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerEmail">
                <Form.Control type="email" placeholder="email" name="email" {...register("email")} />
                {errors ? <p className="text-danger pt-1">{errors.email?.message}</p> : null}
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerPassword">
                <Form.Control type="password" placeholder="password" name="password" {...register("password")} />
                {errors ? <p className="text-danger pt-1">{errors.password?.message}</p> : null}
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerconfirm_password">
                <Form.Control type="password" placeholder="confirm password" name="confirm_password" {...register("confirmPassword")} />
                {errors ? <p className="text-danger pt-1">{errors.confirmPassword?.message}</p> : null}
              </Form.Group>
            </div>

            <div className={step === 1 ? "d-block" : "d-none"}>
              <Form.Group className="mb-3" controlId="registerfirst_name">
                <Form.Control type="string" name="first_name" placeholder="first name" {...register("firstName")} />
                {errors ? <p className="text-danger pt-1">{errors.firstName?.message}</p> : null}
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerlast_name">
                <Form.Control type="string" name="last_name" placeholder="last name" {...register("lastName")} />
                {errors ? <p className="text-danger pt-1">{errors.lastName?.message}</p> : null}
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerBIC">
                <Form.Control type="string" name="bic" placeholder="bic" {...register("bic")} />
                {errors ? <p className="text-danger pt-1">{errors.bic?.message}</p> : null}
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerIBAN">
                <Form.Control type="string" name="iban" placeholder="iban" {...register("iban")} />
                {errors ? <p className="text-danger pt-1">{errors.iban?.message}</p> : null}
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerVATNumber">
                <Form.Control type="string" name="vat_number" placeholder="vat #" {...register("vatNumber")} />
                {errors ? <p className="text-danger pt-1">{errors.vatNumber?.message}</p> : null}
              </Form.Group>
            </div>

            <div className={step === 2 ? "d-block" : "d-none"}>
              <Form.Group className="mb-3" controlId="registerline_1">
                <Form.Control type="string" name="line_1" placeholder="line 1" {...register("line1")} />
                {errors ? <p className="text-danger pt-1">{errors.line1?.message}</p> : null}
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerline_2">
                <Form.Control type="string" name="line_2" placeholder="line 2" {...register("line2")} />
                {errors ? <p className="text-danger pt-1">{errors.line2?.message}</p> : null}
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerTown">
                <Form.Control type="string" name="town" placeholder="town" {...register("town")} />
                {errors ? <p className="text-danger pt-1">{errors.town?.message}</p> : null}
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerCounty">
                <Form.Control type="string" name="region" placeholder="region" {...register("region")} />
                {errors ? <p className="text-danger pt-1">{errors.region?.message}</p> : null}
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerCounty">
                <Form.Control type="string" name="country" placeholder="country" {...register("country")} />
                {errors ? <p className="text-danger pt-1">{errors.country?.message}</p> : null}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="Terms and Conditions"
                  onChange={() => setAgreement(!agreement)}
                  checked={agreement}
                />
              </Form.Group>
            </div>
          </Col>
        </Row>
        <Row className="justify-content-center mb-5">
          <Col xs={9} md={5} lg={3}>
            {
              errorMessage ?
                <ErrorMessage message={errorMessage} /> : null}
            <Row className="justify-content-between">
              <Col xs={5} lg={3}>
                <Button variant="outline-primary" onClick={() => { setStep(step - 1); setAgreement(false); }} disabled={step === 0 ? true : false}>Previous</Button>
              </Col>
              {step !== 2 ?
                <Col xs={5} lg={3} className="d-flex justify-content-end">
                  <Button variant="primary" onClick={() => setStep(step + 1)}>Next</Button>
                </Col> :
                <Col xs={5} className="text-end">
                  <Button type="submit" disabled={!agreement}>Register</Button>
                </Col>
              }
            </Row>
          </Col>
        </Row>
      </form >
    </StyledContainer >
  )
}
