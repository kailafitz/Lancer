import React, { useEffect, useState } from "react";
import axios from "axios";
import useToken from "../helpers/useToken";
import { Button, Container, Row, Col, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ErrorMessage } from "../components/ErrorMessage";
import styled from "styled-components";

const StyledContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 5vh;
  margin-bottom: 5vh;
`

const addJobSchema = yup.object({
  jobDescription: yup.string().required("This is required"),
  grossPay: yup.number().required("This is required").min(1, "An amount > 1 is required").typeError("This is required"),
  employerCheck: yup.boolean(),
  employerSelect: yup.string().when("employerCheck", {
    is: false,
    then: yup.string().required("This is required")
  }),
  employerName: yup.string().when("employerCheck", {
    is: true,
    then: yup.string().required("This is required")
  }),
  employerLine1: yup.string().when("employerCheck", {
    is: true,
    then: yup.string().required("This is required")
  }),
  employerLine2: yup.string().when("employerCheck", {
    is: true,
    then: yup.string().required("This is required")
  }),
  employerTown: yup.string().when("employerCheck", {
    is: true,
    then: yup.string().required("This is required")
  }),
  employerRegion: yup.string().when("employerCheck", {
    is: true,
    then: yup.string().required("This is required")
  }),
  employerCountry: yup.string().when("employerCheck", {
    is: true,
    then: yup.string().required("This is required")
  }),
}).required();

export const AddJob = () => {
  const [data, setData] = useState([]);
  const { token } = useToken();
  const [errorMessage, setErrorMessage] = useState("");
  const [dataCheck, setDataCheck] = useState(false);
  const [employerCheck, setEmployerCheck] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    mode: "onBlur",
    reValidateMode: "onSubmit",
    resolver: yupResolver(addJobSchema)
  });

  useEffect(() => {
    if (Object.keys(data).length <= 0) {
      axios.get("https://kailafitz.pythonanywhere.com/api/add-job", {
        headers: {
          Authorization: "Bearer " + token,
          "Access-Control-Allow-Origin": "*"
        }
      }).then((response) => {
        setData(response.data);
      });
    }
  }, [data]);

  useEffect(() => {
    if (data.length > 0) {
      setDataCheck(true);
    }
  }, [data])

  const onSubmit = (e) => {
    e.preventDefault();
    const job_description = e.target[0].value;
    const gross_pay = e.target[1].value === "" ? 0.0 : e.target[1].value;
    let employer_name = "";
    let employer_line_1 = "";
    let employer_line_2 = "";
    let employer_town = "";
    let employer_region = "";
    let employer_country = "";

    if (data.message === "No employers found") {
      employer_name = e.target[2].value;
      employer_line_1 = e.target[3].value;
      employer_line_2 = e.target[4].value;
      employer_town = e.target[5].value;
      employer_region = e.target[6].value;
      employer_country = e.target[7].value;
    }
    else if (employerCheck === true) {
      employer_name = e.target[4].value;
      employer_line_1 = e.target[5].value;
      employer_line_2 = e.target[6].value;
      employer_town = e.target[7].value;
      employer_region = e.target[8].value;
      employer_country = e.target[9].value;
    }
    else {
      employer_name = watch("employerSelect");

      for (let i = 0; i < data.length; i++) {
        if (data[i].employer_name === employer_name) {
          employer_line_1 = data[i].employer_line_1;
          employer_line_2 = data[i].employer_line_2;
          employer_town = data[i].employer_town;
          employer_region = data[i].employer_region;
          employer_country = data[i].employer_country;
        }
      }
    }

    axios.post("https://kailafitz.pythonanywhere.com/api/add-job", { "job_description": job_description, "gross_pay": gross_pay, "employer_name": employer_name, "employer_line_1": employer_line_1, "employer_line_2": employer_line_2, "employer_town": employer_town, "employer_region": employer_region, "employer_country": employer_country }, {
      headers: {
        Authorization: "Bearer " + token,
        "Access-Control-Allow-Origin": "*"
      }
    }).then(() => {
      window.location.href = "https://kailafitz.pythonanywhere.com/records";
    }).catch((e) => {
      let string = "";
      string = e.response.data.message;
      setErrorMessage(string);
    });
  }

  return (
    <StyledContainer className="flex-grow-1">
      <Row className="justify-content-center">
        <Col xs={10} className="mb-4 text-center">
          <h1>New Job</h1>
          <h6>Insert your gross pay and we will calculate the tax due</h6>
        </Col>
        <Col xs={10} md={5} lg={3}>
          <form onSubmit={(e) => handleSubmit(onSubmit(e))}>
            <Form.Group className="mb-3" controlId="">
              <Form.Control type="string" name="job_description" placeholder="job description" {...register("jobDescription")} />
              {errors ? <p className="text-danger pt-1">{errors.jobDescription?.message}</p> : null}
            </Form.Group>

            <Form.Group className="mb-3" controlId="">
              <Form.Control type="number" min={0} step=".01" name="gross_pay" placeholder="gross income" {...register("grossPay")} />
              {errors ? <p className="text-danger pt-1">{errors.grossPay?.message}</p> : null}
            </Form.Group>

            <hr className="my-5 w-75 mx-auto" />

            <h5>Employer Details</h5>

            {data.length > 0 && dataCheck ? (
              <>
                <Form.Select aria-label="select" className="mb-3" disabled={employerCheck} {...register("employerSelect")}>
                  <option>Select an employer</option>
                  {data.map((employer) => { return <option key={employer.employer_name} value={employer.employer_name}>{employer.employer_name}</option> }
                  )}
                </Form.Select>
                {errors ? <p className="text-danger pt-1">{errors.employerSelect?.message}</p> : null}
              </>
            ) : null}

            {data.length !== 0 && data.message !== "No employers found" ?
              <Form.Check
                type="switch"
                id="employer-switch"
                label="Add new employer"
                className="mb-3"
                value={employerCheck}
                onChange={() => setEmployerCheck(!employerCheck)}
              /> : null}

            {employerCheck === true || data.message === "No employers found" ? <>
              <Form.Group className="mb-3" controlId="">
                <Form.Control type="string" name="employer_name" placeholder="employer name" {...register("employerName")} />
                {errors ? <p className="text-danger pt-1">{errors.employerName?.message}</p> : null}
              </Form.Group>
              <Form.Group className="mb-3" controlId="">
                <Form.Control type="string" name="employer_line_1" placeholder="line 1" {...register("employerLine1")} />
                {errors ? <p className="text-danger pt-1">{errors.employerLine1?.message}</p> : null}
              </Form.Group>
              <Form.Group className="mb-3" controlId="">
                <Form.Control type="string" name="employer_line_2" placeholder="line 2" {...register("employerLine2")} />
                {errors ? <p className="text-danger pt-1">{errors.employerLine2?.message}</p> : null}
              </Form.Group>
              <Form.Group className="mb-3" controlId="">
                <Form.Control type="string" name="employer_town" placeholder="town" {...register("employerTown")} />
                {errors ? <p className="text-danger pt-1">{errors.employerTown?.message}</p> : null}
              </Form.Group>
              <Form.Group className="mb-3" controlId="">
                <Form.Control type="string" name="employer_region" placeholder="region" {...register("employerRegion")} />
                {errors ? <p className="text-danger pt-1">{errors.employerRegion?.message}</p> : null}
              </Form.Group>
              <Form.Group className="mb-3" controlId="">
                <Form.Control type="string" name="employer_country" placeholder="country" {...register("employerCountry")} />
                {errors ? <p className="text-danger pt-1">{errors.employerCountry?.message}</p> : null}
              </Form.Group></> : null}
            {errorMessage ?
              <ErrorMessage message={errorMessage} /> : null}

            <Button variant="primary" type="submit" className="w-100">
              Add job record
            </Button>
          </form>
        </Col>
      </Row>
    </StyledContainer>
  );
};
