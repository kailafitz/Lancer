import React, { useState, useEffect } from "react";
import axios from "axios";
import useToken from "../helpers/useToken";
import { Button, Container, Row, Col, Form, Modal, Table } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { BiEdit } from "react-icons/bi";
import { ErrorMessage } from "../components/ErrorMessage";

const bankAccountSchema = yup.object({
    bic: yup.string().required("This is required"),
    iban: yup.string().required("This is required"),
}).required();

export const UpdateBankAccountDetails = () => {
    const { token } = useToken();
    const [data, setData] = useState([]);
    const [dataCheck, setDataCheck] = useState(false);
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const { register, handleSubmit, clearErrors, setValue, formState: { errors } } = useForm({
        mode: "onBlur",
        reValidateMode: "onSubmit",
        resolver: yupResolver(bankAccountSchema)
    });

    useEffect(() => {
        if (Object.keys(data).length <= 0) {
            axios.get("https://cs50-lancer.herokuapp.com/api/bank-details", {
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
        const bic = e.target[0].value;
        const iban = e.target[1].value;
        axios.put("https://cs50-lancer.herokuapp.com/bank-details", { "bic": bic, "iban": iban }, {
            headers: {
                Authorization: "Bearer " + token,
                "Access-Control-Allow-Origin": "*"
            }
        }).then((response) => {
            setData(response.data);
            setErrorMessage("");
            setShow(false);
            if (errors) {
                clearErrors();
            }
        }).catch((e) => {
            let string = "";
            string = e.response.data.message;
            setErrorMessage(string);
        });
    }

    const handleCancel = () => {
        setErrorMessage("");
        setShow(false);
        setValue("bic", data.bic);
        setValue("iban", data.iban);
        if (errors) {
            clearErrors();
        }
    };
    const handleShow = () => setShow(true);

    return (
        <Container>
            <Row className="d-flex justify-content-center">
                <Col xs={11} md={9}>
                    {dataCheck || data !== "" ? (
                        <>
                            <h5 className="mb-5 text-start d-flex align-items-center">Bank Account Details <BiEdit className="ms-2 hover" onClick={handleShow} /></h5>
                            <Table striped borderless>
                                <thead>
                                    <tr>
                                        <th>BIC</th>
                                        <th>IBAN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{data.bic}</td>
                                        <td>{data.iban}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </>
                    ) :
                        <h5>No bank details found</h5>
                    }


                    <Modal show={show} onHide={handleCancel} backdrop="static" centered>
                        <form onSubmit={(e) => handleSubmit(onSubmit(e))}>
                            <Modal.Header>
                                <Modal.Title>Update Bank Details</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form.Group className="mb-3" controlId="">
                                    <Form.Label>BIC</Form.Label>
                                    <Form.Control type="string" name="bic" placeholder="bic" defaultValue={data.bic} {...register("bic")} />
                                    {errors ? <p className="text-danger pt-1">{errors.bic?.message}</p> : null}
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="">
                                    <Form.Label>IBAN</Form.Label>
                                    <Form.Control type="string" name="iban" placeholder="iban" defaultValue={data.iban} {...register("iban")} />
                                    {errors ? <p className="text-danger pt-1">{errors.iban?.message}</p> : null}
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
