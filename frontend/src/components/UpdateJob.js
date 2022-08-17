import React, { useState, useEffect } from "react";
import useToken from "../helpers/useToken";
import axios from "axios";
import { Button, Modal, Form } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ErrorMessage } from "../components/ErrorMessage";
import { BiEdit } from "react-icons/bi";
import { BsCalendar3 } from "react-icons/bs";
import DatePicker from "react-date-picker";
import styled from "styled-components";

const StyledIcon = styled(BiEdit)`
    width: 1.3rem;
    height: 1.3rem;
`
const StyledButton = styled(Button)`
    width: fit-content;

    @media only screen and (min-width: 728px) {
        width: 100%;
    }  
`

const updateJobSchema = yup.object({
    jobDescription: yup.string().required("This is required"),

    grossPay: yup.number().required("This is required").min(1, "An amount > 1 is required").typeError("This is required"),
    dateCreated: yup.date().required("This is required"),
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

export const UpdateRecord = ({ id }) => {
    const { token } = useToken();
    const [show, setShow] = useState(false);
    const [dataCheck, setDataCheck] = useState(false);
    const [data, setData] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [employerCheck, setEmployerCheck] = useState(false);

    const { register, handleSubmit, control, clearErrors, watch, setValue, setError, formState: { errors } } = useForm({
        mode: "onBlur",
        reValidateMode: "onSubmit",
        resolver: yupResolver(updateJobSchema)
    });

    useEffect(() => {
        if (Object.keys(data).length <= 0) {
            axios.get(`https://cs50-lancer.herokuapp.com/api/records/update/${id}`, {
                headers: {
                    Authorization: "Bearer " + token,
                    "Access-Control-Allow-Origin": "*"
                }
            }).then((response) => {
                console.log(response);
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
        const date = e.target[2].value;
        let employer_name = "";
        let employer_line_1 = "";
        let employer_line_2 = "";
        let employer_town = "";
        let employer_region = "";
        let employer_country = "";

        if (employerCheck === true) {
            employer_name = watch("employerName");
            employer_line_1 = watch("employerLine1");
            employer_line_2 = watch("employerLine2");
            employer_town = watch("employerTown");
            employer_region = watch("employerRegion");
            employer_country = watch("employerCountry");
        }
        else {
            employer_name = watch("employerSelect");

            if (data[1].length > 1) {
                for (let i = 0; i < data.length; i++) {
                    if (data[1][i].employer_name === employer_name) {
                        employer_line_1 = data[1][i].employer_line_1;
                        employer_line_2 = data[1][i].employer_line_2;
                        employer_town = data[1][i].employer_town;
                        employer_region = data[1][i].employer_region;
                        employer_country = data[1][i].employer_country;
                    }
                }
            }
            else {
                if (data[1].employer_name === employer_name) {
                    employer_line_1 = data[1].employer_line_1;
                    employer_line_2 = data[1].employer_line_2;
                    employer_town = data[1].employer_town;
                    employer_region = data[1].employer_region;
                    employer_country = data[1].employer_country;
                }
            }
        }

        axios.put(`https://cs50-lancer.herokuapp.com/api/records/update/${id}`, { "job_description": job_description, "gross_pay": gross_pay, "date_created": date, "employer_name": employer_name, "employer_line_1": employer_line_1, "employer_line_2": employer_line_2, "employer_town": employer_town, "employer_region": employer_region, "employer_country": employer_country }, {
            headers: {
                Authorization: "Bearer " + token,
                "Access-Control-Allow-Origin": "*"
            }
        }).then(() => {
            setErrorMessage("");
            setShow(false);
            if (errors) {
                clearErrors();
            }
            window.location.href = "https://cs50-lancer.herokuapp.com/records";
        }).catch((e) => {
            let string = "";
            string = e.response.data.message;
            setErrorMessage(string);
        });
    }

    console.log(errors);

    const handleCancel = () => {
        setErrorMessage("");
        setShow(false);
        setValue("jobDescription", data[0].job_description);
        setValue("grossPay", data[0].gross_pay);
        setValue("dateCreated", new Date(data[0].date_created));
        setValue("employerSelect", data[0].employer_name);
        if (errors) {
            clearErrors();
        }
    };
    const handleShow = () => setShow(true);

    return (
        <>
            <StyledButton variant="secondary" className="me-1" onClick={handleShow}><StyledIcon className="text-dark" /></StyledButton>
            <Modal show={show} onHide={handleCancel} backdrop="static" centered>
                {dataCheck ? <>
                    <Modal.Header>
                        <Modal.Title>Update this job</Modal.Title>
                    </Modal.Header>
                    <form onSubmit={(e) => handleSubmit(onSubmit(e))}>
                        <Modal.Body>

                            <Form.Group className="mb-3" controlId="">
                                <Form.Label>Job Description</Form.Label>
                                <Form.Control type="string" name="job_description" placeholder="job description" {...register("jobDescription")} defaultValue={data[0].job_description} />
                                {errors ? <p className="text-danger pt-1">{errors.jobDescription?.message}</p> : null}
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="">
                                <Form.Label>Gross Pay</Form.Label>
                                <Form.Control type="number" min={0} step=".01" name="gross_pay" placeholder="gross income" {...register("grossPay")} defaultValue={data[0].gross_pay} />
                                {errors ? <p className="text-danger pt-1">{errors.grossPay?.message}</p> : null}
                            </Form.Group>

                            <Form.Group controlId="">
                                <Form.Label className="d-block">Date</Form.Label>
                                <Controller
                                    control={control}
                                    name="dateCreated"
                                    defaultValue={new Date(data[0].date_created)}
                                    render={({
                                        field: { onChange, onBlur, value },
                                    }) => (
                                        <DatePicker onChange={onChange} value={value} onBlur={onBlur} calendarIcon={<BsCalendar3 />} maxDate={new Date()} className="d-block form-control" />
                                    )}
                                />
                            </Form.Group>

                            <hr className="my-5 w-75 mx-auto" />

                            <h5>Employer Details</h5>

                            {data.length > 0 && dataCheck ? (
                                <>
                                    <Form.Select aria-label="select" className="mb-3" disabled={employerCheck} {...register("employerSelect")} defaultValue={data[0].employer_name}>
                                        <option>{data[0].employer_name}</option>
                                        <hr className="bg-primary p-1 my-2" />
                                        {data[1].map((employer) => { return <option key={employer.employer_name} value={employer.employer_name}>{employer.employer_name}</option> }
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
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="danger" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                Save Changes
                            </Button>
                        </Modal.Footer>
                    </form>
                </> : <h5 className="p-5">Something went wrong</h5>}
            </Modal>
        </>

    )
}
