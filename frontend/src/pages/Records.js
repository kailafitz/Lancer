import React, { useState, useEffect } from "react";
import { Container, Table, Row, Col, Button } from "react-bootstrap";
import axios from "axios";
import useToken from "../helpers/useToken";
import styled from "styled-components";
import formatDate from "../helpers/formatDate";
import formatter from "../helpers/formatCurrency";
import NotFound from "../media/not-found.json";
import Lottie from "lottie-react";
import { UpdateRecord } from "../components/UpdateJob";
import { DeleteJob } from "../components/DeleteJob";

const StyledContainer = styled(Container)`
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    padding-top: 10vh;

    @media only screen and (min-width: 728px) {
        padding-top: 0;
    }  
`

const StyledCol = styled(Col)`
    height: 55vh;
`

const Styledthead = styled.thead`
    position: sticky;
    top: 0;
    background-color: #d6d6d6;
`

const StyledButton = styled(Button)`
    white-space: pre;
`

export const Records = () => {
    const [data, setData] = useState([]);
    const { token } = useToken();

    useEffect(() => {
        axios.get("https://kailafitz.pythonanywhere.com/api/records", {
            headers: {
                Authorization: "Bearer " + token,
                "Access-Control-Allow-Origin": "*"
            }
        }).then((response) => {
            setData(response.data);
        }).catch((e) =>
            console.log(e)
        );
    }, []);

    return (
        <StyledContainer>
            <Row className="d-flex flex-column justify-content-center">
                {data.length > 0 ?
                    (
                        <>
                            <Col xs={12} className="mb-4 text-center">
                                <h1>Records</h1>
                                <h6>View all your jobs here</h6>
                            </Col>
                            <StyledCol xs={9} sm={12} className="overflow-scroll mx-auto">
                                <Table borderless hover className="py-3 align-middle">
                                    <Styledthead>
                                        <tr>
                                            <th>Employer</th>
                                            <th>Job</th>
                                            <th>Gross</th>
                                            <th>Tax</th>
                                            <th>Net</th>
                                            <th>Date_Created</th>
                                            <th className="d-none d-xl-table-cell">Invoice</th>
                                            <th>Actions</th>
                                        </tr>
                                    </Styledthead>
                                    <tbody className="mt-5">
                                        {data.map((record) => {
                                            return (
                                                <tr key={record.id}>
                                                    <td>{record.employer_name}</td>
                                                    <td>{record.job_description}</td>
                                                    <td>{formatter.format(record.gross_pay)}</td>
                                                    <td>{formatter.format(record.tax_due)}</td>
                                                    <td>{formatter.format(record.net_pay)}</td>
                                                    <td>{formatDate(record.date_created)}</td>
                                                    <td className="d-none d-xl-table-cell text-center">
                                                        <StyledButton href={`/records/invoice_${record.id}`} target="_blank" className="w-100">View Invoice</StyledButton>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex flex-row justify-content-between">
                                                            <UpdateRecord id={record.id} />
                                                            <DeleteJob id={record.id} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </Table>
                            </StyledCol> </>)
                    : <Col xs={12} md={6} className="text-center mx-auto">
                        <Lottie animationData={NotFound} loop={true} className="w-50 mx-auto" />
                        <h5>No records found</h5>
                        <a className="text-primary" href="/add-job">Add a job</a></Col>}
            </Row>
        </StyledContainer >
    )
}
