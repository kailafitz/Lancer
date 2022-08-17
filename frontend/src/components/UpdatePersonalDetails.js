import React, { useState, useEffect } from "react";
import axios from "axios";
import useToken from "../helpers/useToken";
import { Button, Container, Row, Col, Form, Modal, Table } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { BiEdit } from "react-icons/bi";
import { ErrorMessage } from "../components/ErrorMessage";

const personalDetailsSchema = yup.object({
    vatNumber: yup.string().required("This is required"),
}).required();

export const UpdatePersonalDetails = () => {
    const { token } = useToken();
    const [data, setData] = useState([]);
    const [dataCheck, setDataCheck] = useState(false);
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const { register, handleSubmit, clearErrors, setValue, formState: { errors } } = useForm({
        mode: "onBlur",
        reValidateMode: "onSubmit",
        resolver: yupResolver(personalDetailsSchema)
    });

    useEffect(() => {
        if (Object.keys(data).length <= 0) {
            axios.get("https://cs50-lancer.herokuapp.com/api/personal-details", {
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
        if (Object.keys(data).length > 0) {
            setDataCheck(true);
        }
    }, [data])

    const onSubmit = (e) => {
        e.preventDefault();
        const vat_number = e.target[0].value;
        axios.put("https://cs50-lancer.herokuapp.com/api/personal-details", { "vat_number": vat_number }, {
            headers: {
                Authorization: "Bearer " + token,
                "Access-Control-Allow-Origin": "*"
            }
        }).then((response) => {
            setErrorMessage("");
            setShow(false);
            if (errors) {
                clearErrors();
            }
            setData(response.data);
        }).catch((e) => {
            let string = "";
            string = e.response.data.message;
            setErrorMessage(string);
        });
    }

    const handleCancel = () => {
        setErrorMessage("");
        setShow(false);
        setValue("vatNumber", data.vat_number);
        if (errors) {
            clearErrors();
        }
    };
    const handleShow = () => setShow(true);

    return (
        <Container className="mb-5">
            <Row className="d-flex justify-content-center">
                <Col xs={11} md={9}>
                    {dataCheck ? (
                        <>
                            <h5 className="mb-5 text-start d-flex align-items-center">Personal Details<BiEdit className="ms-2 hover" onClick={handleShow} /></h5>
                            <Table striped borderless>
                                <thead>
                                    <tr>
                                        <th>VAT #</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{data.vat_number}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </>
                    ) :
                        <h5>No personal details found</h5>
                    }


                    <Modal show={show} onHide={handleCancel} backdrop="static" centered>
                        <form onSubmit={(e) => handleSubmit(onSubmit(e))}>
                            <Modal.Header>
                                <Modal.Title>Update Personal Details</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form.Group className="mb-3" controlId="">
                                    <Form.Label>VAT #</Form.Label>
                                    <Form.Control type="string" name="vat_number" placeholder="vat #" defaultValue={data.vat_number} {...register("vatNumber")} />
                                    {errors ? <p className="text-danger pt-1">{errors.vatNumber?.message}</p> : null}
                                </Form.Group>
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
                    </Modal>
                </Col>
            </Row>
        </Container>
    )
}
