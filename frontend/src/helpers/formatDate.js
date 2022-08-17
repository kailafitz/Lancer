const formatDate = (param) => {
    let date = new Date(param);
    let year = date.getFullYear();
    let day = date.getDate();
    let month = date.getMonth() + 1;

    return day + " - " + month + " - " + year;
}

export default formatDate;
